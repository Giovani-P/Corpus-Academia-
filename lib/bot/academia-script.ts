import { prisma } from "@/lib/prisma";

export type AcademiaStep =
  | "INICIO"
  | "MENU"
  | "HORARIOS"
  | "PRECOS"
  | "MODALIDADES"
  | "EXPERIMENTAL"
  | "EXPERIMENTAL_NOME"
  | "EXPERIMENTAL_OBJETIVO"
  | "LEAD_CAPTURADO";

interface AcademiaData {
  nome?: string;
  objetivo?: string;
}

interface AcademiaSettings {
  academiaName?: string | null;
  academiaHorarios?: string | null;
  academiaPrecos?: string | null;
  academiaModalidades?: string | null;
  botTone?: string | null;
}

export function buildAcademiaResponse(
  step: AcademiaStep,
  incomingMsg: string,
  data: AcademiaData,
  settings: AcademiaSettings
): { nextStep: AcademiaStep; reply: string; updatedData: AcademiaData } {
  const nome = settings.academiaName ?? "Academia Corpus";
  const horarios = settings.academiaHorarios ?? "Seg-Sex 6h–22h | Sáb 8h–16h | Dom 8h–12h";
  const precos = settings.academiaPrecos ?? "Entre em contato para saber nossos planos!";
  const modalidades = settings.academiaModalidades ?? "Musculação, Natação, Funcional e Pilates";

  const saudacao = settings.botTone === "FORMAL"
    ? `Olá! Seja bem-vindo(a) à *${nome}*. 🏋️`
    : `Olá! Que bom ter você aqui! 😊 Sou o assistente da *${nome}*.`;

  const msg = incomingMsg.trim().toLowerCase();

  // Sempre que receber "menu" ou "0", volta ao menu
  if (msg === "menu" || msg === "0") {
    return { nextStep: "MENU", reply: menuMsg(nome), updatedData: data };
  }

  switch (step) {
    case "INICIO":
    case "MENU":
      return { nextStep: "MENU", reply: `${saudacao}\n\n${menuMsg(nome)}`, updatedData: data };

    case "HORARIOS":
    case "PRECOS":
    case "MODALIDADES": {
      // Voltou de uma opção de info — mostra menu novamente
      if (["1", "2", "3", "4"].includes(msg)) {
        return handleMenuOption(msg, horarios, precos, modalidades, nome, data);
      }
      return { nextStep: "MENU", reply: menuMsg(nome), updatedData: data };
    }

    case "EXPERIMENTAL":
      return {
        nextStep: "EXPERIMENTAL_NOME",
        reply: `Perfeito! Vamos agendar sua aula experimental gratuita. 🎉\n\nPrimeiro, qual é o seu *nome completo*?`,
        updatedData: data,
      };

    case "EXPERIMENTAL_NOME": {
      const nome_ = incomingMsg.trim();
      return {
        nextStep: "EXPERIMENTAL_OBJETIVO",
        reply: `Prazer, *${nome_}*! 💪\n\nQual é o seu principal *objetivo* com a academia?\n_(Ex: emagrecer, ganhar massa, condicionamento, saúde...)_`,
        updatedData: { ...data, nome: nome_ },
      };
    }

    case "EXPERIMENTAL_OBJETIVO": {
      const objetivo = incomingMsg.trim();
      const nomeCapturado = data.nome ?? "Visitante";

      // Salva o lead de forma assíncrona (não bloqueia a resposta)
      prisma.lead
        .create({
          data: {
            name: nomeCapturado,
            phone: "", // preenchido pelo handler do webhook
            objective: objetivo,
            source: "WHATSAPP",
          },
        })
        .catch(console.error);

      return {
        nextStep: "LEAD_CAPTURADO",
        reply:
          `Ótimo, *${nomeCapturado}*! ✅\n\n` +
          `Nossa equipe vai entrar em contato em breve para confirmar o horário da sua aula experimental.\n\n` +
          `Enquanto isso, se tiver mais alguma dúvida, é só chamar! 😊\n\n` +
          `_(Digite *menu* para voltar ao início)_`,
        updatedData: { ...data, objetivo },
      };
    }

    case "LEAD_CAPTURADO":
      return {
        nextStep: "LEAD_CAPTURADO",
        reply: `Já registrei suas informações! Nossa equipe entrará em contato em breve. 😊\n\n_(Digite *menu* para ver outras opções)_`,
        updatedData: data,
      };

    default:
      return { nextStep: "MENU", reply: menuMsg(nome), updatedData: data };
  }
}

export function handleMenuOption(
  option: string,
  horarios: string,
  precos: string,
  modalidades: string,
  nomeAcademia: string,
  data: AcademiaData
): { nextStep: AcademiaStep; reply: string; updatedData: AcademiaData } {
  switch (option) {
    case "1":
      return {
        nextStep: "HORARIOS",
        reply: `🕐 *Horários de funcionamento:*\n\n${horarios}\n\n_(Digite *menu* para voltar)_`,
        updatedData: data,
      };
    case "2":
      return {
        nextStep: "PRECOS",
        reply: `💰 *Planos e preços:*\n\n${precos}\n\n_(Digite *menu* para voltar)_`,
        updatedData: data,
      };
    case "3":
      return {
        nextStep: "MODALIDADES",
        reply: `🏃 *Modalidades disponíveis:*\n\n${modalidades}\n\n_(Digite *menu* para voltar)_`,
        updatedData: data,
      };
    case "4":
      return {
        nextStep: "EXPERIMENTAL",
        reply: `Perfeito! Vamos agendar sua aula experimental gratuita. 🎉\n\nPrimeiro, qual é o seu *nome completo*?`,
        updatedData: data,
      };
    default:
      return { nextStep: "MENU", reply: menuMsg(nomeAcademia), updatedData: data };
  }
}

function menuMsg(nomeAcademia: string): string {
  return (
    `O que você gostaria de saber sobre a *${nomeAcademia}*?\n\n` +
    `1️⃣ Horários de funcionamento\n` +
    `2️⃣ Planos e preços\n` +
    `3️⃣ Modalidades\n` +
    `4️⃣ Agendar aula experimental gratuita\n\n` +
    `_(Digite o número da opção)_`
  );
}
