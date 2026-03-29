import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Waves } from "lucide-react";
import { OnboardingButton } from "./onboarding-button";

type Lead = {
  id: string;
  name: string | null;
  phone: string;
  objective: string | null;
  source: string;
  createdAt: Date;
};

type NatacaoEnrollment = {
  id: string;
  responsavelNome: string;
  phone: string;
  criancaNome: string;
  dataNasc: string;
  turma: string | null;
  necessidadesEspeciais: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export default async function LeadsPage() {
  const [leads, inscricoes] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.natacaoEnrollment.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Leads</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Contatos capturados pelo bot via WhatsApp.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Leads Academia ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#F97316]" />
              <CardTitle>Interessados na Academia</CardTitle>
            </div>
            <Badge variant="orange">{leads.length} lead{leads.length !== 1 ? "s" : ""}</Badge>
          </CardHeader>

          {leads.length === 0 ? (
            <EmptyState text="Nenhum lead capturado ainda. Quando alguém solicitar a aula experimental pelo WhatsApp, aparecerá aqui." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Nome</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Telefone</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Objetivo</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Data</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead: Lead) => (
                    <tr key={lead.id} className="border-b border-[#1E293B] hover:bg-[#293548]/40 transition-colors">
                      <td className="py-2.5 px-3 text-[#F1F5F9] font-medium">{lead.name ?? "—"}</td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">{formatPhone(lead.phone)}</td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">{lead.objective ?? "—"}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{formatDate(lead.createdAt)}</td>
                      <td className="py-2.5 px-3">
                        <OnboardingButton phone={lead.phone} name={lead.name ?? undefined} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ── Inscrições Natação ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-blue-400" />
              <CardTitle>Inscrições — Natação</CardTitle>
            </div>
            <Badge variant="default">{inscricoes.length} inscriç{inscricoes.length !== 1 ? "ões" : "ão"}</Badge>
          </CardHeader>

          {inscricoes.length === 0 ? (
            <EmptyState text="Nenhuma inscrição de natação ainda. As inscrições feitas pelo bot aparecerão aqui." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Responsável</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Criança</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Nasc.</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Turma</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {inscricoes.map((insc: NatacaoEnrollment) => (
                    <tr key={insc.id} className="border-b border-[#1E293B] hover:bg-[#293548]/40 transition-colors">
                      <td className="py-2.5 px-3 text-[#F1F5F9] font-medium">
                        <div>{insc.responsavelNome}</div>
                        <div className="text-xs text-[#475569]">{formatPhone(insc.phone)}</div>
                      </td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">{insc.criancaNome}</td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">{insc.dataNasc}</td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">{insc.turma ?? "A definir"}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={insc.status} />
                      </td>
                      <td className="py-2.5 px-3 text-[#475569]">{formatDate(insc.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Users className="w-10 h-10 text-[#334155] mb-3" />
      <p className="text-sm text-[#475569] max-w-sm">{text}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "CONFIRMED")
    return <Badge variant="success" dot>Confirmado</Badge>;
  if (status === "WAITING_LIST")
    return <Badge variant="warning" dot>Lista de espera</Badge>;
  return <Badge variant="default" dot>Pendente</Badge>;
}

function formatPhone(phone: string): string {
  if (!phone) return "—";
  // Remove código do país e formata
  const digits = phone.replace(/\D/g, "").replace(/^55/, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
