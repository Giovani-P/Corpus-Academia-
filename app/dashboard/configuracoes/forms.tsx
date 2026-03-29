"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  saveWhatsappConfig,
  saveCatracaConfig,
  saveAcademiaInfo,
  saveGoogleCalendarConfig,
} from "./actions";
import { CheckCircle2, Calendar, FileSpreadsheet, Upload, Loader2 } from "lucide-react";

type ActionState = { success: true } | { error: string } | null;
const init: ActionState = null;

// ── ACADEMIA INFO ──────────────────────────────────────────
export function AcademiaInfoForm({ settings }: { settings: Record<string, string | null | undefined> }) {
  const [state, action, pending] = useActionState(saveAcademiaInfo, init);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Input id="name" name="name" label="Nome da academia" placeholder="Academia Corpus" defaultValue={settings.academiaName ?? ""} />
      <Input id="horarios" name="horarios" label="Horários de funcionamento" placeholder="Seg-Sex 6h–22h | Sáb 8h–16h | Dom 8h–12h" defaultValue={settings.academiaHorarios ?? ""} />
      <Input id="precos" name="precos" label="Planos e preços" placeholder="Mensal R$89 | Trimestral R$240 | Anual R$840" defaultValue={settings.academiaPrecos ?? ""} />
      <Input id="modalidades" name="modalidades" label="Modalidades oferecidas" placeholder="Musculação, Natação, Funcional, Pilates" defaultValue={settings.academiaModalidades ?? ""} />
      <div className="grid grid-cols-2 gap-4">
        <Input id="natacaoTurmas" name="natacaoTurmas" label="Turmas de natação" placeholder="Infantil 4–7 anos | 8–12 anos | Adulto" defaultValue={settings.natacaoTurmas ?? ""} />
        <Input id="natacaoVagas" name="natacaoVagas" label="Vagas por turma" placeholder="10 vagas cada" defaultValue={settings.natacaoVagas ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#94A3B8]">Tom do bot</label>
        <select name="botTone" defaultValue={settings.botTone ?? "DESCONTRAIDO"} className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-[#293548] border border-[#334155] text-[#F1F5F9] outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20 transition-all">
          <option value="DESCONTRAIDO">Descontraído e amigável</option>
          <option value="FORMAL">Formal e profissional</option>
        </select>
      </div>
      {"error" in (state ?? {}) && <p className="text-sm text-[#EF4444]">{(state as { error: string }).error}</p>}
      {"success" in (state ?? {}) && <p className="text-sm text-[#22C55E] flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!</p>}
      <Button type="submit" loading={pending} size="md" className="self-start mt-1">Salvar informações</Button>
    </form>
  );
}

// ── WHATSAPP ──────────────────────────────────────────────
export function WhatsappForm({ settings }: { settings: Record<string, string | null | boolean | undefined> }) {
  const [state, action, pending] = useActionState(saveWhatsappConfig, init);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Input id="phoneNumberId" name="phoneNumberId" label="Phone Number ID" placeholder="123456789012345" defaultValue={(settings.whatsappPhoneNumberId as string) ?? ""} />
      <Input id="accessToken" name="accessToken" type="password" label="Access Token" placeholder="EAABs..." defaultValue={settings.whatsappAccessToken ? "••••••••••••" : ""} />
      {"error" in (state ?? {}) && <p className="text-sm text-[#EF4444]">{(state as { error: string }).error}</p>}
      {"success" in (state ?? {}) && <p className="text-sm text-[#22C55E] flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Conectado com sucesso!</p>}
      <Button type="submit" loading={pending} size="md" className="self-start">Salvar e conectar</Button>
    </form>
  );
}

// ── GOOGLE CALENDAR ──────────────────────────────────────
export function GoogleCalendarForm({
  settings,
  googleFeedback,
}: {
  settings: Record<string, string | null | boolean | undefined>;
  googleFeedback?: string;
}) {
  const [state, action, pending] = useActionState(saveGoogleCalendarConfig, null);
  return (
    <div className="flex flex-col gap-4">
      {googleFeedback === "success" && (
        <p className="text-sm text-[#22C55E] flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> Google Calendar autorizado com sucesso!
        </p>
      )}
      {googleFeedback === "error" && (
        <p className="text-sm text-[#EF4444]">Erro ao autorizar. Tente novamente.</p>
      )}
      <a href="/api/auth/google">
        <Button variant="ghost" size="md" type="button">
          <Calendar className="w-4 h-4" />
          {settings.googleConnected ? "Reutorizar com Google" : "Autorizar com Google"}
        </Button>
      </a>
      <form action={action} className="flex flex-col gap-4">
        <Input
          id="calendarId"
          name="calendarId"
          label="ID do calendário"
          placeholder="rafa@gmail.com"
          defaultValue={(settings.googleCalendarId as string) ?? ""}
        />
        {"error" in (state ?? {}) && (
          <p className="text-sm text-[#EF4444]">{(state as { error: string }).error}</p>
        )}
        {"success" in (state ?? {}) && (
          <p className="text-sm text-[#22C55E] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> ID salvo!
          </p>
        )}
        <Button type="submit" loading={pending} size="md" className="self-start">
          Salvar ID do calendário
        </Button>
      </form>
    </div>
  );
}

// ── CATRACA ───────────────────────────────────────────────
export function CatracaForm({ settings }: { settings: Record<string, string | null | boolean | undefined> }) {
  const [state, action, pending] = useActionState(saveCatracaConfig, init);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input id="ip" name="ip" label="IP da catraca" placeholder="192.168.1.100" defaultValue={(settings.catracaIp as string) ?? ""} />
        <Input id="port" name="port" label="Porta" placeholder="8080" defaultValue={(settings.catracaPort as string) ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input id="username" name="username" label="Usuário" placeholder="admin" defaultValue={(settings.catracaUsername as string) ?? ""} />
        <Input id="password" name="password" type="password" label="Senha" placeholder="••••••••" />
      </div>
      {"error" in (state ?? {}) && <p className="text-sm text-[#EF4444]">{(state as { error: string }).error}</p>}
      {"success" in (state ?? {}) && <p className="text-sm text-[#22C55E] flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Configuração salva!</p>}
      <Button type="submit" loading={pending} size="md" className="self-start">Salvar configuração</Button>
    </form>
  );
}

// ── SCA UPLOAD ────────────────────────────────────────────
type UploadState = { success: true; total: number; ativos: number; inadimplentes: number } | { error: string } | null;

export function SCAUploadButton() {
  const [state, setState] = useState<UploadState>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setState(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/sca/upload", { method: "POST", body: form });
      const data = await res.json();
      setState(res.ok ? { success: true, ...data } : { error: data.error ?? "Erro ao processar" });
    } catch {
      setState({ error: "Erro de conexão" });
    } finally {
      setUploading(false);
      // Reseta o input
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all group ${uploading ? "border-[#F97316]/50 bg-[#F97316]/5" : "border-[#334155] hover:border-[#F97316]/50 hover:bg-[#F97316]/5"}`}>
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 text-[#F97316] animate-spin mb-2" />
            <span className="text-sm text-[#94A3B8]">Processando arquivo...</span>
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-8 h-8 text-[#475569] group-hover:text-[#F97316] mb-2 transition-colors" />
            <span className="text-sm text-[#64748B] group-hover:text-[#94A3B8] transition-colors">Clique ou arraste o arquivo CSV/Excel aqui</span>
            <span className="text-xs text-[#475569] mt-1">.xlsx ou .csv — exportado do SCA</span>
          </>
        )}
        <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFile} disabled={uploading} />
      </label>

      {state && "error" in state && (
        <p className="text-sm text-[#EF4444]">{state.error}</p>
      )}
      {state && "success" in state && (
        <div className="flex flex-col gap-1 p-3 bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-lg">
          <p className="text-sm text-[#22C55E] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> {state.total} alunos importados com sucesso!
          </p>
          <p className="text-xs text-[#64748B]">
            Ativos: <strong className="text-[#22C55E]">{state.ativos}</strong> · Inadimplentes: <strong className="text-[#EF4444]">{state.inadimplentes}</strong>
          </p>
        </div>
      )}

      <p className="text-xs text-[#475569] text-center flex items-center justify-center gap-1.5">
        <Upload className="w-3 h-3" /> O sistema processa automaticamente: inadimplentes, aniversariantes e novos alunos.
      </p>
    </div>
  );
}
