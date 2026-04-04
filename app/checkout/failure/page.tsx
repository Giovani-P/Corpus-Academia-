import Link from "next/link";
import { XCircle } from "lucide-react";

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-sm mx-auto text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="w-16 h-16 text-[#EF4444]" />
        </div>

        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Pagamento Recusado</h1>
        <p className="text-[#94A3B8] mb-6">
          Infelizmente o pagamento não foi processado. Por favor, tente novamente ou entre em contato conosco.
        </p>

        <div className="bg-[#1E293B] border border-[#EF4444]/20 rounded-lg p-6 mb-6">
          <p className="text-sm text-[#94A3B8]">
            Se o problema persistir, entre em contato pelo WhatsApp: <br />
            <span className="text-[#F97316] font-semibold">(11) 9999-9999</span>
          </p>
        </div>

        <Link
          href="/checkout"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-lg font-semibold transition-colors"
        >
          ↻ Tentar Novamente
        </Link>
      </div>
    </div>
  );
}
