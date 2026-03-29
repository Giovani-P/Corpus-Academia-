"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { resolveConversation } from "./actions";

export function ResolveButton({ conversationId }: { conversationId: string }) {
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(false);

  async function handleResolve() {
    setLoading(true);
    await resolveConversation(conversationId);
    setResolved(true);
    setLoading(false);
  }

  if (resolved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[#22C55E]">
        <CheckCircle2 className="w-3.5 h-3.5" /> Resolvido
      </span>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleResolve}
      disabled={loading}
      className="text-xs h-7 px-3"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
      Marcar resolvido
    </Button>
  );
}
