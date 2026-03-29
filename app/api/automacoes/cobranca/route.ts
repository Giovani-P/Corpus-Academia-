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

  // Busca inadimplentes com telefone
  const inadimplentes = await prisma.sCAAluno.findMany({
    where: { status: "INADIMPLENTE", telefone: { not: null } },
  });

  const result: AutomacaoResult = { enviadas: 0, ignoradas: 0, erros: 0, detalhes: [] };
  const nome = settings.academiaName ?? "Academia Corpus";

  for (const aluno of inadimplentes) {
    const phone = formatPhoneForWA(aluno.telefone!);

    // Não envia cobrança mais de uma vez a cada 7 dias
    if (await jaEnviouNosUltimosDias("COBRANCA", phone, 7)) {
      result.ignoradas++;
      continue;
    }

    const venc = aluno.vencimento ? ` (vencimento: ${aluno.vencimento})` : "";
    const msg =
      `Olá, *${aluno.nome}*! 😊\n\n` +
      `A equipe da *${nome}* notou que seu plano está com pagamento pendente${venc}.\n\n` +
      `Para regularizar sua situação e continuar aproveitando todos os benefícios da academia, entre em contato conosco ou acesse nossa recepção.\n\n` +
      `Qualquer dúvida, estamos à disposição! 💪`;

    try {
      await enviarERegistrar(
        settings.whatsappPhoneNumberId,
        settings.whatsappAccessToken,
        "COBRANCA",
        phone,
        aluno.nome,
        msg,
        { vencimento: aluno.vencimento, plano: aluno.plano }
      );
      result.enviadas++;
      result.detalhes.push(`✅ ${aluno.nome}`);
    } catch {
      result.erros++;
      result.detalhes.push(`❌ ${aluno.nome} — erro ao enviar`);
    }
  }

  return NextResponse.json({ ...result, total: inadimplentes.length });
}
