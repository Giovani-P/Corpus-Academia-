"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Send,
  Edit3,
  Loader2,
  User,
  Target,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { approveSheet, sendSheet } from "./actions";

type TrainingSheet = {
  id: string;
  nome: string;
  phone: string;
  objetivo: string;
  limitacoes: string | null;
  nivel: string;
  diasSemana: number;
  fichaGerada: string | null;
  fichaEditada: string | null;
  status: string;
  createdAt: Date;
};

const NIVEL_LABEL: Record<string, string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
};

export function TreinoCard({ sheet }: { sheet: TrainingSheet }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fichaText, setFichaText] = useState(sheet.fichaEditada ?? sheet.fichaGerada ?? "");
  const [approved, setApproved] = useState(false);
  const [sent, setSent] = useState(false);
  const [approving, setApproving] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleApprove() {
    setApproving(true);
    await approveSheet(sheet.id, fichaText);
    setApproving(false);
    setApproved(true);
  }

  async function handleSend() {
    setSending(true);
    await sendSheet(sheet.id);
    setSending(false);
    setSent(true);
  }

  const isDone = sent;

  return (
    <Card className={isDone ? "opacity-60" : ""}>
      {/* Header */}
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#F1F5F9]">{sheet.nome}</p>
            <Badge variant="warning" dot>{NIVEL_LABEL[sheet.nivel] ?? sheet.nivel}</Badge>
          </div>
          <p className="text-xs text-[#64748B] mt-1">{sheet.objetivo} · {sheet.diasSemana}x por semana</p>
          {sheet.limitacoes && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-400 truncate">{sheet.limitacoes}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {sent && <Badge variant="success" dot>Enviada</Badge>}
          {approved && !sent && <Badge variant="warning" dot>Aprovada</Badge>}
          {expanded ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="mt-4 border-t border-[#334155] pt-4 flex flex-col gap-4">
          {/* Info pills */}
          <div className="grid grid-cols-2 gap-2">
            <InfoPill icon={User} label="Aluno" value={sheet.nome} />
            <InfoPill icon={Target} label="Objetivo" value={sheet.objetivo} />
            <InfoPill icon={Calendar} label="Frequência" value={`${sheet.diasSemana}x/semana`} />
            <InfoPill icon={AlertTriangle} label="Limitações" value={sheet.limitacoes ?? "Nenhuma"} />
          </div>

          {/* Ficha */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Ficha gerada pela IA</p>
              {!editing && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-xs h-7">
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </Button>
              )}
            </div>

            {editing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={fichaText}
                  onChange={(e) => setFichaText(e.target.value)}
                  rows={20}
                  className="w-full px-3 py-2.5 rounded-lg text-xs bg-[#0F172A] border border-[#334155] text-[#F1F5F9] outline-none focus:border-[#F97316] font-mono resize-y"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(false)}
                  className="self-start text-xs"
                >
                  Fechar edição
                </Button>
              </div>
            ) : (
              <div className="bg-[#0F172A] rounded-xl p-4 text-xs text-[#94A3B8] leading-relaxed whitespace-pre-wrap font-mono max-h-96 overflow-y-auto border border-[#1E293B]">
                {fichaText || "Ficha não gerada."}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isDone && (
            <div className="flex gap-2 flex-wrap">
              {!approved ? (
                <Button
                  size="md"
                  onClick={handleApprove}
                  loading={approving}
                  disabled={approving}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprovar ficha
                </Button>
              ) : (
                <Button
                  size="md"
                  onClick={handleSend}
                  loading={sending}
                  disabled={sending}
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white border-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Enviar para {formatPhone(sheet.phone)}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 p-2.5 bg-[#0F172A] rounded-lg">
      <Icon className="w-3.5 h-3.5 text-[#F97316] shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-[#475569]">{label}</p>
        <p className="text-xs text-[#94A3B8] font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^55/, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return phone;
}
