"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function VideoForm() {
  const [loading, setLoading] = useState(false);
  const [tema, setTema] = useState("");
  const [categoria, setCategoria] = useState("MUSCULACAO");
  const [duracao, setDuracao] = useState("60s");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/videos/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, categoria, duracao }),
      });

      if (!res.ok) {
        alert("Erro ao gerar roteiro");
        return;
      }

      // Recarrega página para mostrar novo vídeo
      window.location.reload();
    } catch (err) {
      alert("Erro ao gerar roteiro");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tema */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#94A3B8]">Tema do vídeo</label>
          <input
            type="text"
            placeholder="Ex: Como fazer rosca barra perfeita"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-[#293548] border border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B] outline-none transition-all focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20"
          />
        </div>

        {/* Categoria */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#94A3B8]">Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-[#293548] border border-[#334155] text-[#F1F5F9] outline-none transition-all focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20"
          >
            <option value="MUSCULACAO">💪 Musculação</option>
            <option value="NATACAO">🏊 Natação</option>
            <option value="SUPLEMENTOS">💊 Suplementos</option>
            <option value="MOTIVACAO">🔥 Motivação</option>
            <option value="DICA">💡 Dica</option>
          </select>
        </div>

        {/* Duração */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#94A3B8]">Duração</label>
          <select
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-[#293548] border border-[#334155] text-[#F1F5F9] outline-none transition-all focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20"
          >
            <option value="30s">📱 30 segundos</option>
            <option value="60s">⏱️ 60 segundos</option>
            <option value="90s">🎬 90 segundos</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || !tema}
        className="flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Gerando...
          </>
        ) : (
          <>✨ Gerar Roteiro</>
        )}
      </Button>
    </form>
  );
}
