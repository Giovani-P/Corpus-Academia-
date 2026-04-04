"use client";

import { Trash2 } from "lucide-react";

export function DeleteVideoButton({ videoId }: { videoId: string }) {
  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar este roteiro?")) return;

    try {
      const res = await fetch(`/api/videos/${videoId}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Erro ao deletar");
        return;
      }
      window.location.reload();
    } catch (err) {
      alert("Erro ao deletar");
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 hover:bg-[#293548] rounded-lg transition-colors"
      title="Deletar roteiro"
    >
      <Trash2 className="w-4 h-4 text-[#EF4444]" />
    </button>
  );
}
