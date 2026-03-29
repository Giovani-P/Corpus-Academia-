"use server";

import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Preencha todos os campos." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "E-mail ou senha incorretos." };
  }

  const token = await createSession(user.id);
  await setSessionCookie(token);

  redirect("/dashboard");
}

export async function seedOwnerIfNotExists() {
  const exists = await prisma.user.findFirst();
  if (exists) return;

  const hashed = await bcrypt.hash("corpus2025", 10);
  const user = await prisma.user.create({
    data: {
      email: "admin@corpusacademia.com.br",
      password: hashed,
      name: "Administrador",
    },
  });

  await prisma.settings.create({
    data: { userId: user.id },
  });
}
