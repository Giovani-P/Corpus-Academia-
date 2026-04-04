import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-sm mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-[#22C55E]" />
        </div>

        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Pagamento Aprovado! 🎉</h1>
        <p className="text-[#94A3B8] mb-6">
          Sua matrícula foi confirmada com sucesso. Você receberá um email de confirmação em breve.
        </p>

        <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6 mb-6">
          <p className="text-sm text-[#64748B] mb-2">Próximos passos:</p>
          <ul className="text-sm text-[#94A3B8] text-left space-y-2">
            <li>✅ Você receberá um WhatsApp com instruções</li>
            <li>✅ Acesse o painel com suas credenciais</li>
            <li>✅ Configure seu perfil completo</li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-lg font-semibold transition-colors"
        >
          ← Voltar para home
        </Link>
      </div>
    </div>
  );
}
