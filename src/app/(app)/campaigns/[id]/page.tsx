"use client";

import { useCreatorStore } from "@/lib/store/useCreatorStore";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Video, Presentation, Gamepad2, LayoutTemplate, Globe, Palette, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Campaign, ContentType } from "@/lib/types";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { cn } from "@/lib/utils";

const contentTypeFilters: { value: ContentType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "video",        label: "Vídeo",           icon: <Video className="w-3 h-3" />,         color: "#8b5cf6" },
  { value: "presentation", label: "Apresentação",    icon: <Presentation className="w-3 h-3" />,  color: "#3b82f6" },
  { value: "game",         label: "Game",            icon: <Gamepad2 className="w-3 h-3" />,      color: "#10b981" },
  { value: "layout",       label: "Layout",          icon: <LayoutTemplate className="w-3 h-3" />,color: "#ec4899" },
  { value: "site",         label: "Site",            icon: <Globe className="w-3 h-3" />,         color: "#0ea5e9" },
  { value: "identity",     label: "Id. Visual",      icon: <Palette className="w-3 h-3" />,       color: "#d946ef" },
];

export default function CampaignBoardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const campaigns = useCreatorStore((s) => s.campaigns);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [activeFilters, setActiveFilters] = useState<ContentType[]>([]);

  useEffect(() => {
    const found = campaigns.find((c) => c.id === id);
    if (found) setCampaign(found);
    else router.push("/campaigns");
  }, [id, campaigns, router]);

  if (!campaign) return null;

  const toggleFilter = (type: ContentType) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]
    );
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${campaign.color}0D 0%, transparent 55%)`,
      }}
    >
      {/* Header */}
      <header
        className="flex flex-col gap-3 px-5 py-4 border-b border-white/[0.06] shrink-0 z-10"
        style={{ background: "rgba(9,9,11,0.80)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => router.push("/campaigns")}
            className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Campaign identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, ${campaign.color}, ${campaign.color}bb)`,
                boxShadow: `0 4px 12px ${campaign.color}40`,
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white/90 leading-tight">{campaign.name}</h1>
              {campaign.description && (
                <p className="text-xs text-white/35 truncate">{campaign.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 pl-11 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/25 shrink-0">Filtrar:</span>
          <div className="flex gap-1.5 flex-wrap">
            {contentTypeFilters.map(({ value, label, icon, color }) => {
              const active = activeFilters.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleFilter(value)}
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all",
                    active
                      ? "text-white border-transparent"
                      : "bg-transparent text-white/40 border-white/[0.08] hover:border-white/[0.16] hover:text-white/70"
                  )}
                  style={active ? { backgroundColor: `${color}22`, borderColor: `${color}50`, color } : {}}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </div>
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-5 overflow-hidden">
        <KanbanBoard campaignId={campaign.id} activeFilters={activeFilters} />
      </main>
    </div>
  );
}
