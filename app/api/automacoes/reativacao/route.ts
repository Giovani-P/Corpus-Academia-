export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  jaEnviouNosUltimosDias,
  enviarERegistrar,
  formatPhoneForWA,
  type AutomacaoResult,
} from "@/lib/automacoes";

// Janelas de reativação: 30, 60, 90 dias após saída
const JANELAS = [
  { dias: 30, tipo: "REATIVACAO_30" },
  { dias: 60, tipo: "REATIVACAO_60" },
  { dias: 90, tipo: "REATIVACAO_90" },
];

export async function POST() {
  const settings = await prisma.settings.findFirst();
  if (!settings?.whatsappAccessToken || !settings.whatsappPhoneNumberId) {
    return NextResponse.json({ error: "WhatsApp não configurado" }, { status: 400 });
  }

  const inativos = await prisma.sCAAluno.findMany({
    where: { status: "INATIVO", telefone: { not: null } },
  });

  const result: AutomacaoResult = { enviadas: 0, ignoradas: 0, erros: 0, detalhes: [] };
  const nome = settings.academiaName ?? "Academia Corpus";
  const hoje = new Date();

  for (const aluno of inativos) {
    if (!aluno.dataMatricula) {
      result.ignoradas++;
      continue;
    }

    // Tenta identificar a data de saída pelo campo dataMatricula (última matrícula conhecida)
    // Se não disponível, ignora
    const parts = (aluno.dataMatricula ?? "").split("/");
    if (parts.length < 3) {
      result.ignoradas++;
      continue;
    }

    const [dd, mm, yyyy] = parts;
    const dataSaida = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    const diasInativo = Math.floor((hoje.getTime() - dataSaida.getTime()) / (1000 * 60 * 60 * 24));

    // Encontra a janela mais adequada
    const janela = JANELAS.find((j) => {
      const dentroJanela = diasInativo >= j.dias && diasInativo < j.dias + 7;
      return dentroJanela;
    });

    if (!janela) {
      result.ignoradas++;
      continue;
    }

    const phone = formatPhoneForWA(aluno.telefone!);

    // Não envia esse tipo de reativação se já enviou recentemente
    if (await jaEnviouNosUltimosDias(janela.tipo, phone, 30)) {
      result.ignoradas++;
      continue;
    }

    const msgs: Record<string, string> = {
      REATIVACAO_30:
        `Olá, *${aluno.nome}*! Sentimos sua falta! 😢\n\n` +
        `Faz um mês desde que você não vem treinar na *${nome}*. Sabemos que a vida fica corrida às vezes, mas estamos aqui para te apoiar!\n\n` +
        `Que tal retomar sua jornada? Passe na academia e vamos juntos de volta à rotina! 💪`,

      REATIVACAO_60:
        `Oi, *${aluno.nome}*! Tudo bem? 🌟\n\n` +
        `Já faz dois meses que sentimos sua falta na *${nome}*. Seus objetivos ainda estão vivos!\n\n` +
        `Temos novidades e adoraríamos te ver por aqui novamente. Manda uma mensagem ou passe na recepção — faremos o possível para facilitar seu retorno. 🏋️`,

      REATIVACAO_90:
        `Olá, *${aluno.nome}*! 👋\n\n` +
        `Três meses sem te ver na *${nome}*. Sua saúde e bem-estar são importantes para nós!\n\n` +
        `Como um presente especial para quem já fez parte da nossa família, temos uma *condição especial de retorno* para você. Passa na academia ou fala com a gente! 🎁`,
    };

    const msg = msgs[janela.tipo];

    try {
      await enviarERegistrar(
        settings.whatsappPhoneNumberId,
        settings.whatsappAccessToken,
        janela.tipo,
        phone,
        aluno.nome,
        msg,
        { diasInativo, janela: janela.dias }
      );
      result.enviadas++;
      result.detalhes.push(`✅ ${aluno.nome} (${janela.dias} dias)`);
    } catch {
      result.erros++;
      result.detalhes.push(`❌ ${aluno.nome} — erro ao enviar`);
    }
  }

  return NextResponse.json({ ...result, total: inativos.length });
}
