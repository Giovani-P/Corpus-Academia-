import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, CheckCircle2 } from "lucide-react";
import { TreinoCard } from "./treino-card";

type TrainingSheet = {
  id: string;
  token: string;
  nome: string;
  phone: string;
  objetivo: string;
  limitacoes: string | null;
  nivel: string;
  diasSemana: number;
  fichaGerada: string | null;
  fichaEditada: string | null;
  status: string;
  approvedAt: Date | null;
  createdAt: Date;
};

export default async function TreinosPage() {
  const [pendentes, enviadas] = await Promise.all([
    prisma.trainingSheet.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.trainingSheet.findMany({
      where: { status: { in: ["APPROVED", "SENT"] } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Treinos IA</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Fichas geradas pela IA aguardando revisão e aprovação do Rafa.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Pendentes ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-[#94A3B8]">Aguardando aprovação</h2>
            {pendentes.length > 0 && (
              <Badge variant="warning">{pendentes.length}</Badge>
            )}
          </div>

          {pendentes.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-8 text-center">
                <Dumbbell className="w-8 h-8 text-[#334155] mb-2" />
                <p className="text-sm text-[#475569]">
                  Nenhuma ficha aguardando. Quando alunos preencherem o formulário, aparecerão aqui.
                </p>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {pendentes.map((sheet: TrainingSheet) => (
                <TreinoCard key={sheet.id} sheet={sheet} />
              ))}
            </div>
          )}
        </div>

        {/* ── Enviadas ── */}
        {enviadas.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <h2 className="text-sm font-semibold text-[#94A3B8]">Aprovadas / Enviadas</h2>
              <Badge variant="default">{enviadas.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {enviadas.map((sheet: TrainingSheet) => (
                <div key={sheet.id} className="flex items-center justify-between p-4 bg-[#1E293B] rounded-xl border border-[#334155]">
                  <div>
                    <p className="text-sm font-medium text-[#F1F5F9]">{sheet.nome}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{sheet.objetivo} · {sheet.diasSemana}x/semana</p>
                  </div>
                  <Badge variant={sheet.status === "SENT" ? "success" : "warning"} dot>
                    {sheet.status === "SENT" ? "Enviada" : "Aprovada"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
