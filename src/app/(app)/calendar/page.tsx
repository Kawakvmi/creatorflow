"use client";

import { useMemo, useState } from "react";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/lib/types";
import { CardDetailSheet } from "@/components/kanban/card-detail-sheet";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const cards = useCreatorStore((state) => state.cards);
  const campaigns = useCreatorStore((state) => state.campaigns);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { locale: ptBR });
    const calEnd = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const getCardsForDay = (day: Date) => {
    return cards.filter((card) => {
      if (!card.dueDate) return false;
      return isSameDay(parseISO(card.dueDate), day);
    });
  };

  const today = new Date();

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setDetailOpen(true);
  };

  return (
    <>
      <div
        className="min-h-full"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(109,40,217,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 100% 100%, rgba(79,70,229,0.06) 0%, transparent 55%)
          `,
        }}
      >
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
            <p className="text-muted-foreground text-sm">Visualize seus prazos e entregas por data.</p>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.09] hover:border-zinc-300 dark:hover:border-white/[0.14] backdrop-blur-sm flex items-center justify-center text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-semibold capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.09] hover:border-zinc-300 dark:hover:border-white/[0.14] backdrop-blur-sm flex items-center justify-center text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={format(currentMonth, "yyyy-MM")}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/20"
            >
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-white/[0.06]">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-zinc-400 dark:text-white/40 uppercase tracking-wider py-3">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const dayCards = getCardsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, today);
                  const isLastRow = idx >= calendarDays.length - 7;
                  const isLastCol = (idx + 1) % 7 === 0;

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[110px] p-2 transition-colors relative
                        ${!isLastRow ? "border-b border-zinc-100 dark:border-white/[0.04]" : ""}
                        ${!isLastCol ? "border-r border-zinc-100 dark:border-white/[0.04]" : ""}
                        ${isCurrentMonth ? "bg-transparent hover:bg-zinc-50 dark:hover:bg-white/[0.035]" : "bg-transparent opacity-35"}
                        ${isToday ? "bg-violet-50 dark:bg-violet-500/[0.07] hover:bg-violet-100 dark:hover:bg-violet-500/[0.10]" : ""}
                      `}
                    >
                      {/* Today glow */}
                      {isToday && (
                        <div className="absolute inset-0 rounded-none pointer-events-none ring-1 ring-inset ring-violet-500/40" />
                      )}

                      <div
                        className={`text-sm font-semibold mb-1.5 w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                          isToday
                            ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/30"
                            : isCurrentMonth
                            ? "text-zinc-700 dark:text-white/70"
                            : "text-zinc-300 dark:text-white/30"
                        }`}
                      >
                        {format(day, "d")}
                      </div>

                      <div className="space-y-1">
                        {dayCards.slice(0, 3).map((card) => {
                          const camp = campaigns.find((c) => c.id === card.campaignId);
                          const isLate = isBefore(parseISO(card.dueDate), today) && card.stage !== "published";
                          return (
                            <button
                              key={card.id}
                              onClick={() => handleCardClick(card)}
                              className="w-full text-left text-[11px] px-2 py-1 rounded-md truncate font-medium transition-all hover:brightness-125 active:scale-95"
                              style={{
                                backgroundColor: isLate
                                  ? "rgba(239,68,68,0.15)"
                                  : `${camp?.color || "#8b5cf6"}22`,
                                color: isLate ? "#f87171" : camp?.color || "#8b5cf6",
                                borderLeft: `2px solid ${isLate ? "#ef4444" : camp?.color || "#8b5cf6"}`,
                              }}
                              title={card.title}
                            >
                              {card.title}
                            </button>
                          );
                        })}
                        {dayCards.length > 3 && (
                          <div className="text-[10px] text-zinc-400 dark:text-white/30 pl-1 font-medium">
                            +{dayCards.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <CardDetailSheet
        card={selectedCard}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
