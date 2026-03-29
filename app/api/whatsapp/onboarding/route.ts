export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendWhatsappMessage } from "@/lib/whatsapp-client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { phone, name } = await req.json();
  if (!phone) return NextResponse.json({ error: "Telefone obrigatório" }, { status: 400 });

  const settings = await prisma.settings.findFirst();
  if (!settings?.whatsappAccessToken || !settings.whatsappPhoneNumberId) {
    return NextResponse.json({ error: "WhatsApp não configurado" }, { status: 400 });
  }

  const nomeAcademia = settings.academiaName ?? "Academia Corpus";
  const nomeAluno = name ? `, *${name}*` : "";

  const msg =
    `🎉 Olá${nomeAluno}! Seja muito bem-vindo(a) à *${nomeAcademia}*!\n\n` +
    `Estamos muito felizes em ter você conosco! 💪\n\n` +
    `*Próximos passos:*\n` +
    `1️⃣ Agende sua avaliação física com o Rafa\n` +
    `2️⃣ Conheça as modalidades e horários disponíveis\n` +
    `3️⃣ Traga uma roupa confortável no primeiro dia\n\n` +
    `Para agendar sua avaliação, é só responder *agendar* aqui. 😊\n\n` +
    `Qualquer dúvida, estou à disposição!`;

  try {
    await sendWhatsappMessage(
      settings.whatsappPhoneNumberId,
      settings.whatsappAccessToken,
      phone,
      msg
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao enviar mensagem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
