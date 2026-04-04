export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Copy } from "lucide-react";
import { VideoForm } from "./video-form";
import { DeleteVideoButton } from "./delete-button";

type VideoRoteiro = {
  id: string;
  tema: string;
  categoria: string;
  duracao: string;
  roteiro: string;
  hashtags: string | null;
  createdAt: Date;
};

export default async function VideosPage() {
  const videos: VideoRoteiro[] = await prisma.videoRoteiro.findMany({
    orderBy: { createdAt: "desc" },
  });

  const categoriaColor = {
    MUSCULACAO: "text-red-400",
    NATACAO: "text-blue-400",
    SUPLEMENTOS: "text-purple-400",
    MOTIVACAO: "text-amber-400",
    DICA: "text-green-400",
  } as Record<string, string>;

  const categoriaLabel = {
    MUSCULACAO: "Musculação",
    NATACAO: "Natação",
    SUPLEMENTOS: "Suplementos",
    MOTIVACAO: "Motivação",
    DICA: "Dica",
  } as Record<string, string>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Gerador de Roteiros Virais</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Crie roteiros de vídeos prontos para gravar com a ajuda de IA.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Form de geração ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#F97316]" />
              <CardTitle>Novo Roteiro</CardTitle>
            </div>
          </CardHeader>
          <VideoForm />
        </Card>

        {/* ── Histórico ── */}
        {videos.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-12 text-center gap-3">
              <Video className="w-10 h-10 text-[#334155]" />
              <p className="text-sm text-[#64748B]">
                Nenhum roteiro gerado ainda. Crie um novo acima!
              </p>
            </div>
          </Card>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-[#94A3B8]">Histórico</h2>
              <Badge variant="default">{videos.length}</Badge>
            </div>

            <div className="flex flex-col gap-4">
              {videos.map((video) => (
                <Card key={video.id}>
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-[#F1F5F9]">{video.tema}</h3>
                          <Badge variant="default" className={categoriaColor[video.categoria as keyof typeof categoriaColor]}>
                            {categoriaLabel[video.categoria as keyof typeof categoriaLabel]}
                          </Badge>
                          <Badge variant="default">{video.duracao}</Badge>
                        </div>
                        <p className="text-xs text-[#64748B]">
                          {new Date(video.createdAt).toLocaleDateString("pt-BR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(video.roteiro);
                            alert("Roteiro copiado!");
                          }}
                          className="p-2 hover:bg-[#293548] rounded-lg transition-colors"
                          title="Copiar roteiro"
                        >
                          <Copy className="w-4 h-4 text-[#64748B]" />
                        </button>
                        <DeleteVideoButton videoId={video.id} />
                      </div>
                    </div>

                    {/* Roteiro */}
                    <div className="mb-4 max-h-64 overflow-y-auto bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                      <div className="prose prose-sm text-[#94A3B8] text-xs leading-relaxed max-w-none">
                        {video.roteiro.split("\n").map((line, i) => (
                          <div key={i} className="whitespace-pre-wrap">
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hashtags */}
                    {video.hashtags && (
                      <div>
                        <p className="text-xs text-[#64748B] mb-2">Hashtags sugeridas:</p>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(video.hashtags).map((tag: string, i: number) => (
                            <span key={i} className="text-xs bg-[#F97316]/10 text-[#F97316] px-2 py-1 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
