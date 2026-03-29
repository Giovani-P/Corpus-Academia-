"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function resolveConversation(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");

  await prisma.conversation.update({
    where: { id },
    data: { escalated: false },
  });

  revalidatePath("/dashboard/conversas");
}
