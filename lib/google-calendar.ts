const OAUTH_BASE = "https://oauth2.googleapis.com";
const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";

// ── OAuth ────────────────────────────────────────────────────

export function buildAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    ...(state ? { state } : {}),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCode(
  code: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const res = await fetch(`${OAUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) throw new Error(`OAuth token exchange failed: ${await res.text()}`);
  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(`${OAUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// ── Calendar ─────────────────────────────────────────────────

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string; // Ex: "Seg 14/04 às 14h"
}

/** Busca horários livres nos próximos {days} dias úteis */
export async function getAvailableSlots(
  accessToken: string,
  calendarId: string,
  days = 7
): Promise<TimeSlot[]> {
  const now = new Date();
  const until = new Date(now);
  until.setDate(until.getDate() + days);

  // Busca eventos existentes no período
  const url = new URL(`${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events`);
  url.searchParams.set("timeMin", now.toISOString());
  url.searchParams.set("timeMax", until.toISOString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Calendar API error: ${await res.text()}`);
  const data = await res.json();

  const busyBlocks: Array<{ start: Date; end: Date }> = (data.items ?? [])
    .filter((e: CalendarEvent) => e.status !== "cancelled")
    .map((e: CalendarEvent) => ({
      start: new Date(e.start?.dateTime ?? e.start?.date ?? ""),
      end: new Date(e.end?.dateTime ?? e.end?.date ?? ""),
    }));

  // Gera slots de 1h entre 8h e 18h nos dias úteis
  const slots: TimeSlot[] = [];
  const cursor = new Date(now);
  cursor.setMinutes(0, 0, 0);
  cursor.setHours(cursor.getHours() + 1); // começa na próxima hora cheia

  while (cursor < until && slots.length < 8) {
    const dow = cursor.getDay();
    const hour = cursor.getHours();

    // Apenas seg-sáb, 8h–17h (último slot às 17h)
    if (dow !== 0 && hour >= 8 && hour < 18) {
      const slotEnd = new Date(cursor);
      slotEnd.setHours(slotEnd.getHours() + 1);

      const isBusy = busyBlocks.some(
        (b) => cursor < b.end && slotEnd > b.start
      );

      if (!isBusy) {
        slots.push({
          start: new Date(cursor),
          end: slotEnd,
          label: formatSlotLabel(cursor),
        });
      }
    }

    cursor.setHours(cursor.getHours() + 1);
    if (cursor.getHours() >= 18) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(8, 0, 0, 0);
    }
  }

  return slots;
}

/** Cria evento no Google Calendar */
export async function createEvent(
  accessToken: string,
  calendarId: string,
  title: string,
  start: Date,
  end: Date,
  description?: string
): Promise<string> {
  const res = await fetch(
    `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: title,
        description,
        start: { dateTime: start.toISOString(), timeZone: "America/Sao_Paulo" },
        end: { dateTime: end.toISOString(), timeZone: "America/Sao_Paulo" },
      }),
    }
  );

  if (!res.ok) throw new Error(`Create event failed: ${await res.text()}`);
  const event = await res.json();
  return event.id;
}

// ── Helpers ──────────────────────────────────────────────────

function formatSlotLabel(date: Date): string {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const day = days[date.getDay()];
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  return `${day} ${d}/${m} às ${h}h`;
}

interface CalendarEvent {
  status?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}
