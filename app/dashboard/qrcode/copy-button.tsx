"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 hover:bg-[#293548] rounded-lg transition-colors"
      title="Copiar link"
    >
      {copied ? (
        <Check className="w-4 h-4 text-[#22C55E]" />
      ) : (
        <Copy className="w-4 h-4 text-[#64748B]" />
      )}
    </button>
  );
}
