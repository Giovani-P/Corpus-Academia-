export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { tema, categoria, duracao } = await req.json();

  if (!tema || !categoria || !duracao) {
    return NextResponse.json(
      { error: "Campos obrigatórios: tema, categoria, duracao" },
      { status: 400 }
    );
  }

  const prompt = `Você é um expert em criar roteiros para vídeos virais de academia e bem-estar.

**Contexto:**
- Tema: ${tema}
- Categoria: ${categoria}
- Duração: ${duracao}

**Instruções:**
1. Crie um roteiro COMPLETO e pronto para gravar, dividido em:
   - **Gancho** (primeiros 3 segundos - muito importante!)
   - **Problema** (o que o vídeo vai resolver)
   - **Solução** (passo a passo)
   - **Call-to-action** (call na final)

2. Inclua:
   - Dicas de edição (transições, efeitos, texto on-screen)
   - Tempo de cada seção
   - Sugestões de música/tom de voz
   - 5-7 hashtags relevantes (#academia, #musculação, etc.)

3. Formato: Use Markdown com seções claras

4. Faça ser VIRAL:
   - Começo impactante
   - Rápido e dinâmico
   - Valor prático
   - Emoção ou curiosidade

Gere o roteiro completo agora:`;

  let roteiroGerado = "";

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    roteiroGerado =
      response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("Anthropic error:", err);
    return NextResponse.json({ error: "Erro ao gerar roteiro" }, { status: 500 });
  }

  // Extrai hashtags do roteiro (procura por linhas com #)
  const hashtagMatch = roteiroGerado.match(/#+.*(?:\n|$)/g);
  const hashtags = hashtagMatch ? hashtagMatch.map((h) => h.trim()) : [];

  // Salva no banco
  const video = await prisma.videoRoteiro.create({
    data: {
      tema,
      categoria,
      duracao,
      roteiro: roteiroGerado,
      hashtags: JSON.stringify(hashtags),
    },
  });

  return NextResponse.json({
    success: true,
    id: video.id,
    roteiro: roteiroGerado,
    hashtags,
  });
}
