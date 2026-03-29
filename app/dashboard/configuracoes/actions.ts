"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");
  return session.user.id;
}

export async function saveWhatsappConfig(_prev: unknown, formData: FormData) {
  const userId = await getUserId();
  const phoneNumberId = formData.get("phoneNumberId") as string;
  const accessToken = formData.get("accessToken") as string;

  if (!phoneNumberId || !accessToken) return { error: "Preencha todos os campos." };

  await prisma.settings.upsert({
    where: { userId },
    create: { userId, whatsappPhoneNumberId: phoneNumberId, whatsappAccessToken: accessToken, whatsappConnected: true },
    update: { whatsappPhoneNumberId: phoneNumberId, whatsappAccessToken: accessToken, whatsappConnected: true },
  });

  revalidatePath("/dashboard/configuracoes");
  return { success: true as const };
}

export async function saveGoogleCalendarConfig(_prev: unknown, formData: FormData) {
  const userId = await getUserId();
  const calendarId = formData.get("calendarId") as string;

  if (!calendarId) return { error: "Informe o ID do calendário." };

  await prisma.settings.upsert({
    where: { userId },
    create: { userId, googleCalendarId: calendarId, googleConnected: false },
    update: { googleCalendarId: calendarId },
  });

  revalidatePath("/dashboard/configuracoes");
  return { success: true as const };
}

export async function saveCatracaConfig(_prev: unknown, formData: FormData) {
  const userId = await getUserId();
  const ip = formData.get("ip") as string;
  const port = formData.get("port") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!ip) return { error: "Informe o IP da catraca." };

  await prisma.settings.upsert({
    where: { userId },
    create: { userId, catracaIp: ip, catracaPort: port, catracaUsername: username, catracaPassword: password, catracaConnected: true },
    update: { catracaIp: ip, catracaPort: port, catracaUsername: username, catracaPassword: password, catracaConnected: true },
  });

  revalidatePath("/dashboard/configuracoes");
  return { success: true as const };
}

export async function saveAcademiaInfo(_prev: unknown, formData: FormData) {
  const userId = await getUserId();

  await prisma.settings.upsert({
    where: { userId },
    create: {
      userId,
      academiaName: formData.get("name") as string,
      academiaHorarios: formData.get("horarios") as string,
      academiaPrecos: formData.get("precos") as string,
      academiaModalidades: formData.get("modalidades") as string,
      natacaoTurmas: formData.get("natacaoTurmas") as string,
      natacaoVagas: formData.get("natacaoVagas") as string,
      botTone: formData.get("botTone") as string,
    },
    update: {
      academiaName: formData.get("name") as string,
      academiaHorarios: formData.get("horarios") as string,
      academiaPrecos: formData.get("precos") as string,
      academiaModalidades: formData.get("modalidades") as string,
      natacaoTurmas: formData.get("natacaoTurmas") as string,
      natacaoVagas: formData.get("natacaoVagas") as string,
      botTone: formData.get("botTone") as string,
    },
  });

  revalidatePath("/dashboard/configuracoes");
  return { success: true as const };
}
