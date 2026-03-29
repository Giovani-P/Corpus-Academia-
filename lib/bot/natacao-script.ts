import { prisma } from "@/lib/prisma";

export type NatacaoStep =
  | "INICIO"
  | "MENU"
  | "TURMAS"
  | "INSCRICAO_NOME_RESP"
  | "INSCRICAO_NOME_CRIANCA"
  | "INSCRICAO_NASC"
  | "INSCRICAO_NECESSIDADES"
  | "INSCRICAO_CONCLUIDA";

interface NatacaoData {
  responsavelNome?: string;
  criancaNome?: string;
  dataNasc?: string;
  turma?: string;
}

interface NatacaoSettings {
  academiaName?: string | null;
  natacaoTurmas?: string | null;
  natacaoVagas?: string | null;
  botTone?: string | null;
}

export function buildNatacaoResponse(
  step: NatacaoStep,
  incomingMsg: string,
  phone: string,
  data: NatacaoData,
  settings: NatacaoSettings
): { nextStep: NatacaoStep; reply: string; updatedData: NatacaoData } {
  const nome = settings.academiaName ?? "Academia Corpus";
  const turmas = settings.natacaoTurmas ?? "Infantil (4–7 anos) | Kids (8–12 anos) | Adulto";
  const vagas = settings.natacaoVagas ?? "Consulte a disponibilidade";

  const msg = incomingMsg.trim().toLowerCase();

  if (msg === "menu" || msg === "0") {
    return { nextStep: "MENU", reply: menuNatacao(nome, turmas, vagas), updatedData: data };
  }

  switch (step) {
    case "INICIO":
    case "MENU":
      return {
        nextStep: "MENU",
        reply: menuNatacao(nome, turmas, vagas),
        updatedData: data,
      };

    case "TURMAS":
      if (msg === "1") {
        return {
          nextStep: "INSCRICAO_NOME_RESP",
          reply: `Ótimo! Vamos iniciar a inscrição. 🏊\n\nQual é o seu *nome* (responsável)?`,
          updatedData: data,
        };
      }
      return { nextStep: "MENU", reply: menuNatacao(nome, turmas, vagas), updatedData: data };

    case "INSCRICAO_NOME_RESP": {
      const nomeResp = incomingMsg.trim();
      return {
        nextStep: "INSCRICAO_NOME_CRIANCA",
        reply: `Prazer, *${nomeResp}*! 😊\n\nQual é o *nome completo da criança*?`,
        updatedData: { ...data, responsavelNome: nomeResp },
      };
    }

    case "INSCRICAO_NOME_CRIANCA": {
      const nomeCrianca = incomingMsg.trim();
      return {
        nextStep: "INSCRICAO_NASC",
        reply: `Qual é a *data de nascimento* de *${nomeCrianca}*?\n_(Ex: 15/03/2018)_`,
        updatedData: { ...data, criancaNome: nomeCrianca },
      };
    }

    case "INSCRICAO_NASC": {
      const nasc = incomingMsg.trim();
      const turmaDetectada = detectTurma(nasc, turmas);
      return {
        nextStep: "INSCRICAO_NECESSIDADES",
        reply:
          `A criança possui alguma *necessidade especial* ou *restrição médica* que devemos saber?\n\n` +
          `_(Digite "não" se não houver)_`,
        updatedData: { ...data, dataNasc: nasc, turma: turmaDetectada },
      };
    }

    case "INSCRICAO_NECESSIDADES": {
      const necessidades = msg === "não" || msg === "nao" ? undefined : incomingMsg.trim();

      // Salva a inscrição
      prisma.natacaoEnrollment
        .create({
          data: {
            responsavelNome: data.responsavelNome ?? "",
            phone,
            criancaNome: data.criancaNome ?? "",
            dataNasc: data.dataNasc ?? "",
            turma: data.turma ?? null,
            necessidadesEspeciais: necessidades ?? null,
            status: "PENDING",
          },
        })
        .catch(console.error);

      const turmaInfo = data.turma
        ? `\n\n🏊 *Turma sugerida:* ${data.turma}`
        : "";

      return {
        nextStep: "INSCRICAO_CONCLUIDA",
        reply:
          `✅ *Inscrição registrada com sucesso!*${turmaInfo}\n\n` +
          `Nossa equipe entrará em contato em breve para confirmar a vaga e informar os próximos passos.\n\n` +
          `Qualquer dúvida, é só chamar! 😊\n\n` +
          `_(Digite *menu* para ver outras opções)_`,
        updatedData: { ...data },
      };
    }

    case "INSCRICAO_CONCLUIDA":
      return {
        nextStep: "INSCRICAO_CONCLUIDA",
        reply: `Sua inscrição já foi registrada! Nossa equipe entrará em contato. 😊\n\n_(Digite *menu* para ver outras opções)_`,
        updatedData: data,
      };

    default:
      return { nextStep: "MENU", reply: menuNatacao(nome, turmas, vagas), updatedData: data };
  }
}

function menuNatacao(nome: string, turmas: string, vagas: string): string {
  return (
    `🏊 *Natação — ${nome}*\n\n` +
    `*Turmas disponíveis:*\n${turmas}\n\n` +
    `*Vagas:* ${vagas}\n\n` +
    `O que deseja fazer?\n\n` +
    `1️⃣ Fazer inscrição\n\n` +
    `_(Digite o número da opção)_`
  );
}

function detectTurma(dataNasc: string, turmasConfig: string): string {
  // Tenta extrair o ano de nascimento
  const match = dataNasc.match(/(\d{4})/) ?? dataNasc.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return turmasConfig.split("|")[0]?.trim() ?? "A definir";

  const anoNasc = parseInt(match[match.length - 1]);
  const anoAtual = new Date().getFullYear();
  const idade = anoAtual - anoNasc;

  if (idade >= 4 && idade <= 7) return "Infantil (4–7 anos)";
  if (idade >= 8 && idade <= 12) return "Kids (8–12 anos)";
  if (idade >= 13) return "Adulto";
  return "A definir";
}
