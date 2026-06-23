import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card as KanbanCardType, Stage, stageLabels } from "@/lib/types";
import { KanbanItem } from "./kanban-card";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  id: Stage;
  cards: KanbanCardType[];
  onAddCard: (stage: Stage) => void;
  onCardClick: (card: KanbanCardType) => void;
}

const stageConfig: Record<Stage, { gradient: string; color: string; glow: string }> = {
  script:    { gradient: "from-violet-500 to-purple-600",  color: "#8b5cf6", glow: "shadow-violet-500/20" },
  narration: { gradient: "from-blue-500 to-indigo-600",    color: "#3b82f6", glow: "shadow-blue-500/20" },
  art:       { gradient: "from-pink-500 to-rose-600",      color: "#ec4899", glow: "shadow-pink-500/20" },
  editing:   { gradient: "from-amber-400 to-orange-500",   color: "#f59e0b", glow: "shadow-amber-500/20" },
  review:    { gradient: "from-sky-400 to-cyan-500",       color: "#0ea5e9", glow: "shadow-sky-500/20" },
  published: { gradient: "from-emerald-400 to-teal-600",  color: "#10b981", glow: "shadow-emerald-500/20" },
};

export function KanbanColumn({ id, cards, onAddCard, onCardClick }: KanbanColumnProps) {
  const conf = stageConfig[id];

  return (
    <div
      className="flex flex-col w-72 min-w-[288px] rounded-2xl border border-white/[0.07] overflow-hidden shrink-0 h-full max-h-full"
      style={{
        background: "rgba(9,9,11,0.65)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Column header */}
      <div className="relative px-4 py-3.5 border-b border-white/[0.06] shrink-0">
        {/* Subtle gradient bg */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${conf.color}, transparent 80%)` }}
        />

        <div className="relative flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* Color dot */}
            <div
              className={`w-2 h-2 rounded-full shadow-md ${conf.glow}`}
              style={{ backgroundColor: conf.color, boxShadow: `0 0 8px ${conf.color}80` }}
            />
            <h3 className="font-semibold text-sm text-white/80">{stageLabels[id]}</h3>
            {/* Count badge */}
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${conf.color}18`,
                borderColor: `${conf.color}35`,
                color: conf.color,
              }}
            >
              {cards.length}
            </span>
          </div>

          {/* Add button */}
          <button
            onClick={() => onAddCard(id)}
            className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.10] hover:border-white/[0.16] flex items-center justify-center text-white/40 hover:text-white/80 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Colored accent line at top */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, ${conf.color}, ${conf.color}00)` }}
        />
      </div>

      {/* Drop zone */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 p-3 overflow-y-auto transition-all duration-200"
            style={{
              background: snapshot.isDraggingOver
                ? `linear-gradient(180deg, ${conf.color}0A 0%, transparent 60%)`
                : "transparent",
            }}
          >
            {cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <KanbanItem
                    card={card}
                    innerRef={dragProvided.innerRef}
                    draggableProps={dragProvided.draggableProps}
                    dragHandleProps={dragProvided.dragHandleProps}
                    isDragging={dragSnapshot.isDragging}
                    onClick={() => onCardClick(card)}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Empty state */}
            {cards.length === 0 && !snapshot.isDraggingOver && (
              <button
                onClick={() => onAddCard(id)}
                className="w-full mt-1 py-5 rounded-xl border border-dashed border-white/[0.06] text-white/20 hover:text-white/40 hover:border-white/[0.12] transition-all text-xs flex flex-col items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar card</span>
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
