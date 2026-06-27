"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import { Card, ContentType, stageLabels, contentTypeLabels } from "@/lib/types";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2, ArrowLeft, Calendar, CalendarCheck,
  Video, Gamepad2, Presentation, LayoutTemplate, Globe, Palette,
  Clock, TrendingUp, Search, X,
} from "lucide-react";
import { CardDetailSheet } from "@/components/kanban/card-detail-sheet";

/* ── Content type icon map ─────────────────────────────── */
const typeIcon: Record<ContentType, React.ReactNode> = {
  video:        <Video className="w-3.5 h-3.5" />,
  presentation: <Presentation className="w-3.5 h-3.5" />,
  game:         <Gamepad2 className="w-3.5 h-3.5" />,
  layout:       <LayoutTemplate className="w-3.5 h-3.5" />,
  site:         <Globe className="w-3.5 h-3.5" />,
  identity:     <Palette className="w-3.5 h-3.5" />,
};

const typeGradient: Record<ContentType, string> = {
  video:        "from-violet-500 to-purple-600",
  presentation: "from-sky-500 to-blue-600",
  game:         "from-emerald-500 to-teal-600",
  layout:       "from-pink-500 to-rose-600",
  site:         "from-cyan-500 to-sky-600",
  identity:     "from-fuchsia-500 to-pink-600",
};

/* ── Neon card ─────────────────────────────────────────── */
function NeonCompletedCard({
  card,
  campaignName,
  campaignColor,
  index,
  onClick,
}: {
  card: Card;
  campaignName: string;
  campaignColor: string;
  index: number;
  onClick: () => void;
}) {
  const plannedDate = card.dueDate
    ? format(parseISO(card.dueDate), "dd MMM yyyy", { locale: ptBR })
    : null;

  const actualDate = card.actualDeliveryDate
    ? format(parseISO(card.actualDeliveryDate), "dd MMM yyyy", { locale: ptBR })
    : null;

  const daysDiff = card.dueDate && card.actualDeliveryDate
    ? differenceInDays(parseISO(card.actualDeliveryDate), parseISO(card.dueDate))
    : null;

  const onTime = daysDiff !== null && daysDiff <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.055, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative rounded-2xl border border-emerald-500/25 bg-white/[0.04] backdrop-blur-xl overflow-hidden"
        animate={{
          boxShadow: [
            "0 0 6px rgba(16,185,129,0.15), 0 0 18px rgba(16,185,129,0.06)",
            "0 0 14px rgba(16,185,129,0.30), 0 0 40px rgba(16,185,129,0.10)",
            "0 0 6px rgba(16,185,129,0.15), 0 0 18px rgba(16,185,129,0.06)",
          ],
        }}
        transition={{ duration: 2.8 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{
          boxShadow:
            "0 0 18px rgba(16,185,129,0.55), 0 0 50px rgba(16,185,129,0.22), 0 0 90px rgba(16,185,129,0.08)",
          borderColor: "rgba(52,211,153,0.55)",
        }}
      >
        {/* Shimmer sweep on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

        {/* Emerald top bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

        {/* Faint inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] to-transparent pointer-events-none" />

        <div className="relative p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start gap-3">
            {/* Type icon */}
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${typeGradient[card.contentType]} flex items-center justify-center shrink-0 text-white shadow-md`}>
              {typeIcon[card.contentType]}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-white/90 leading-snug group-hover:text-emerald-300 transition-colors line-clamp-2">
                {card.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                {campaignName !== "Sem campanha" && (
                  <>
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: campaignColor, boxShadow: `0 0 5px ${campaignColor}80` }}
                    />
                    <span className="text-[11px] text-white/40 truncate">{campaignName}</span>
                    <span className="text-white/20">·</span>
                  </>
                )}
                <span className="text-[11px] text-white/40">{contentTypeLabels[card.contentType]}</span>
              </div>
            </div>

            {/* Completed badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400">Concluído</span>
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Planned */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Calendar className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30 mb-0.5">Prazo previsto</p>
                <p className="text-xs font-medium text-white/65">
                  {plannedDate ?? "—"}
                </p>
              </div>
            </div>

            {/* Actual */}
            <div className={`flex items-start gap-2 p-3 rounded-xl border ${
              actualDate
                ? "bg-emerald-500/[0.07] border-emerald-500/20"
                : "bg-white/[0.04] border-white/[0.06]"
            }`}>
              <CalendarCheck className={`w-4 h-4 shrink-0 mt-0.5 ${actualDate ? "text-emerald-400" : "text-white/20"}`} />
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30 mb-0.5">Entrega real</p>
                <p className={`text-xs font-medium ${actualDate ? "text-emerald-400" : "text-white/30 italic"}`}>
                  {actualDate ?? "Não registrada"}
                </p>
              </div>
            </div>
          </div>

          {/* Time delta */}
          {daysDiff !== null && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-white/30 shrink-0" />
              {daysDiff === 0 ? (
                <span className="text-[11px] text-emerald-400 font-medium">Entregue no prazo</span>
              ) : onTime ? (
                <span className="text-[11px] text-emerald-400 font-medium">
                  {Math.abs(daysDiff)} {Math.abs(daysDiff) === 1 ? "dia" : "dias"} antes do prazo
                </span>
              ) : (
                <span className="text-[11px] text-amber-400 font-medium">
                  {daysDiff} {daysDiff === 1 ? "dia" : "dias"} após o prazo
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Page ──────────────────────────────────────────────── */
export default function CompletedPage() {
  const router    = useRouter();
  const campaigns = useCreatorStore((s) => s.campaigns);
  const cards     = useCreatorStore((s) => s.cards);

  const [search, setSearch]           = useState("");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [detailOpen, setDetailOpen]   = useState(false);

  const completedCards = useMemo(() => {
    return cards
      .filter((c) => c.stage === "published" || c.approvalStatus === "approved")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [cards]);

  const filtered = useMemo(() => {
    if (!search.trim()) return completedCards;
    const q = search.toLowerCase();
    return completedCards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (campaigns.find((camp) => camp.id === c.campaignId)?.name ?? "").toLowerCase().includes(q)
    );
  }, [completedCards, search, campaigns]);

  const onTimeCount = useMemo(() =>
    completedCards.filter((c) => {
      if (!c.dueDate || !c.actualDeliveryDate) return false;
      return differenceInDays(parseISO(c.actualDeliveryDate), parseISO(c.dueDate)) <= 0;
    }).length,
    [completedCards]
  );

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setDetailOpen(true);
  };

  return (
    <>
      <CardDetailSheet card={selectedCard} open={detailOpen} onOpenChange={setDetailOpen} />

      <div
        className="min-h-full"
        style={{
          background: `
            radial-gradient(ellipse 65% 40% at 50% 0%, rgba(16,185,129,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 30% 25% at 95% 85%, rgba(52,211,153,0.06) 0%, transparent 55%)
          `,
        }}
      >
        <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.09] flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2.5 mb-0.5">
                  <motion.div
                    animate={{
                      filter: [
                        "drop-shadow(0 0 4px rgba(16,185,129,0.4))",
                        "drop-shadow(0 0 10px rgba(16,185,129,0.8))",
                        "drop-shadow(0 0 4px rgba(16,185,129,0.4))",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                  <h1 className="text-2xl font-bold tracking-tight">Concluídos</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  {completedCards.length} {completedCards.length === 1 ? "tarefa finalizada" : "tarefas finalizadas"}
                </p>
              </div>
            </div>

            {/* Stats chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">
                  {onTimeCount} no prazo
                </span>
              </div>
              {completedCards.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08]">
                  <span className="text-xs text-white/50">
                    {Math.round((onTimeCount / completedCards.length) * 100)}% de pontualidade
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar tarefas concluídas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 backdrop-blur-sm transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grid */}
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((card, i) => {
                  const campaign = campaigns.find((c) => c.id === card.campaignId);
                  return (
                    <NeonCompletedCard
                      key={card.id}
                      card={card}
                      campaignName={campaign?.name ?? "Sem campanha"}
                      campaignColor={campaign?.color ?? "#10b981"}
                      index={i}
                      onClick={() => handleCardClick(card)}
                    />
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center gap-4"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 8px rgba(16,185,129,0.15)",
                      "0 0 22px rgba(16,185,129,0.35)",
                      "0 0 8px rgba(16,185,129,0.15)",
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-70" />
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-white/60">
                    {search ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa concluída ainda"}
                  </p>
                  <p className="text-xs text-white/30 mt-1">
                    {search
                      ? "Tente outro termo de busca"
                      : "Finalize tarefas no Kanban para vê-las aqui"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
}
