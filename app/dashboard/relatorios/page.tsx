export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Cake,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";

type Aluno = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  dataNasc: string | null;
  plano: string | null;
  valorPlano: number | null;
  vencimento: string | null;
  status: string;
};

export default async function RelatoriosPage() {
  const alunos: Aluno[] = await prisma.sCAAluno.findMany({
    orderBy: { nome: "asc" },
  });

  const ativos = alunos.filter((a) => a.status === "ATIVO");
  const inadimplentes = alunos.filter((a) => a.status === "INADIMPLENTE");
  const inativos = alunos.filter((a) => a.status === "INATIVO");

  const aniversariantesHoje = getAniversariantes(alunos, "today");
  const aniversariantesSemana = getAniversariantes(alunos, "week");

  const faturamentoEstimado = ativos.reduce((sum, a) => sum + (a.valorPlano ?? 0), 0);
  const faturamentoPerdido = inadimplentes.reduce((sum, a) => sum + (a.valorPlano ?? 0), 0);

  const hasDados = alunos.length > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Relatórios</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Resumo dos dados importados do SCA.
          {alunos.length > 0 && <span className="text-[#475569]"> · {alunos.length} alunos cadastrados</span>}
        </p>
      </div>

      {!hasDados ? (
        <Card>
          <div className="flex flex-col items-center py-12 text-center gap-3">
            <Users className="w-10 h-10 text-[#334155]" />
            <p className="text-sm text-[#64748B] max-w-xs">
              Nenhum dado do SCA ainda. Faça o upload do CSV em{" "}
              <a href="/dashboard/configuracoes" className="text-[#F97316] hover:underline">Configurações</a>.
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {/* ── Resumo financeiro ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <FinCard label="Alunos ativos" value={ativos.length} color="text-[#22C55E]" bg="bg-[#22C55E]/10" icon={Users} />
            <FinCard label="Inadimplentes" value={inadimplentes.length} color="text-[#EF4444]" bg="bg-[#EF4444]/10" icon={AlertTriangle} />
            <FinCard
              label="Faturamento estimado"
              value={formatCurrency(faturamentoEstimado)}
              color="text-[#F97316]"
              bg="bg-[#F97316]/10"
              icon={DollarSign}
            />
            <FinCard
              label="Receita em risco"
              value={formatCurrency(faturamentoPerdido)}
              color="text-[#EF4444]"
              bg="bg-[#EF4444]/10"
              icon={TrendingUp}
            />
          </div>

          {/* ── Inadimplentes ── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                <CardTitle>Inadimplentes</CardTitle>
              </div>
              <Badge variant="error">{inadimplentes.length}</Badge>
            </CardHeader>
            {inadimplentes.length === 0 ? (
              <p className="text-sm text-[#475569] py-4 text-center">Nenhum inadimplente 🎉</p>
            ) : (
              <AlunoTable alunos={inadimplentes} showVencimento />
            )}
          </Card>

          {/* ── Aniversariantes ── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4 text-amber-400" />
                <CardTitle>Aniversariantes</CardTitle>
              </div>
              <div className="flex gap-2">
                <Badge variant="warning">{aniversariantesHoje.length} hoje</Badge>
                <Badge variant="default">{aniversariantesSemana.length} semana</Badge>
              </div>
            </CardHeader>
            {aniversariantesSemana.length === 0 ? (
              <p className="text-sm text-[#475569] py-4 text-center">Nenhum aniversariante nos próximos 7 dias.</p>
            ) : (
              <AlunoTable alunos={aniversariantesSemana} showNasc highlight={new Set(aniversariantesHoje.map((a) => a.id))} />
            )}
          </Card>

          {/* ── Inativos ── */}
          {inativos.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#64748B]" />
                  <CardTitle>Ex-alunos (inativos)</CardTitle>
                </div>
                <Badge variant="default">{inativos.length}</Badge>
              </CardHeader>
              <AlunoTable alunos={inativos} />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componentes ──────────────────────────────────────────────

function FinCard({
  label, value, color, bg, icon: Icon
}: {
  label: string; value: string | number; color: string; bg: string; icon: React.ElementType;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#64748B] font-medium mb-1">{label}</p>
          <p className="text-xl font-bold text-[#F1F5F9]">{value}</p>
        </div>
        <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
    </Card>
  );
}

function AlunoTable({
  alunos, showVencimento, showNasc, highlight
}: {
  alunos: Aluno[];
  showVencimento?: boolean;
  showNasc?: boolean;
  highlight?: Set<string>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#334155]">
            <th className="text-left py-2 px-3 text-[#64748B] font-medium">Nome</th>
            <th className="text-left py-2 px-3 text-[#64748B] font-medium">Telefone</th>
            <th className="text-left py-2 px-3 text-[#64748B] font-medium">Plano</th>
            {showVencimento && <th className="text-left py-2 px-3 text-[#64748B] font-medium">Vencimento</th>}
            {showNasc && <th className="text-left py-2 px-3 text-[#64748B] font-medium">Nascimento</th>}
          </tr>
        </thead>
        <tbody>
          {alunos.map((a) => (
            <tr
              key={a.id}
              className={`border-b border-[#1E293B] transition-colors ${
                highlight?.has(a.id) ? "bg-amber-400/5" : "hover:bg-[#293548]/40"
              }`}
            >
              <td className="py-2.5 px-3 text-[#F1F5F9] font-medium">
                {a.nome}
                {highlight?.has(a.id) && <span className="ml-2 text-amber-400 text-xs">🎂</span>}
              </td>
              <td className="py-2.5 px-3 text-[#94A3B8]">{a.telefone ?? "—"}</td>
              <td className="py-2.5 px-3 text-[#94A3B8]">{a.plano ?? "—"}</td>
              {showVencimento && <td className="py-2.5 px-3 text-[#EF4444] text-xs">{a.vencimento ?? "—"}</td>}
              {showNasc && <td className="py-2.5 px-3 text-[#475569]">{a.dataNasc ?? "—"}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function getAniversariantes(alunos: Aluno[], period: "today" | "week"): Aluno[] {
  const today = new Date();

  if (period === "today") {
    const todayMD = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}`;
    return alunos.filter((a) => {
      const p = (a.dataNasc ?? "").split("/");
      return p.length >= 2 && `${p[0]}/${p[1]}` === todayMD;
    });
  }

  const dates = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.add(`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return alunos.filter((a) => {
    const p = (a.dataNasc ?? "").split("/");
    return p.length >= 2 && dates.has(`${p[0]}/${p[1]}`);
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
