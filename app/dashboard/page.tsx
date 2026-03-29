export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageSquare,
  Calendar,
  Dumbbell,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  UserCheck,
  Cake,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();

  const [
    settings,
    totalLeads,
    totalConversas,
    conversasEscaladas,
    agendamentosFuturos,
    treinosPendentes,
    scaStats,
    aniversariantesHoje,
    aniversariantesSemana,
  ] = await Promise.all([
    prisma.settings.findFirst(),
    prisma.lead.count(),
    prisma.conversation.count(),
    prisma.conversation.count({ where: { escalated: true } }),
    prisma.appointment.count({
      where: { startTime: { gte: new Date() }, status: "SCHEDULED" },
    }),
    prisma.trainingSheet.count({ where: { status: "PENDING" } }),
    prisma.sCAAluno.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    getAniversariantes("today"),
    getAniversariantes("week"),
  ]);

  type ScaStat = { status: string; _count: { id: number } };
  const scaAtivos = (scaStats as ScaStat[]).find((s) => s.status === "ATIVO")?._count.id ?? 0;
  const scaInadimplentes = (scaStats as ScaStat[]).find((s) => s.status === "INADIMPLENTE")?._count.id ?? 0;
  const scaTotal = (scaStats as ScaStat[]).reduce((sum, s) => sum + s._count.id, 0);
  const scaConfigurado = scaTotal > 0;

  const whatsappConfigurado = !!(settings?.whatsappConnected && settings.whatsappAccessToken);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-[#64748B] mb-1">Bem-vindo de volta</p>
        <h1 className="text-2xl font-bold text-[#F1F5F9]">
          Olá, {session?.user.name} 👋
        </h1>
      </div>

      {/* Alertas de configuração */}
      {(!whatsappConfigurado || !scaConfigurado) && (
        <div className="flex flex-col gap-2 mb-8">
          {!whatsappConfigurado && (
            <AlertBanner
              icon={AlertCircle}
              color="orange"
              title="WhatsApp não configurado"
              desc={<>Configure em <Link href="/dashboard/configuracoes" className="text-[#F97316] hover:underline font-medium">Configurações</Link> para ativar o bot.</>}
            />
          )}
          {!scaConfigurado && (
            <AlertBanner
              icon={AlertCircle}
              color="blue"
              title="Dados do SCA não importados"
              desc={<>Faça o upload do CSV do SCA em <Link href="/dashboard/configuracoes" className="text-blue-400 hover:underline font-medium">Configurações</Link> para ver métricas de alunos.</>}
            />
          )}
        </div>
      )}

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Alunos Ativos"
          value={scaConfigurado ? String(scaAtivos) : "—"}
          sub={scaConfigurado ? `de ${scaTotal} cadastrados` : "Aguardando SCA"}
          icon={Users}
          color="text-[#F97316]"
          bg="bg-[#F97316]/10"
        />
        <MetricCard
          label="Inadimplentes"
          value={scaConfigurado ? String(scaInadimplentes) : "—"}
          sub={scaConfigurado ? `${Math.round((scaInadimplentes / (scaTotal || 1)) * 100)}% do total` : "Aguardando SCA"}
          icon={AlertTriangle}
          color="text-[#EF4444]"
          bg="bg-[#EF4444]/10"
        />
        <MetricCard
          label="Leads capturados"
          value={String(totalLeads)}
          sub={`${totalConversas} conversas no bot`}
          icon={TrendingUp}
          color="text-blue-400"
          bg="bg-blue-400/10"
          href="/dashboard/leads"
        />
        <MetricCard
          label="Agendamentos"
          value={String(agendamentosFuturos)}
          sub="próximos com Rafa"
          icon={Calendar}
          color="text-purple-400"
          bg="bg-purple-400/10"
          href="/dashboard/agendamentos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Treinos IA pendentes"
          value={String(treinosPendentes)}
          sub="aguardando aprovação do Rafa"
          icon={Dumbbell}
          color="text-green-400"
          bg="bg-green-400/10"
          href="/dashboard/treinos"
          highlight={treinosPendentes > 0}
        />
        <MetricCard
          label="Conversas escaladas"
          value={String(conversasEscaladas)}
          sub="precisam de atenção"
          icon={MessageSquare}
          color="text-[#EF4444]"
          bg="bg-[#EF4444]/10"
          href="/dashboard/conversas"
          highlight={conversasEscaladas > 0}
        />
        <MetricCard
          label="Aniversariantes"
          value={String(aniversariantesHoje.length)}
          sub={`hoje · ${aniversariantesSemana.length} essa semana`}
          icon={Cake}
          color="text-amber-400"
          bg="bg-amber-400/10"
          href="/dashboard/relatorios"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Aniversariantes de hoje */}
        {aniversariantesHoje.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Cake className="w-4 h-4 text-amber-400" />
              <p className="text-sm font-semibold text-[#94A3B8]">Aniversariantes hoje 🎂</p>
              <Badge variant="warning">{aniversariantesHoje.length}</Badge>
            </div>
            <div className="flex flex-col gap-1.5">
              {aniversariantesHoje.slice(0, 5).map((a: AlunoBasico) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#F1F5F9]">{a.nome}</span>
                  <span className="text-xs text-[#475569]">{a.telefone ?? "—"}</span>
                </div>
              ))}
              {aniversariantesHoje.length > 5 && (
                <p className="text-xs text-[#475569]">+{aniversariantesHoje.length - 5} mais...</p>
              )}
            </div>
          </Card>
        )}

        {/* Inadimplentes recentes */}
        {scaConfigurado && scaInadimplentes > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <p className="text-sm font-semibold text-[#94A3B8]">Inadimplentes recentes</p>
              <Badge variant="error">{scaInadimplentes}</Badge>
            </div>
            <InadimplentesList />
          </Card>
        )}

        {/* Checklist de configuração se tudo ok */}
        {whatsappConfigurado && scaConfigurado && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-[#22C55E]" />
              <p className="text-sm font-semibold text-[#94A3B8]">Sistema operacional</p>
              <Badge variant="success" dot>Ativo</Badge>
            </div>
            <div className="flex flex-col gap-2 text-sm text-[#64748B]">
              <StatusLine ok={whatsappConfigurado} label="Bot WhatsApp ativo" />
              <StatusLine ok={scaConfigurado} label="Dados SCA importados" />
              <StatusLine ok={!!settings?.googleConnected} label="Google Calendar conectado" />
              <StatusLine ok={!!settings?.catracaConnected} label="Catraca conectada" />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Componentes ──────────────────────────────────────────────

function MetricCard({
  label, value, sub, icon: Icon, color, bg, href, highlight
}: {
  label: string; value: string; sub: string;
  icon: React.ElementType; color: string; bg: string;
  href?: string; highlight?: boolean;
}) {
  const content = (
    <Card className={highlight ? "border-[#F97316]/30" : ""}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#64748B] font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-[#F1F5F9]">{value}</p>
          <p className="text-xs text-[#475569] mt-1">{sub}</p>
        </div>
        <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
      </div>
    </Card>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

function AlertBanner({
  icon: Icon, color, title, desc
}: {
  icon: React.ElementType; color: "orange" | "blue";
  title: string; desc: React.ReactNode;
}) {
  const c = color === "orange"
    ? { bg: "bg-[#F97316]/5", border: "border-[#F97316]/20", text: "text-[#F97316]" }
    : { bg: "bg-blue-400/5", border: "border-blue-400/20", text: "text-blue-400" };

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-4 flex items-start gap-3`}>
      <Icon className={`w-5 h-5 ${c.text} shrink-0 mt-0.5`} />
      <div>
        <p className={`text-sm font-semibold ${c.text}`}>{title}</p>
        <p className="text-sm text-[#94A3B8] mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function StatusLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-[#22C55E]" : "bg-[#334155]"}`} />
      <span className={ok ? "text-[#94A3B8]" : "text-[#475569]"}>{label}</span>
    </div>
  );
}

async function InadimplentesList() {
  const lista = await prisma.sCAAluno.findMany({
    where: { status: "INADIMPLENTE" },
    take: 5,
    orderBy: { nome: "asc" },
  });

  return (
    <div className="flex flex-col gap-1.5">
      {lista.map((a: { id: string; nome: string; vencimento: string | null }) => (
        <div key={a.id} className="flex items-center justify-between text-sm">
          <span className="text-[#F1F5F9] truncate">{a.nome}</span>
          <span className="text-xs text-[#475569] shrink-0 ml-2">{a.vencimento ?? "—"}</span>
        </div>
      ))}
      <Link href="/dashboard/relatorios" className="text-xs text-[#F97316] hover:underline mt-1">
        Ver todos →
      </Link>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

type AlunoBasico = { id: string; nome: string; telefone: string | null };

async function getAniversariantes(period: "today" | "week"): Promise<AlunoBasico[]> {
  const alunos: Array<{ id: string; nome: string; telefone: string | null; dataNasc: string | null }> =
    await prisma.sCAAluno.findMany({
      where: { dataNasc: { not: null }, status: { not: "INATIVO" } },
      select: { id: true, nome: true, telefone: true, dataNasc: true },
    });

  const today = new Date();
  const todayMD = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}`;

  if (period === "today") {
    return alunos.filter((a) => {
      const parts = (a.dataNasc ?? "").split("/");
      if (parts.length < 2) return false;
      return `${parts[0]}/${parts[1]}` === todayMD;
    });
  }

  // Próximos 7 dias
  const dates = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.add(`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return alunos.filter((a) => {
    const parts = (a.dataNasc ?? "").split("/");
    if (parts.length < 2) return false;
    return dates.has(`${parts[0]}/${parts[1]}`);
  });
}
