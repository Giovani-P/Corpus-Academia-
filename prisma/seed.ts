import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const exists = await prisma.user.findFirst({ where: { email: "admin@corpusacademia.com.br" } });
  if (exists) {
    console.log("✅ Usuário admin já existe. Seed ignorado.");
    return;
  }

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

  console.log("✅ Usuário admin criado:");
  console.log("   E-mail:  admin@corpusacademia.com.br");
  console.log("   Senha:   corpus2025");
  console.log("   ⚠️  Troque a senha após o primeiro login!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
