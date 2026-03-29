import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, AlertCircle } from "lucide-react";
import { ResolveButton } from "./resolve-button";

type Conversation = {
  id: string;
  phone: string;
  flow: string;
  step: string;
  escalated: boolean;
  lastMessage: Date;
  createdAt: Date;
};

export default async function ConversasPage() {
  const [escaladas, todas] = await Promise.all([
    prisma.conversation.findMany({
      where: { escalated: true },
      orderBy: { lastMessage: "desc" },
    }),
    prisma.conversation.findMany({
      orderBy: { lastMessage: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Conversas</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Monitore as conversas do bot. Escaladas precisam de atenção manual.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Escaladas ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#EF4444]" />
              <CardTitle>Precisam de atenção</CardTitle>
            </div>
            <Badge variant={escaladas.length > 0 ? "error" : "default"} dot>
              {escaladas.length} conversa{escaladas.length !== 1 ? "s" : ""}
            </Badge>
          </CardHeader>

          {escaladas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="w-8 h-8 text-[#334155] mb-2" />
              <p className="text-sm text-[#475569]">
                Nenhuma conversa precisando de atenção.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#64748B] mb-3">
                Estas pessoas pediram atendimento humano. Responda pelo{" "}
                <span className="text-[#F97316]">Meta Business Suite</span>.
              </p>
              <div className="flex flex-col gap-2">
                {escaladas.map((conv: Conversation) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#F1F5F9]">{formatPhone(conv.phone)}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        <FlowLabel flow={conv.flow} /> — Último contato: {formatDate(conv.lastMessage)}
                      </p>
                    </div>
                    <ResolveButton conversationId={conv.id} />
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* ── Todas as conversas ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#F97316]" />
              <CardTitle>Todas as conversas</CardTitle>
            </div>
            <Badge variant="default">{todas.length} recentes</Badge>
          </CardHeader>

          {todas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="w-8 h-8 text-[#334155] mb-2" />
              <p className="text-sm text-[#475569]">Nenhuma conversa ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Telefone</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Flow</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Etapa</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Último contato</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todas.map((conv: Conversation) => (
                    <tr
                      key={conv.id}
                      className="border-b border-[#1E293B] hover:bg-[#293548]/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-[#F1F5F9] font-medium">{formatPhone(conv.phone)}</td>
                      <td className="py-2.5 px-3 text-[#94A3B8]"><FlowLabel flow={conv.flow} /></td>
                      <td className="py-2.5 px-3 text-[#475569] text-xs font-mono">{conv.step}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{formatDate(conv.lastMessage)}</td>
                      <td className="py-2.5 px-3">
                        {conv.escalated ? (
                          <Badge variant="error" dot>Escalada</Badge>
                        ) : (
                          <Badge variant="success" dot>Bot</Badge>
                        )}
                      </td>
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

function FlowLabel({ flow }: { flow: string }) {
  const labels: Record<string, string> = {
    ACADEMIA: "Academia",
    NATACAO: "Natação",
    AGENDAMENTO: "Agendamento",
    UNKNOWN: "Identificando...",
  };
  return <>{labels[flow] ?? flow}</>;
}

function formatPhone(phone: string): string {
  if (!phone) return "—";
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
