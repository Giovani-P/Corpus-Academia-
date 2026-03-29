export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { nome, phone, objetivo, limitacoes, nivel, diasSemana } = await req.json();

  if (!nome || !phone || !objetivo) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }

  const nivelLabel: Record<string, string> = {
    INICIANTE: "Iniciante (nunca treinou ou mais de 1 ano parado)",
    INTERMEDIARIO: "Intermediário (treina regularmente há alguns meses)",
    AVANCADO: "Avançado (treina há mais de 1 ano com consistência)",
  };

  const prompt = `Você é um personal trainer experiente. Monte uma ficha de treino completa e personalizada.

**Dados do aluno:**
- Nome: ${nome}
- Objetivo: ${objetivo}
- Nível: ${nivelLabel[nivel] ?? nivel}
- Dias disponíveis por semana: ${diasSemana}x
- Limitações físicas: ${limitacoes || "Nenhuma informada"}

**Instruções:**
- Monte um treino ABCDE ou AB/ABC dependendo dos dias disponíveis
- Para cada exercício, informe: séries × repetições (ou tempo), descanso e observação
- Adapte os exercícios ao nível do aluno
- Se houver limitações, substitua exercícios que possam agravar
- Use formato Markdown com tabelas para os exercícios
- Inclua: aquecimento, blocos de treino por dia, e dica final motivacional
- Seja específico, prático e direto

Gere a ficha completa agora:`;

  let fichaGerada = "";

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    fichaGerada =
      response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("Anthropic error:", err);
    return NextResponse.json({ error: "Erro ao gerar ficha" }, { status: 500 });
  }

  // Salva no banco
  await prisma.trainingSheet.create({
    data: {
      nome,
      phone: phone.replace(/\D/g, ""),
      objetivo,
      limitacoes: limitacoes || null,
      nivel,
      diasSemana: Number(diasSemana),
      fichaGerada,
      status: "PENDING",
    },
  });

  return NextResponse.json({ success: true });
}
