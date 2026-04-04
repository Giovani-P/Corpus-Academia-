"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [plano, setPlano] = useState("MENSAL");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const planos = [
    { id: "MENSAL", label: "Mensal", preco: 79.9, features: ["Acesso por 1 mês", "Suporte básico"] },
    {
      id: "TRIMESTRAL",
      label: "Trimestral",
      preco: 199.9,
      features: ["Acesso por 3 meses", "Suporte prioritário", "10% de desconto"],
    },
    {
      id: "ANUAL",
      label: "Anual",
      preco: 699.9,
      features: ["Acesso por 12 meses", "Suporte VIP", "42% de desconto", "Bônus exclusivo"],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano, nome, email, telefone }),
      });

      const data = await res.json();

      if (!res.ok || !data.init_point) {
        alert("Erro ao processar pagamento. Tente novamente.");
        return;
      }

      // Redirecionar para Mercado Pago
      window.location.href = data.init_point;
    } catch (err) {
      alert("Erro ao processar pagamento");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-[#F97316]/10 border border-[#F97316]/30 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">Escolha seu Plano</h1>
          <p className="text-[#64748B]">Comece sua transformação hoje</p>
          <p className="text-xs text-[#475569] mt-2">
            Ou{" "}
            <Link href="/login" className="text-[#F97316] hover:underline">
              faça login
            </Link>{" "}
            se já tem conta
          </p>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {planos.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlano(p.id)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                plano === p.id
                  ? "border-[#F97316] bg-[#F97316]/5"
                  : "border-[#334155] bg-[#1E293B] hover:border-[#F97316]/50"
              }`}
            >
              <h3 className="text-lg font-semibold text-[#F1F5F9] mb-2">{p.label}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-[#F1F5F9]">R$ {p.preco.toFixed(2)}</span>
              </div>
              <ul className="space-y-2 mb-4">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                    <Check className="w-4 h-4 text-[#22C55E]" />
                    {f}
                  </li>
                ))}
              </ul>
              {plano === p.id && (
                <div className="mt-4 pt-4 border-t border-[#F97316]/20">
                  <span className="text-xs text-[#F97316] font-semibold">SELECIONADO</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto bg-[#1E293B] rounded-xl p-8 border border-[#334155]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-[#94A3B8] mb-1.5 block">Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#293548] border border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B] outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#94A3B8] mb-1.5 block">Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#293548] border border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B] outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#94A3B8] mb-1.5 block">Telefone</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#293548] border border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B] outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !nome || !email || !telefone}
              className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>💳 Ir para Pagamento (Mercado Pago)</>
              )}
            </Button>

            <p className="text-xs text-[#475569] text-center mt-4">
              Você será redirecionado para o Mercado Pago para completar o pagamento de forma segura.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
