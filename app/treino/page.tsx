export const dynamic = "force-dynamic";

import { TreinoForm } from "./treino-form";
import { prisma } from "@/lib/prisma";

export default async function TreinoPage() {
  const settings = await prisma.settings.findFirst({
    select: { academiaName: true },
  });

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-lg mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#F97316]/10 border border-[#F97316]/30 rounded-2xl mb-4">
          <svg className="w-7 h-7 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Ficha de Treino IA</h1>
        <p className="text-sm text-[#64748B] mt-1">
          {settings?.academiaName ?? "Academia Corpus"}
        </p>
        <p className="text-sm text-[#94A3B8] mt-3 max-w-sm mx-auto">
          Preencha o formulário abaixo. Nossa IA montará um treino personalizado que será revisado pelo Rafa antes de ser enviado para você.
        </p>
      </div>

      <TreinoForm />
    </div>
  );
}
