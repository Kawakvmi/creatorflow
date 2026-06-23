"use client";

import { useEffect, useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import * as db from "@/lib/supabase/db";
import { KanbanColumn } from "./kanban-column";
import { NewCardDialog } from "./new-card-dialog";
import { CardDetailSheet } from "./card-detail-sheet";
import { Card, ContentType, Stage } from "@/lib/types";

const STAGES: Stage[] = ["script", "narration", "art", "editing", "review", "published"];

interface KanbanBoardProps {
  campaignId: string;
  activeFilters?: ContentType[];
}

export function KanbanBoard({ campaignId, activeFilters = [] }: KanbanBoardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const allCards = useCreatorStore((state) => state.cards).filter((c) => c.campaignId === campaignId);
  const updateCardStage = useCreatorStore((state) => state.updateCardStage);

  const cards =
    activeFilters.length > 0
      ? allCards.filter((c) => activeFilters.includes(c.contentType))
      : allCards;

  const [newCardOpen, setNewCardOpen] = useState(false);
  const [newCardStage, setNewCardStage] = useState<Stage>("script");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const newStage = destination.droppableId as Stage;
    updateCardStage(draggableId, newStage);
    db.updateCard(draggableId, { stage: newStage }).catch(console.error);
  };

  const handleAddCard = useCallback((stage: Stage) => {
    setNewCardStage(stage);
    setNewCardOpen(true);
  }, []);

  const handleCardClick = useCallback((card: Card) => {
    setSelectedCard(card);
    setDetailOpen(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
        Carregando quadro...
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-full items-start gap-4 overflow-x-auto overflow-y-hidden pb-4">
          {STAGES.map((stage) => {
            const columnCards = cards.filter((card) => card.stage === stage);
            return (
              <KanbanColumn
                key={stage}
                id={stage}
                cards={columnCards}
                onAddCard={handleAddCard}
                onCardClick={handleCardClick}
              />
            );
          })}
        </div>
      </DragDropContext>

      <NewCardDialog
        open={newCardOpen}
        onOpenChange={setNewCardOpen}
        campaignId={campaignId}
        initialStage={newCardStage}
      />

      <CardDetailSheet
        card={selectedCard}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
