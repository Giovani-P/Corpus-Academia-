import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, ExternalLink } from "lucide-react";
import { CopyButton } from "./copy-button";

export default function QrCodePage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const treinoUrl = `${baseUrl}/treino`;

  // QR Code via API pública (sem pacote npm, sem custo)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(treinoUrl)}&size=220x220&bgcolor=0F172A&color=F97316&margin=16`;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">QR Code — Ficha de Treino</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Imprima e cole na academia. Alunos escaneiam, preenchem e o Rafa recebe para aprovar.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* QR Code card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#F97316]" />
              <CardTitle>QR Code da Academia</CardTitle>
            </div>
            <Badge variant="success" dot>Ativo</Badge>
          </CardHeader>

          <div className="flex flex-col items-center gap-6">
            {/* QR Image */}
            <div className="p-4 bg-[#0F172A] rounded-2xl border border-[#334155]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="QR Code para formulário de treino"
                width={220}
                height={220}
                className="rounded-xl"
              />
            </div>

            {/* URL */}
            <div className="w-full flex flex-col gap-2">
              <p className="text-xs text-[#64748B]">Link direto:</p>
              <div className="flex items-center gap-2 p-3 bg-[#0F172A] rounded-lg border border-[#334155]">
                <p className="text-sm text-[#94A3B8] flex-1 truncate font-mono">{treinoUrl}</p>
                <CopyButton text={treinoUrl} />
                <a
                  href={treinoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-[#293548] rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-[#64748B]" />
                </a>
              </div>
            </div>

            {/* Instruções */}
            <div className="w-full bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
              <p className="text-xs font-semibold text-[#94A3B8] mb-3">Como usar:</p>
              <ol className="flex flex-col gap-2 text-xs text-[#64748B]">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#F97316]/10 text-[#F97316] rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <span>Imprima este QR Code e cole em locais visíveis da academia (entrada, espelho, parede)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#F97316]/10 text-[#F97316] rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <span>O aluno escaneia com a câmera do celular e preenche o formulário</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#F97316]/10 text-[#F97316] rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <span>Nossa IA gera a ficha de treino automaticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#F97316]/10 text-[#F97316] rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                  <span>O Rafa revisa em <strong className="text-[#F97316]">Treinos IA</strong> e envia com 1 clique via WhatsApp</span>
                </li>
              </ol>
            </div>

            {/* Print button */}
            <a
              href={qrUrl}
              download="qrcode-corpus-treino.png"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-semibold rounded-xl transition-all"
            >
              <QrCode className="w-4 h-4" />
              Baixar imagem do QR Code
            </a>
          </div>
        </Card>

        {/* Tip */}
        <div className="bg-[#F97316]/5 border border-[#F97316]/20 rounded-xl p-4">
          <p className="text-sm text-[#F97316] font-semibold mb-1">💡 Dica</p>
          <p className="text-sm text-[#94A3B8]">
            Em produção, substitua <code className="text-[#F97316] text-xs">NEXT_PUBLIC_BASE_URL</code> no <code className="text-xs text-[#F97316]">.env</code> pelo domínio real da academia (ex: <code className="text-xs text-[#F97316]">https://corpus.seudominio.com</code>) para que o QR Code aponte para o link correto.
          </p>
        </div>
      </div>
    </div>
  );
}
