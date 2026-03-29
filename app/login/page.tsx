"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell } from "lucide-react";

const initialState = { error: "" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await loginAction(formData);
      return result ?? initialState;
    },
    initialState
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
      {/* Glow de fundo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F97316]/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#F97316]/10 border border-[#F97316]/30 rounded-2xl flex items-center justify-center mb-4">
            <Dumbbell className="w-7 h-7 text-[#F97316]" />
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">Corpus Academia</h1>
          <p className="text-sm text-[#64748B] mt-1">Painel de gestão</p>
        </div>

        {/* Card de login */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-xl">
          <form action={formAction} className="flex flex-col gap-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="E-mail"
              placeholder="admin@corpusacademia.com.br"
              autoComplete="email"
              required
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Senha"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            {state?.error && (
              <p className="text-sm text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-3 py-2">
                {state.error}
              </p>
            )}

            <Button type="submit" loading={pending} size="lg" className="mt-1 w-full">
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#475569] mt-6">
          Sistema exclusivo — Academia Corpus
        </p>
      </div>
    </div>
  );
}
