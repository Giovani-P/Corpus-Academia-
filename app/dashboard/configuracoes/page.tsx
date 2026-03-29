import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AcademiaInfoForm, WhatsappForm, CatracaForm, GoogleCalendarForm, SCAUploadButton } from "./forms";
import { MessageSquare, Calendar, FileSpreadsheet, KeyRound, Building2 } from "lucide-react";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const session = await getSession();
  const settings = await prisma.settings.findUnique({
    where: { userId: session!.user.id },
  });
  const { google } = await searchParams;

  const s = settings;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Configurações</h1>
        <p className="text-sm text-[#64748B] mt-1">Configure suas integrações. Tudo é salvo de forma segura.</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* ── INFORMAÇÕES DA ACADEMIA ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#F97316]" />
              <CardTitle>Informações da Academia</CardTitle>
            </div>
            <Badge variant="orange">Bot usa esses dados</Badge>
          </CardHeader>
          <AcademiaInfoForm settings={{
            academiaName: s?.academiaName,
            academiaHorarios: s?.academiaHorarios,
            academiaPrecos: s?.academiaPrecos,
            academiaModalidades: s?.academiaModalidades,
            natacaoTurmas: s?.natacaoTurmas,
            natacaoVagas: s?.natacaoVagas,
            botTone: s?.botTone,
          }} />
        </Card>

        {/* ── WHATSAPP ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-400" />
              <CardTitle>WhatsApp Business</CardTitle>
            </div>
            {s?.whatsappConnected
              ? <Badge variant="success" dot>Conectado</Badge>
              : <Badge variant="error" dot>Desconectado</Badge>}
          </CardHeader>
          <div className="bg-[#0F172A] rounded-lg p-3 mb-4 text-xs text-[#64748B] leading-relaxed">
            <p className="font-medium text-[#94A3B8] mb-1">Como obter as credenciais:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Acesse <span className="text-[#F97316]">business.facebook.com</span> e crie um app</li>
              <li>Adicione o produto <strong className="text-[#94A3B8]">WhatsApp</strong> ao seu app</li>
              <li>Copie o <strong className="text-[#94A3B8]">Phone Number ID</strong> e o <strong className="text-[#94A3B8]">Access Token</strong></li>
              <li>Cole nos campos abaixo e salve</li>
            </ol>
          </div>
          <WhatsappForm settings={{
            whatsappPhoneNumberId: s?.whatsappPhoneNumberId,
            whatsappAccessToken: s?.whatsappAccessToken,
          }} />
        </Card>

        {/* ── GOOGLE CALENDAR ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <CardTitle>Google Agenda — Rafa</CardTitle>
            </div>
            {s?.googleConnected
              ? <Badge variant="success" dot>Conectado</Badge>
              : <Badge variant="error" dot>Desconectado</Badge>}
          </CardHeader>
          <div className="bg-[#0F172A] rounded-lg p-3 mb-4 text-xs text-[#64748B] leading-relaxed">
            <p className="font-medium text-[#94A3B8] mb-1">Como conectar:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Clique em <strong className="text-[#94A3B8]">Autorizar com Google</strong> abaixo</li>
              <li>Faça login com a conta Google do Rafa</li>
              <li>Autorize o acesso ao Google Calendar</li>
              <li>Informe o ID do calendário (parece um e-mail)</li>
            </ol>
          </div>
          <GoogleCalendarForm
            settings={{ googleCalendarId: s?.googleCalendarId, googleConnected: s?.googleConnected }}
            googleFeedback={google}
          />
        </Card>

        {/* ── SCA ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              <CardTitle>SCA — Importar dados</CardTitle>
            </div>
            {s?.scaConnected
              ? <div className="flex items-center gap-2">
                  <Badge variant="success" dot>Ativo</Badge>
                  {s?.scaLastUpload && <span className="text-xs text-[#64748B]">Último: {new Date(s?.scaLastUpload).toLocaleDateString("pt-BR")}</span>}
                </div>
              : <Badge variant="default" dot>Aguardando upload</Badge>}
          </CardHeader>
          <div className="bg-[#0F172A] rounded-lg p-3 mb-4 text-xs text-[#64748B] leading-relaxed">
            <p className="font-medium text-[#94A3B8] mb-1">Como exportar do SCA:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>No SCA, vá em <strong className="text-[#94A3B8]">Relatórios → Alunos</strong></li>
              <li>Clique em <strong className="text-[#94A3B8]">Exportar relatório</strong> (canto inferior direito)</li>
              <li>Escolha o formato <strong className="text-[#94A3B8]">Excel (.xlsx) ou CSV</strong></li>
              <li>Arraste o arquivo abaixo ou clique para selecionar</li>
            </ol>
          </div>
          <SCAUploadButton />
        </Card>

        {/* ── CATRACA ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <CardTitle>Catraca</CardTitle>
            </div>
            {s?.catracaConnected
              ? <Badge variant="success" dot>Conectada</Badge>
              : <Badge variant="error" dot>Desconectada</Badge>}
          </CardHeader>
          <div className="bg-[#0F172A] rounded-lg p-3 mb-4 text-xs text-[#64748B] leading-relaxed">
            <p className="font-medium text-[#94A3B8] mb-1">Informações necessárias:</p>
            <p>Verifique com o suporte técnico da sua catraca o IP local, porta e credenciais de acesso.</p>
          </div>
          <CatracaForm settings={{
            catracaIp: s?.catracaIp,
            catracaPort: s?.catracaPort,
            catracaUsername: s?.catracaUsername,
          }} />
        </Card>

      </div>
    </div>
  );
}
