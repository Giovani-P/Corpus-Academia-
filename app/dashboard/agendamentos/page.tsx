import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

type Appointment = {
  id: string;
  phone: string;
  name: string | null;
  googleEventId: string | null;
  startTime: Date;
  endTime: Date;
  notes: string | null;
  status: string;
  createdAt: Date;
};

export default async function AgendamentosPage() {
  const now = new Date();

  const [proximos, anteriores] = await Promise.all([
    prisma.appointment.findMany({
      where: { startTime: { gte: now }, status: "SCHEDULED" },
      orderBy: { startTime: "asc" },
      take: 20,
    }),
    prisma.appointment.findMany({
      where: { startTime: { lt: now } },
      orderBy: { startTime: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Agendamentos</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Avaliações físicas agendadas com o Rafa pelo bot.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Próximos ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#F97316]" />
              <CardTitle>Próximos agendamentos</CardTitle>
            </div>
            <Badge variant="orange">{proximos.length}</Badge>
          </CardHeader>

          {proximos.length === 0 ? (
            <EmptyState text="Nenhum agendamento futuro. Quando alunos agendarem pelo bot, aparecerão aqui." />
          ) : (
            <div className="flex flex-col gap-3">
              {proximos.map((apt: Appointment) => (
                <AppointmentCard key={apt.id} apt={apt} />
              ))}
            </div>
          )}
        </Card>

        {/* ── Anteriores ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#64748B]" />
              <CardTitle>Histórico</CardTitle>
            </div>
            <Badge variant="default">{anteriores.length}</Badge>
          </CardHeader>

          {anteriores.length === 0 ? (
            <EmptyState text="Nenhum agendamento anterior." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Aluno</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Telefone</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Data</th>
                    <th className="text-left py-2 px-3 text-[#64748B] font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {anteriores.map((apt: Appointment) => (
                    <tr key={apt.id} className="border-b border-[#1E293B] hover:bg-[#293548]/40 transition-colors">
                      <td className="py-2.5 px-3 text-[#F1F5F9] font-medium">{apt.name ?? "—"}</td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">{formatPhone(apt.phone)}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{formatDateTime(apt.startTime)}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={apt.status} />
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

function AppointmentCard({ apt }: { apt: Appointment }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-[#0F172A] rounded-xl border border-[#334155]">
      <div className="shrink-0 bg-[#F97316]/10 rounded-xl p-3 text-center min-w-[60px]">
        <p className="text-xs text-[#F97316] font-bold uppercase">{formatMonth(apt.startTime)}</p>
        <p className="text-2xl font-bold text-[#F1F5F9] leading-tight">{formatDay(apt.startTime)}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#F1F5F9]">{apt.name ?? "Aluno sem nome"}</p>
        <p className="text-xs text-[#64748B] mt-0.5">{formatPhone(apt.phone)}</p>
        <p className="text-xs text-[#94A3B8] mt-1">
          <Clock className="w-3 h-3 inline mr-1" />
          {formatTime(apt.startTime)} – {formatTime(apt.endTime)}
        </p>
      </div>
      {apt.googleEventId && (
        <Badge variant="success" dot>No Calendar</Badge>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Calendar className="w-8 h-8 text-[#334155] mb-2" />
      <p className="text-sm text-[#475569] max-w-xs">{text}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "DONE") return <Badge variant="success" dot>Realizado</Badge>;
  if (status === "CANCELLED") return <Badge variant="error" dot>Cancelado</Badge>;
  return <Badge variant="warning" dot>Agendado</Badge>;
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^55/, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return phone;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

function formatDay(date: Date): string {
  return String(new Date(date).getDate()).padStart(2, "0");
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(date));
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}
