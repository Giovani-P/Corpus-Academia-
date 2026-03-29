export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseSCABuffer } from "@/lib/sca-parser";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });

  const allowed = [".csv", ".xlsx", ".xls"];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "Formato inválido. Use CSV ou XLSX." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let rows;
  try {
    rows = parseSCABuffer(buffer, file.name.toLowerCase());
  } catch (err) {
    console.error("SCA parse error:", err);
    return NextResponse.json({ error: "Erro ao processar arquivo. Verifique o formato." }, { status: 422 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "Nenhum aluno encontrado no arquivo." }, { status: 422 });
  }

  // Substitui todos os dados (upload completo)
  await prisma.$transaction([
    prisma.sCAAluno.deleteMany(),
    prisma.sCAAluno.createMany({
      data: rows.map((r) => ({
        nome: r.nome,
        telefone: r.telefone ?? null,
        email: r.email ?? null,
        dataNasc: r.dataNasc ?? null,
        plano: r.plano ?? null,
        valorPlano: r.valorPlano ?? null,
        vencimento: r.vencimento ?? null,
        dataMatricula: r.dataMatricula ?? null,
        status: r.status,
        extra: r.extra ? JSON.stringify(r.extra) : null,
      })),
    }),
  ]);

  // Atualiza settings com data do último upload
  await prisma.settings.updateMany({
    data: { scaLastUpload: new Date(), scaConnected: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard/relatorios");

  const ativos = rows.filter((r) => r.status === "ATIVO").length;
  const inadimplentes = rows.filter((r) => r.status === "INADIMPLENTE").length;
  const inativos = rows.filter((r) => r.status === "INATIVO").length;

  return NextResponse.json({
    success: true,
    total: rows.length,
    ativos,
    inadimplentes,
    inativos,
  });
}
