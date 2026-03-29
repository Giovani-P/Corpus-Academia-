"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, AlertTriangle, Star, UserCheck, Play, Loader2, CheckCircle, XCircle } from "lucide-react";

type AutomacaoResult = {
  enviadas: number;
  ignoradas: number;
  erros: number;
  total: number;
  detalhes?: string[];
  error?: string;
};

type AutomacaoStatus = "idle" | "running" | "done" | "error";

type AutomacaoState = {
  status: AutomacaoStatus;
  result: AutomacaoResult | null;
};

const AUTOMACOES = [
  {
    key: "aniversario",
    label: "Aniversariantes",
    desc: "Envia mensagem de parabéns para alunos que fazem aniversário hoje.",
    icon: Cake,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    endpoint: "/api/automacoes/aniversario",
  },
  {
    key: "cobranca",
    label: "Cobrança de Inadimplentes",
    desc: "Envia mensagem amigável de cobrança para alunos inadimplentes. Respeita janela de 7 dias entre envios.",
    icon: AlertTriangle,
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
    endpoint: "/api/automacoes/cobranca",
  },
  {
    key: "nps",
    label: "Pesquisa NPS",
    desc: "Envia pesquisa de satisfação (nota 0–10) para alunos que completaram 30 dias de academia.",
    icon: Star,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    endpoint: "/api/automacoes/nps",
  },
  {
    key: "reativacao",
    label: "Reativação de Ex-alunos",
    desc: "Envia mensagem de retorno para alunos inativos nas janelas de 30, 60 e 90 dias após saída.",
    icon: UserCheck,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    endpoint: "/api/automacoes/reativacao",
  },
] as const;

type AutomacaoKey = (typeof AUTOMACOES)[number]["key"];

export default function AutomacoesPage() {
  const [states, setStates] = useState<Record<AutomacaoKey, AutomacaoState>>({
    aniversario: { status: "idle", result: null },
    cobranca: { status: "idle", result: null },
    nps: { status: "idle", result: null },
    reativacao: { status: "idle", result: null },
  });

  async function disparar(key: AutomacaoKey, endpoint: string) {
    setStates((prev) => ({ ...prev, [key]: { status: "running", result: null } }));

    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data: AutomacaoResult = await res.json();

      if (!res.ok || data.error) {
        setStates((prev) => ({
          ...prev,
          [key]: { status: "error", result: data },
        }));
      } else {
        setStates((prev) => ({
          ...prev,
          [key]: { status: "done", result: data },
        }));
      }
    } catch {
      setStates((prev) => ({
        ...prev,
        [key]: { status: "error", result: { enviadas: 0, ignoradas: 0, erros: 1, total: 0, error: "Erro de rede" } },
      }));
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Automações</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Disparos manuais de mensagens automáticas via WhatsApp. Normalmente executados por agendamento diário.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {AUTOMACOES.map((automacao) => {
          const state = states[automacao.key];
          const Icon = automacao.icon;

          return (
            <Card key={automacao.key}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 ${automacao.bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${automacao.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-[#F1F5F9]">{automacao.label}</p>
                    {state.status === "done" && (
                      <Badge variant="success">Executado</Badge>
                    )}
                    {state.status === "error" && (
                      <Badge variant="error">Erro</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mb-3">{automacao.desc}</p>

                  {/* Resultado */}
                  {state.result && (
                    <div className="mb-3">
                      {state.result.error ? (
                        <div className="flex items-center gap-1.5 text-xs text-[#EF4444]">
                          <XCircle className="w-3.5 h-3.5" />
                          {state.result.error}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className="text-[#22C55E]">✅ {state.result.enviadas} enviadas</span>
                          <span className="text-[#64748B]">⏭ {state.result.ignoradas} ignoradas</span>
                          {state.result.erros > 0 && (
                            <span className="text-[#EF4444]">❌ {state.result.erros} erros</span>
                          )}
                          <span className="text-[#475569]">de {state.result.total} elegíveis</span>
                        </div>
                      )}

                      {state.result.detalhes && state.result.detalhes.length > 0 && (
                        <div className="mt-2 max-h-24 overflow-y-auto space-y-0.5">
                          {state.result.detalhes.map((d, i) => (
                            <p key={i} className="text-xs text-[#475569]">{d}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => disparar(automacao.key, automacao.endpoint)}
                    disabled={state.status === "running"}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#F97316] hover:text-[#FB923C] disabled:text-[#64748B] disabled:cursor-not-allowed transition-colors"
                  >
                    {state.status === "running" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Executando...
                      </>
                    ) : state.status === "done" ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span className="text-[#22C55E]">Concluído</span>
                        <span className="text-[#64748B] ml-1">· Disparar novamente</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Disparar agora
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-[#1E293B] rounded-xl border border-[#334155]">
        <p className="text-xs text-[#64748B]">
          <span className="text-[#475569] font-medium">Dica:</span> Configure um cron job externo (ex: cron-job.org) para chamar esses endpoints diariamente às 8h, apontando para{" "}
          <code className="text-[#F97316] text-[11px]">POST /api/automacoes/aniversario</code> etc.
          As automações são idempotentes — enviam apenas uma vez por período configurado.
        </p>
      </div>
    </div>
  );
}
