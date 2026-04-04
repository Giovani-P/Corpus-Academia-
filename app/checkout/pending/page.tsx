import Link from "next/link";
import { Clock } from "lucide-react";

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-sm mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Clock className="w-16 h-16 text-amber-400 animate-spin" />
        </div>

        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Pagamento Pendente</h1>
        <p className="text-[#94A3B8] mb-6">
          Seu pagamento está sendo processado. Você receberá uma confirmação em breve.
        </p>

        <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6 mb-6">
          <p className="text-sm text-[#94A3B8]">
            Isso pode levar alguns minutos. Se não receber a confirmação em 10 minutos, entre em contato conosco.
          </p>
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
