export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  jaEnviouNosUltimosDias,
  enviarERegistrar,
  formatPhoneForWA,
  type AutomacaoResult,
} from "@/lib/automacoes";

export async function POST() {
  const settings = await prisma.settings.findFirst();
  if (!settings?.whatsappAccessToken || !settings.whatsappPhoneNumberId) {
    return NextResponse.json({ error: "WhatsApp não configurado" }, { status: 400 });
  }

  // Busca alunos ativos com data de matrícula há ~30 dias
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 37); // janela de 7 dias (30-37 dias atrás)
  const fim = new Date(hoje);
  fim.setDate(fim.getDate() - 30);

  const alunos = await prisma.sCAAluno.findMany({
    where: { status: "ATIVO", telefone: { not: null }, dataMatricula: { not: null } },
  });

  // Filtra os que se matricularam na janela de 30-37 dias atrás
  const elegíveis = alunos.filter((a: typeof alunos[0]) => {
    const parts = (a.dataMatricula ?? "").split("/");
    if (parts.length < 3) return false;
    const [dd, mm, yyyy] = parts;
    const matricula = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return matricula >= inicio && matricula <= fim;
  });

  const result: AutomacaoResult = { enviadas: 0, ignoradas: 0, erros: 0, detalhes: [] };
  const nome = settings.academiaName ?? "Academia Corpus";

  for (const aluno of elegíveis) {
    const phone = formatPhoneForWA(aluno.telefone!);

    // Não envia NPS mais de uma vez por 90 dias
    if (await jaEnviouNosUltimosDias("NPS", phone, 90)) {
      result.ignoradas++;
      continue;
    }

    const msg =
      `Olá, *${aluno.nome}*! 😊\n\n` +
      `Faz cerca de 30 dias que você começou sua jornada na *${nome}* — que incrível!\n\n` +
      `Gostaríamos muito de saber como está sendo sua experiência. Em uma escala de *0 a 10*, qual nota você daria para a nossa academia?\n\n` +
      `*0* = Péssimo · *10* = Excelente\n\n` +
      `Responda apenas com o número. Sua opinião é muito importante para nós! 🙏`;

    try {
      await enviarERegistrar(
        settings.whatsappPhoneNumberId,
        settings.whatsappAccessToken,
        "NPS",
        phone,
        aluno.nome,
        msg
      );
      result.enviadas++;
      result.detalhes.push(`✅ ${aluno.nome}`);
    } catch {
      result.erros++;
      result.detalhes.push(`❌ ${aluno.nome} — erro ao enviar`);
    }
  }

  return NextResponse.json({ ...result, total: elegíveis.length });
}
