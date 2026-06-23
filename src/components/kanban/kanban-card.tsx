import { Card as KanbanCardType } from "@/lib/types";
import { Video, Gamepad2, Presentation, CalendarIcon, CheckSquare, LayoutTemplate, Globe, Palette } from "lucide-react";
import { isBefore, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

interface KanbanCardProps {
  card: KanbanCardType;
  innerRef: (element: HTMLElement | null) => void;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  isDragging: boolean;
  onClick: () => void;
}

const contentTypeConfig: Record<KanbanCardType["contentType"], { icon: React.ReactNode; gradient: string; color: string }> = {
  video:        { icon: <Video className="w-3.5 h-3.5" />,          gradient: "from-violet-500 to-purple-600", color: "#8b5cf6" },
  presentation: { icon: <Presentation className="w-3.5 h-3.5" />,   gradient: "from-sky-500 to-blue-600",     color: "#3b82f6" },
  game:         { icon: <Gamepad2 className="w-3.5 h-3.5" />,       gradient: "from-emerald-500 to-teal-600", color: "#10b981" },
  layout:       { icon: <LayoutTemplate className="w-3.5 h-3.5" />, gradient: "from-pink-500 to-rose-600",    color: "#ec4899" },
  site:         { icon: <Globe className="w-3.5 h-3.5" />,          gradient: "from-cyan-500 to-sky-600",     color: "#0ea5e9" },
  identity:     { icon: <Palette className="w-3.5 h-3.5" />,        gradient: "from-fuchsia-500 to-pink-600", color: "#d946ef" },
};

const priorityConfig = {
  low:    { label: "Baixa",  cls: "text-sky-400 border-sky-500/30 bg-sky-500/10",     dot: "bg-sky-400" },
  medium: { label: "Média",  cls: "text-amber-400 border-amber-500/30 bg-amber-500/10", dot: "bg-amber-400" },
  high:   { label: "Alta",   cls: "text-red-400 border-red-500/30 bg-red-500/10",     dot: "bg-red-400" },
};

export function KanbanItem({
  card, innerRef, draggableProps, dragHandleProps, isDragging, onClick,
}: KanbanCardProps) {
  const isLate    = card.dueDate && isBefore(parseISO(card.dueDate), new Date()) && card.stage !== "published";
  const checkDone = card.checklist.filter((c) => c.done).length;
  const checkTotal = card.checklist.length;
  const typeConf  = contentTypeConfig[card.contentType];
  const prioConf  = priorityConfig[card.priority];

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className={`mb-3 select-none transition-transform ${isDragging ? "rotate-1 scale-[1.03] z-50 relative" : ""}`}
      style={{ ...draggableProps.style }}
      onClick={(e) => { if (!isDragging) { e.stopPropagation(); onClick(); } }}
    >
      {/* Glass card */}
      <div
        className={`relative rounded-2xl border overflow-hidden cursor-pointer group transition-all duration-200
          ${isDragging
            ? "border-violet-500/40 shadow-xl shadow-violet-500/20 bg-zinc-900/95"
            : "border-white/[0.08] bg-white/[0.04] hover:border-white/[0.16] hover:bg-white/[0.07] hover:shadow-lg hover:shadow-black/30"
          }`}
        style={{ backdropFilter: "blur(12px)" }}
      >
        {/* Content-type left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl"
          style={{ backgroundColor: typeConf.color, boxShadow: `0 0 8px ${typeConf.color}60` }}
        />

        {/* Subtle glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${typeConf.color}0A 0%, transparent 70%)` }}
        />

        <div className="p-3.5 pl-4 relative">
          {/* Header: title + type icon */}
          <div className="flex items-start gap-2 mb-2">
            <h4 className="font-semibold text-sm leading-snug line-clamp-2 flex-1 text-white/85 group-hover:text-white transition-colors">
              {card.title}
            </h4>
            <div
              className={`flex-none w-7 h-7 rounded-lg bg-gradient-to-br ${typeConf.gradient} flex items-center justify-center text-white shadow-sm shrink-0 mt-0.5`}
            >
              {typeConf.icon}
            </div>
          </div>

          {/* Description */}
          {card.description && (
            <p className="text-[11px] text-white/35 line-clamp-1 leading-relaxed mb-2">
              {card.description}
            </p>
          )}

          {/* Checklist progress */}
          {checkTotal > 0 && (
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex-1 bg-white/[0.06] rounded-full h-1 overflow-hidden">
                <div
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: `${(checkDone / checkTotal) * 100}%`,
                    background: "linear-gradient(90deg, #8b5cf6, #10b981)",
                  }}
                />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/30 shrink-0">
                <CheckSquare className="w-3 h-3" />
                <span>{checkDone}/{checkTotal}</span>
              </div>
            </div>
          )}

          {/* Footer: priority + date + approval */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {/* Priority */}
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${prioConf.cls}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${prioConf.dot} shrink-0`} />
                {prioConf.label}
              </span>

              {/* Date */}
              {card.dueDate && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-medium ${
                    isLate
                      ? "text-red-400 border-red-500/30 bg-red-500/10"
                      : "text-white/40 border-white/[0.08] bg-white/[0.04]"
                  }`}
                >
                  <CalendarIcon className="w-2.5 h-2.5" />
                  {format(parseISO(card.dueDate), "dd MMM", { locale: ptBR })}
                </span>
              )}
            </div>

            {/* Approval status */}
            <div className="flex items-center gap-1 shrink-0">
              {card.approvalStatus === "approved" && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  ✓ Aprovado
                </span>
              )}
              {card.approvalStatus === "rejected" && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-red-500/30 bg-red-500/10 text-red-400">
                  Revisar
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
