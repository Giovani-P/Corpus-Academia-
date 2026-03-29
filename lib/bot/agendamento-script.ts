import { prisma } from "@/lib/prisma";
import {
  getAvailableSlots,
  createEvent,
  refreshAccessToken,
  type TimeSlot,
} from "@/lib/google-calendar";

export type AgendamentoStep =
  | "INICIO"
  | "AGUARDANDO_ESCOLHA"
  | "CONFIRMANDO"
  | "CONCLUIDO";

interface AgendamentoData {
  slots?: string; // JSON de TimeSlot[]
  escolha?: string; // índice escolhido
  nomeAluno?: string;
}

interface AgendamentoSettings {
  googleAccessToken?: string | null;
  googleRefreshToken?: string | null;
  googleCalendarId?: string | null;
  googleConnected?: boolean | null;
  academiaName?: string | null;
  whatsappPhoneNumberId?: string | null;
  whatsappAccessToken?: string | null;
}

export async function buildAgendamentoResponse(
  step: AgendamentoStep,
  incomingMsg: string,
  phone: string,
  data: AgendamentoData,
  settings: AgendamentoSettings
): Promise<{ nextStep: AgendamentoStep; reply: string; updatedData: AgendamentoData }> {
  const msg = incomingMsg.trim().toLowerCase();

  if (msg === "menu" || msg === "0") {
    return { nextStep: "INICIO", reply: await buildMenuMsg(settings), updatedData: data };
  }

  switch (step) {
    case "INICIO": {
      // Verifica se Google Calendar está conectado
      if (!settings.googleConnected || !settings.googleAccessToken) {
        return {
          nextStep: "INICIO",
          reply:
            "Desculpe, o agendamento online não está disponível no momento. Entre em contato diretamente com a academia para agendar.",
          updatedData: data,
        };
      }

      let accessToken = settings.googleAccessToken;

      // Tenta renovar o token se necessário
      if (settings.googleRefreshToken) {
        try {
          accessToken = await refreshAccessToken(settings.googleRefreshToken);
          // Atualiza token no banco de forma assíncrona
          prisma.settings
            .updateMany({ data: { googleAccessToken: accessToken } })
            .catch(console.error);
        } catch {
          // Usa o token atual mesmo
        }
      }

      let slots: TimeSlot[] = [];
      try {
        slots = await getAvailableSlots(
          accessToken,
          settings.googleCalendarId ?? "primary"
        );
      } catch {
        return {
          nextStep: "INICIO",
          reply:
            "Não consegui acessar a agenda no momento. Tente novamente em alguns instantes.",
          updatedData: data,
        };
      }

      if (slots.length === 0) {
        return {
          nextStep: "INICIO",
          reply:
            "Não encontrei horários disponíveis nos próximos 7 dias. Entre em contato diretamente com a academia para agendar.",
          updatedData: data,
        };
      }

      const slotsText = slots
        .slice(0, 6)
        .map((s, i) => `${i + 1}️⃣ ${s.label}`)
        .join("\n");

      return {
        nextStep: "AGUARDANDO_ESCOLHA",
        reply:
          `📅 *Horários disponíveis com o Rafa:*\n\n${slotsText}\n\n` +
          `_(Digite o número do horário que preferir)_`,
        updatedData: { ...data, slots: JSON.stringify(slots.slice(0, 6)) },
      };
    }

    case "AGUARDANDO_ESCOLHA": {
      const slots: TimeSlot[] = JSON.parse(data.slots ?? "[]").map(
        (s: { start: string; end: string; label: string }) => ({
          ...s,
          start: new Date(s.start),
          end: new Date(s.end),
        })
      );

      const idx = parseInt(msg) - 1;
      if (isNaN(idx) || idx < 0 || idx >= slots.length) {
        const nums = slots.map((_, i) => i + 1).join(", ");
        return {
          nextStep: "AGUARDANDO_ESCOLHA",
          reply: `Por favor, digite um número entre ${nums}.`,
          updatedData: data,
        };
      }

      const chosen = slots[idx];
      return {
        nextStep: "CONFIRMANDO",
        reply:
          `Você escolheu:\n📅 *${chosen.label}*\n\n` +
          `Qual é o seu *nome completo* para confirmar o agendamento?`,
        updatedData: { ...data, escolha: String(idx) },
      };
    }

    case "CONFIRMANDO": {
      const nomeAluno = incomingMsg.trim();
      const slots: TimeSlot[] = JSON.parse(data.slots ?? "[]").map(
        (s: { start: string; end: string; label: string }) => ({
          ...s,
          start: new Date(s.start),
          end: new Date(s.end),
        })
      );
      const idx = parseInt(data.escolha ?? "0");
      const chosen = slots[idx];

      if (!chosen) {
        return { nextStep: "INICIO", reply: await buildMenuMsg(settings), updatedData: {} };
      }

      let googleEventId: string | undefined;

      // Tenta criar evento no Google Calendar
      if (settings.googleConnected && settings.googleAccessToken) {
        try {
          let token = settings.googleAccessToken;
          if (settings.googleRefreshToken) {
            token = await refreshAccessToken(settings.googleRefreshToken).catch(() => token);
          }
          googleEventId = await createEvent(
            token,
            settings.googleCalendarId ?? "primary",
            `Avaliação — ${nomeAluno}`,
            chosen.start,
            chosen.end,
            `Agendado via WhatsApp. Contato: ${phone}`
          );
        } catch {
          // Continua mesmo sem criar evento — registra localmente
        }
      }

      // Salva no banco
      await prisma.appointment.create({
        data: {
          phone,
          name: nomeAluno,
          googleEventId: googleEventId ?? null,
          startTime: chosen.start,
          endTime: chosen.end,
          notes: `Agendado via WhatsApp`,
          status: "SCHEDULED",
        },
      });

      return {
        nextStep: "CONCLUIDO",
        reply:
          `✅ *Agendamento confirmado!*\n\n` +
          `📅 ${chosen.label}\n` +
          `👤 ${nomeAluno}\n\n` +
          `O Rafa foi notificado e você receberá um lembrete 24h antes. 😊\n\n` +
          `_(Digite *menu* para ver outras opções)_`,
        updatedData: { ...data, nomeAluno },
      };
    }

    case "CONCLUIDO":
      return {
        nextStep: "CONCLUIDO",
        reply: `Seu agendamento já está confirmado. 😊\n\n_(Digite *menu* para ver outras opções)_`,
        updatedData: data,
      };

    default:
      return { nextStep: "INICIO", reply: await buildMenuMsg(settings), updatedData: data };
  }
}

async function buildMenuMsg(settings: AgendamentoSettings): Promise<string> {
  const nome = settings.academiaName ?? "Academia Corpus";
  return (
    `📅 *Agendamento — ${nome}*\n\n` +
    `Vou verificar os horários disponíveis com o Rafa para a sua avaliação física.\n\n` +
    `Aguarde um momento...`
  );
}
