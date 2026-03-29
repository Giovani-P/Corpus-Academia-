export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  jaEnviouHoje,
  enviarERegistrar,
  formatPhoneForWA,
  type AutomacaoResult,
} from "@/lib/automacoes";

export async function POST() {
  const settings = await prisma.settings.findFirst();
  if (!settings?.whatsappAccessToken || !settings.whatsappPhoneNumberId) {
    return NextResponse.json({ error: "WhatsApp não configurado" }, { status: 400 });
  }

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const todayMD = `${dd}/${mm}`;

  // Busca aniversariantes ativos com telefone
  const alunos = await prisma.sCAAluno.findMany({
    where: { dataNasc: { not: null }, status: "ATIVO", telefone: { not: null } },
  });

  const aniversariantes = alunos.filter((a: typeof alunos[0]) => {
    const parts = (a.dataNasc ?? "").split("/");
    return parts.length >= 2 && `${parts[0]}/${parts[1]}` === todayMD;
  });

  const result: AutomacaoResult = { enviadas: 0, ignoradas: 0, erros: 0, detalhes: [] };
  const nome = settings.academiaName ?? "Academia Corpus";

  for (const aluno of aniversariantes) {
    const phone = formatPhoneForWA(aluno.telefone!);

    if (await jaEnviouHoje("ANIVERSARIO", phone)) {
      result.ignoradas++;
      continue;
    }

    const msg =
      `🎂 Feliz aniversário, *${aluno.nome}*!\n\n` +
      `Toda a equipe da *${nome}* deseja um dia incrível cheio de saúde e conquistas! 🎉💪\n\n` +
      `Você é parte especial da nossa família. Continue arrasando!`;

    try {
      await enviarERegistrar(
        settings.whatsappPhoneNumberId,
        settings.whatsappAccessToken,
        "ANIVERSARIO",
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

  return NextResponse.json({ ...result, total: aniversariantes.length });
}
