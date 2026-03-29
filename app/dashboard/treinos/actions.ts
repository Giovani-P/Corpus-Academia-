"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendWhatsappMessage } from "@/lib/whatsapp-client";
import { revalidatePath } from "next/cache";

export async function approveSheet(id: string, fichaEditada: string) {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");

  await prisma.trainingSheet.update({
    where: { id },
    data: {
      fichaEditada,
      status: "APPROVED",
      approvedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/treinos");
}

export async function sendSheet(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");

  const sheet = await prisma.trainingSheet.findUnique({ where: { id } });
  if (!sheet || sheet.status === "SENT") return;

  const settings = await prisma.settings.findFirst();
  if (!settings?.whatsappAccessToken || !settings.whatsappPhoneNumberId) {
    throw new Error("WhatsApp não configurado");
  }

  const ficha = sheet.fichaEditada ?? sheet.fichaGerada ?? "";

  // Monta mensagem — WhatsApp não suporta markdown completo, simplificamos
  const msg = formatFichaForWhatsapp(sheet.nome, ficha);

  // Envia em partes se muito longa (WhatsApp aceita até ~4096 chars)
  const chunks = splitMessage(msg, 3800);
  for (const chunk of chunks) {
    await sendWhatsappMessage(
      settings.whatsappPhoneNumberId,
      settings.whatsappAccessToken,
      sheet.phone,
      chunk
    );
    // Pequeno intervalo entre mensagens
    await new Promise((r) => setTimeout(r, 500));
  }

  await prisma.trainingSheet.update({
    where: { id },
    data: { status: "SENT" },
  });

  revalidatePath("/dashboard/treinos");
}

function formatFichaForWhatsapp(nome: string, ficha: string): string {
  const intro = `🏋️ *Ficha de Treino — ${nome}*\n\n`;
  // Remove sintaxe markdown que o WhatsApp não suporta (tabelas, ##, etc.)
  const cleaned = ficha
    .replace(/^#{1,6}\s+/gm, "*") // headings → negrito
    .replace(/\|[-:]+\|/g, "") // linhas de tabela separador
    .replace(/\|/g, " ") // pipes de tabela
    .replace(/\*\*(.*?)\*\*/g, "*$1*") // bold mantém
    .replace(/^\s*[-*]\s/gm, "• ") // listas
    .replace(/\n{3,}/g, "\n\n") // espaços excessivos
    .trim();

  return intro + cleaned + "\n\n_Qualquer dúvida, é só chamar! 💪_";
}

function splitMessage(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    // Quebra na última quebra de linha antes do limite
    const slice = remaining.slice(0, maxLen);
    const lastBreak = slice.lastIndexOf("\n\n");
    const cutAt = lastBreak > maxLen * 0.5 ? lastBreak : maxLen;

    chunks.push(remaining.slice(0, cutAt).trim());
    remaining = remaining.slice(cutAt).trim();
  }

  return chunks;
}
