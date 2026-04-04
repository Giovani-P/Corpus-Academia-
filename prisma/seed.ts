import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const exists = await prisma.user.findFirst();
  if (exists) {
    console.log("✅ Banco já foi seedado. Ignorando...");
    return;
  }

  // Criar usuário admin
  const hashed = await bcrypt.hash("corpus2025", 10);
  const user = await prisma.user.create({
    data: {
      email: "admin@corpusacademia.com.br",
      password: hashed,
      name: "Administrador",
    },
  });

  // Criar settings
  await prisma.settings.create({
    data: { userId: user.id },
  });

  // Dados de teste: alunos SCA
  const alunos = [
    { nome: "João Silva", status: "ATIVO", vencimento: "2026-05-15", telefone: "11999999999", dataNasc: "15/06/1990" },
    { nome: "Maria Santos", status: "ATIVO", vencimento: "2026-06-10", telefone: "11988888888", dataNasc: "01/04/2001" },
    { nome: "Pedro Oliveira", status: "INADIMPLENTE", vencimento: "2026-03-20", telefone: "11977777777", dataNasc: "20/12/1995" },
    { nome: "Ana Costa", status: "ATIVO", vencimento: "2026-07-01", telefone: "11966666666", dataNasc: "10/01/1992" },
  ];

  for (const aluno of alunos) {
    await prisma.sCAAluno.create({
      data: {
        nome: aluno.nome,
        status: aluno.status,
        vencimento: aluno.vencimento,
        telefone: aluno.telefone,
        dataNasc: aluno.dataNasc,
      },
    });
  }

  // Dados de teste: leads
  await prisma.lead.create({
    data: {
      name: "Lucas Ferreira",
      phone: "11912345678",
      objective: "Interesse em treino personalizado",
      source: "WHATSAPP",
    },
  });

  console.log("✅ Banco seedado com sucesso!");
  console.log("   Admin: admin@corpusacademia.com.br / corpus2025");
  console.log("   Alunos SCA: 4 (3 ativos, 1 inadimplente)");
  console.log("   Leads: 1 de teste");
  console.log("   ⚠️  Troque a senha de admin após primeiro login!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
