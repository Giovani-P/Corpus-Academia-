export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectContext } from "@/lib/context-detector";
import { sendWhatsappMessage, markAsRead } from "@/lib/whatsapp-client";
import {
  buildAcademiaResponse,
  handleMenuOption,
  type AcademiaStep,
} from "@/lib/bot/academia-script";
import { buildNatacaoResponse, type NatacaoStep } from "@/lib/bot/natacao-script";
import { buildAgendamentoResponse, type AgendamentoStep } from "@/lib/bot/agendamento-script";

// ── GET — verificação do webhook pela Meta ───────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// ── POST — recebe mensagens ──────────────────────────────────
export async function POST(req: NextRequest) {
  let body: WhatsappWebhookBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ status: "ignored" });
  }

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      const value = change.value;
      const phoneNumberId = value.metadata?.phone_number_id ?? "";
      const messages = value.messages ?? [];

      for (const message of messages) {
        if (message.type !== "text") continue;

        const from = message.from;
        const text = message.text?.body ?? "";
        const messageId = message.id;

        handleMessage(phoneNumberId, from, text, messageId).catch(console.error);
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}

// ── Handler principal ────────────────────────────────────────
async function handleMessage(
  phoneNumberId: string,
  from: string,
  text: string,
  messageId: string
) {
  const settings = await prisma.settings.findFirst();
  if (!settings?.whatsappAccessToken || !settings.whatsappPhoneNumberId) return;

  const accessToken = settings.whatsappAccessToken;

  await markAsRead(phoneNumberId, accessToken, messageId).catch(() => null);

  // ── Captura resposta NPS (número 0-10 de quem recebeu pesquisa) ──
  const trimmed = text.trim();
  const possibleScore = parseInt(trimmed, 10);
  if (!isNaN(possibleScore) && possibleScore >= 0 && possibleScore <= 10 && trimmed === String(possibleScore)) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 7);
    const npsLog = await prisma.automacaoLog.findFirst({
      where: { tipo: "NPS", phone: from, sentAt: { gte: sinceDate } },
    });
    if (npsLog) {
      await prisma.nPSResponse.create({
        data: { phone: from, alunoNome: npsLog.alunoNome, score: possibleScore },
      }).catch(() => null);
      const settings2 = await prisma.settings.findFirst();
      const agradecimento =
        possibleScore >= 9
          ? `Que nota incrível! 🎉 Obrigado, *${npsLog.alunoNome}*! Seu apoio nos motiva a continuar melhorando. 💪`
          : possibleScore >= 7
          ? `Obrigado pelo feedback, *${npsLog.alunoNome}*! Vamos continuar trabalhando para melhorar ainda mais. 😊`
          : `Obrigado por ser honesto, *${npsLog.alunoNome}*. Seu feedback é importante e vamos trabalhar para melhorar! 🙏`;
      if (settings2?.whatsappAccessToken) {
        await sendWhatsappMessage(phoneNumberId, settings2.whatsappAccessToken, from, agradecimento).catch(() => null);
      }
      return;
    }
  }

  let conversation = await prisma.conversation.findUnique({ where: { phone: from } });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { phone: from, flow: "UNKNOWN", step: "INICIO", data: "{}" },
    });
  }

  const currentFlow = conversation.flow as "ACADEMIA" | "NATACAO" | "AGENDAMENTO" | "UNKNOWN";
  const currentStep = conversation.step;
  let convData: Record<string, string> = {};
  try {
    convData = JSON.parse(conversation.data);
  } catch {
    convData = {};
  }

  let nextFlow = currentFlow;
  let nextStep = currentStep;
  let reply = "";
  let updatedData = convData;
  const msg = text.trim().toLowerCase();

  // Palavras-chave globais que mudam o flow a qualquer momento
  if (msg === "agendar" || msg === "agendamento" || msg === "agenda") {
    nextFlow = "AGENDAMENTO";
    nextStep = "INICIO";
  }

  // Detecta contexto quando desconhecido
  if (currentFlow === "UNKNOWN" && nextFlow === "UNKNOWN") {
    const detected = await detectContext(text);

    if (detected === "ACADEMIA" || detected === "NATACAO") {
      nextFlow = detected;
    } else {
      // Verifica se é "agendar" sem ser detectado pela IA
      const isAgendamento = ["agendar", "agenda", "horario", "avaliacao", "avaliação", "rafa"].some(
        (kw) => msg.includes(kw)
      );
      if (isAgendamento) {
        nextFlow = "AGENDAMENTO";
        nextStep = "INICIO";
      } else {
        // Menu geral
        const nomeAcademia = settings.academiaName ?? "Academia Corpus";
        reply =
          `Olá! 👋 Seja bem-vindo(a) à *${nomeAcademia}*!\n\n` +
          `Sobre o que você gostaria de falar?\n\n` +
          `1️⃣ Academia (horários, preços, modalidades, aula experimental)\n` +
          `2️⃣ Natação (turmas, vagas, inscrição)\n` +
          `3️⃣ Agendar avaliação física com o Rafa\n\n` +
          `_(Digite o número da opção)_`;

        await prisma.conversation.update({
          where: { phone: from },
          data: { flow: "UNKNOWN", step: "MENU_GERAL", lastMessage: new Date() },
        });

        await sendWhatsappMessage(phoneNumberId, accessToken, from, reply);
        return;
      }
    }
  }

  // Menu geral: aguardando escolha do usuário
  if (currentStep === "MENU_GERAL") {
    if (text.trim() === "1") {
      nextFlow = "ACADEMIA";
      nextStep = "INICIO";
    } else if (text.trim() === "2") {
      nextFlow = "NATACAO";
      nextStep = "INICIO";
    } else if (text.trim() === "3") {
      nextFlow = "AGENDAMENTO";
      nextStep = "INICIO";
    } else {
      reply = `Por favor, digite *1*, *2* ou *3*.`;
      await sendWhatsappMessage(phoneNumberId, accessToken, from, reply);
      return;
    }
  }

  // ── Processa o flow ──────────────────────────────────────
  if (nextFlow === "ACADEMIA") {
    if (currentStep === "MENU" && ["1", "2", "3", "4"].includes(msg)) {
      const result = handleMenuOption(
        msg,
        settings.academiaHorarios ?? "",
        settings.academiaPrecos ?? "",
        settings.academiaModalidades ?? "",
        settings.academiaName ?? "Academia Corpus",
        convData
      );
      nextStep = result.nextStep;
      reply = result.reply;
      updatedData = result.updatedData as Record<string, string>;
    } else {
      const result = buildAcademiaResponse(
        currentStep as AcademiaStep,
        text,
        convData,
        settings
      );
      nextStep = result.nextStep;
      reply = result.reply;

      if (result.nextStep === "LEAD_CAPTURADO" && result.updatedData.nome) {
        await prisma.lead
          .updateMany({
            where: { name: result.updatedData.nome as string, phone: "" },
            data: { phone: from },
          })
          .catch(() => null);
      }

      updatedData = result.updatedData as Record<string, string>;
    }
  } else if (nextFlow === "NATACAO") {
    const result = buildNatacaoResponse(
      currentStep as NatacaoStep,
      text,
      from,
      convData,
      settings
    );
    nextStep = result.nextStep;
    reply = result.reply;
    updatedData = result.updatedData as Record<string, string>;
  } else if (nextFlow === "AGENDAMENTO") {
    const result = await buildAgendamentoResponse(
      (currentStep === "MENU_GERAL" ? "INICIO" : currentStep) as AgendamentoStep,
      text,
      from,
      convData,
      settings
    );
    nextStep = result.nextStep;
    reply = result.reply;
    updatedData = result.updatedData as Record<string, string>;
  }

  // Detecta necessidade de escalada (mensagem de ajuda humana)
  const needsEscalation = ["humano", "atendente", "pessoa", "falar com", "suporte"].some(
    (kw) => msg.includes(kw)
  );

  await prisma.conversation.update({
    where: { phone: from },
    data: {
      flow: nextFlow,
      step: nextStep,
      data: JSON.stringify(updatedData),
      lastMessage: new Date(),
      ...(needsEscalation ? { escalated: true } : {}),
    },
  });

  if (needsEscalation && !conversation.escalated) {
    reply =
      `Entendido! Vou notificar a equipe para que um atendente entre em contato com você em breve. 😊\n\n` +
      `_(Horário de atendimento: Seg–Sex 8h–18h | Sáb 8h–14h)_`;
  }

  if (reply) {
    await sendWhatsappMessage(phoneNumberId, accessToken, from, reply);
  }
}

// ── Tipos ────────────────────────────────────────────────────
interface WhatsappWebhookBody {
  object: string;
  entry?: WebhookEntry[];
}

interface WebhookEntry {
  id: string;
  changes?: WebhookChange[];
}

interface WebhookChange {
  field: string;
  value: WebhookValue;
}

interface WebhookValue {
  messaging_product: string;
  metadata?: { display_phone_number: string; phone_number_id: string };
  messages?: WebhookMessage[];
}

interface WebhookMessage {
  id: string;
  from: string;
  type: string;
  timestamp: string;
  text?: { body: string };
}
