"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

export function OnboardingButton({ phone, name }: { phone: string; name?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function sendOnboarding() {
    if (!phone || status !== "idle") return;
    setStatus("sending");

    try {
      const res = await fetch("/api/whatsapp/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name }),
      });

      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[#22C55E]">
        <CheckCircle2 className="w-3.5 h-3.5" /> Enviado
      </span>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={sendOnboarding}
      disabled={status === "sending"}
      className="text-xs h-7 px-2"
    >
      {status === "sending" ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Send className="w-3.5 h-3.5" />
      )}
      {status === "error" ? "Erro" : "Onboarding"}
    </Button>
  );
}
