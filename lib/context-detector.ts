import Anthropic from "@anthropic-ai/sdk";

export type BotFlow = "ACADEMIA" | "NATACAO" | "UNKNOWN";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Você é um classificador de mensagens para uma academia.
Classifique a mensagem do usuário em exatamente uma categoria:
- ACADEMIA: horários, preços, planos, mensalidade, modalidades, musculação, funcional, pilates, aula experimental, matrícula, academia em geral
- NATACAO: natação, nadar, piscina, aulas de natação, turmas, faixa etária, vagas
- UNKNOWN: não consegue identificar o assunto

Responda APENAS com uma das palavras: ACADEMIA, NATACAO ou UNKNOWN`;

export async function detectContext(message: string): Promise<BotFlow> {
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    });

    const text =
      response.content[0].type === "text"
        ? response.content[0].text.trim().toUpperCase()
        : "UNKNOWN";

    if (text === "ACADEMIA" || text === "NATACAO") return text;
    return "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}
