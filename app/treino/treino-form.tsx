"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ChevronRight } from "lucide-react";

type Step = "form" | "sending" | "done" | "error";

const NIVEIS = [
  { value: "INICIANTE", label: "Iniciante", desc: "Nunca treinei ou faz mais de 1 ano que parei" },
  { value: "INTERMEDIARIO", label: "Intermediário", desc: "Treino regularmente há alguns meses" },
  { value: "AVANCADO", label: "Avançado", desc: "Treino há mais de 1 ano com consistência" },
];

const OBJETIVOS = [
  "Emagrecer / perder gordura",
  "Ganhar massa muscular",
  "Melhorar condicionamento físico",
  "Saúde e qualidade de vida",
  "Reabilitação / fisioterapia",
  "Outro",
];

export function TreinoForm() {
  const [step, setStep] = useState<Step>("form");
  const [nivel, setNivel] = useState("INICIANTE");
  const [objetivo, setObjetivo] = useState("");
  const [objetivoCustom, setObjetivoCustom] = useState("");
  const [dias, setDias] = useState(3);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const nome = (data.get("nome") as string).trim();
    const phone = (data.get("phone") as string).trim().replace(/\D/g, "");
    const limitacoes = (data.get("limitacoes") as string).trim();
    const finalObjetivo = objetivo === "Outro" ? objetivoCustom.trim() : objetivo;

    const errs: Record<string, string> = {};
    if (!nome) errs.nome = "Informe seu nome";
    if (phone.length < 10) errs.phone = "Telefone inválido";
    if (!finalObjetivo) errs.objetivo = "Selecione um objetivo";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setStep("sending");

    try {
      const res = await fetch("/api/treino/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, phone, objetivo: finalObjetivo, limitacoes, nivel, diasSemana: dias }),
      });

      setStep(res.ok ? "done" : "error");
    } catch {
      setStep("error");
    }
  }

  if (step === "sending") {
    return (
      <div className="w-full max-w-lg flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 bg-[#F97316]/10 rounded-full flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[#F97316] animate-spin" />
        </div>
        <p className="text-[#94A3B8] text-sm">Nossa IA está montando seu treino...</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="w-full max-w-lg flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-14 h-14 bg-[#22C55E]/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-[#22C55E]" />
        </div>
        <h2 className="text-xl font-bold text-[#F1F5F9]">Ficha enviada para revisão!</h2>
        <p className="text-sm text-[#64748B] max-w-xs">
          O Rafa vai revisar e enviar sua ficha de treino pelo WhatsApp em breve. 💪
        </p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="w-full max-w-lg flex flex-col items-center justify-center py-16 gap-4 text-center">
        <p className="text-[#EF4444]">Ocorreu um erro. Tente novamente.</p>
        <button onClick={() => setStep("form")} className="text-sm text-[#F97316] underline">
          Voltar ao formulário
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-5">

      {/* Nome */}
      <Field label="Seu nome completo" error={errors.nome}>
        <input
          name="nome"
          placeholder="João da Silva"
          className={inputClass(!!errors.nome)}
        />
      </Field>

      {/* Telefone */}
      <Field label="WhatsApp (com DDD)" error={errors.phone}>
        <input
          name="phone"
          type="tel"
          placeholder="(11) 99999-9999"
          className={inputClass(!!errors.phone)}
        />
      </Field>

      {/* Objetivo */}
      <Field label="Qual é seu principal objetivo?" error={errors.objetivo}>
        <div className="flex flex-col gap-2">
          {OBJETIVOS.map((obj) => (
            <button
              key={obj}
              type="button"
              onClick={() => { setObjetivo(obj); setErrors((e) => ({ ...e, objetivo: "" })); }}
              className={`text-left px-4 py-2.5 rounded-lg text-sm border transition-all ${
                objetivo === obj
                  ? "bg-[#F97316]/10 border-[#F97316] text-[#F97316] font-medium"
                  : "bg-[#1E293B] border-[#334155] text-[#94A3B8] hover:border-[#475569]"
              }`}
            >
              {obj}
            </button>
          ))}
          {objetivo === "Outro" && (
            <input
              placeholder="Descreva seu objetivo"
              value={objetivoCustom}
              onChange={(e) => setObjetivoCustom(e.target.value)}
              className={inputClass(false) + " mt-1"}
            />
          )}
        </div>
      </Field>

      {/* Nível */}
      <Field label="Nível de condicionamento atual">
        <div className="flex flex-col gap-2">
          {NIVEIS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setNivel(value)}
              className={`text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                nivel === value
                  ? "bg-[#F97316]/10 border-[#F97316]"
                  : "bg-[#1E293B] border-[#334155] hover:border-[#475569]"
              }`}
            >
              <p className={`font-medium ${nivel === value ? "text-[#F97316]" : "text-[#F1F5F9]"}`}>{label}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </Field>

      {/* Dias por semana */}
      <Field label={`Dias disponíveis por semana: ${dias}x`}>
        <div className="flex items-center gap-3">
          {[2, 3, 4, 5, 6].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDias(d)}
              className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all ${
                dias === d
                  ? "bg-[#F97316] border-[#F97316] text-white"
                  : "bg-[#1E293B] border-[#334155] text-[#94A3B8] hover:border-[#475569]"
              }`}
            >
              {d}x
            </button>
          ))}
        </div>
      </Field>

      {/* Limitações */}
      <Field label="Alguma limitação física ou lesão? (opcional)">
        <textarea
          name="limitacoes"
          placeholder="Ex: dor no joelho direito, hérnia de disco, cirurgia recente..."
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-[#1E293B] border border-[#334155] text-[#F1F5F9] placeholder:text-[#475569] outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20 transition-all resize-none"
        />
      </Field>

      <input type="hidden" name="nivel" value={nivel} />
      <input type="hidden" name="diasSemana" value={dias} />

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold py-3.5 rounded-xl transition-all active:scale-95"
      >
        Gerar minha ficha de treino
        <ChevronRight className="w-4 h-4" />
      </button>

      <p className="text-xs text-[#475569] text-center">
        Sua ficha será revisada pelo Rafa antes de ser enviada. Respeite sempre os limites do seu corpo. 💪
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#94A3B8]">{label}</label>
      {children}
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return `w-full px-3.5 py-2.5 rounded-lg text-sm bg-[#1E293B] border ${
    hasError ? "border-[#EF4444]" : "border-[#334155]"
  } text-[#F1F5F9] placeholder:text-[#475569] outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20 transition-all`;
}
