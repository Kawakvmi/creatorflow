"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import { Card, GuidebookBlock, stageLabels, contentTypeLabels, approvalStatusLabels } from "@/lib/types";
import * as db from "@/lib/supabase/db";
import { format, parseISO, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon, Video, Gamepad2, Presentation,
  AlertTriangle, ChevronRight, Pencil, Check, X, BookOpen, ListChecks,
  Plus, Trash2, ImagePlus, FileText, CheckCircle2,
} from "lucide-react";
import { saveImage, getImage, deleteImage } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";

interface CardDetailSheetProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tab = "details" | "guidebook";

const priorityColors = {
  low: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  high: "text-red-400 bg-red-500/10 border-red-500/25",
};
const priorityLabels = { low: "Baixa", medium: "Média", high: "Alta" };

function GuidebookImageBlock({ block, onDelete }: { block: GuidebookBlock; onDelete: () => void }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    getImage(block.content).then((s) => setSrc(s ?? null));
  }, [block.content]);

  return (
    <div className="group relative rounded-xl overflow-hidden border border-border bg-muted/30">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Imagem do guidebook" className="w-full max-h-64 object-contain" />
      ) : (
        <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
          Carregando imagem...
        </div>
      )}
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function GuidebookTextBlock({
  block,
  onSave,
  onDelete,
}: {
  block: GuidebookBlock;
  onSave: (content: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(block.content === "");
  const [value, setValue] = useState(block.content);

  const handleSave = () => {
    onSave(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          placeholder="Escreva suas anotações, referências, ideias..."
          className="resize-none"
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>Salvar</Button>
          <Button size="sm" variant="ghost" onClick={() => { setValue(block.content); setEditing(false); }}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative p-3 rounded-xl bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => setEditing(true)}
    >
      <p className="text-sm whitespace-pre-wrap leading-relaxed">
        {block.content || <span className="italic text-muted-foreground">Clique para editar...</span>}
      </p>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          className="p-1 rounded-md bg-background border border-border hover:bg-muted"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded-md bg-background border border-border text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// Inner component that renders when a card is actually selected
function CardDetailContent({ card, onClose }: { card: Card; onClose: () => void }) {
  const updateCard = useCreatorStore((state) => state.updateCard);
  const removeCard = useCreatorStore((state) => state.removeCard);
  const liveCard   = useCreatorStore((state) => state.cards.find((c) => c.id === card.id)) ?? card;

  const syncCard = useCallback(async (updates: Partial<Card>) => {
    updateCard(liveCard.id, updates);
    db.updateCard(liveCard.id, updates).catch(console.error);
  }, [liveCard.id, updateCard]);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actualDeliveryDate, setActualDeliveryDate] = useState(
    card.actualDeliveryDate ? format(parseISO(card.actualDeliveryDate), "yyyy-MM-dd") : ""
  );
  const actualDateInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = async () => {
    removeCard(liveCard.id);
    db.deleteCard(liveCard.id).catch(console.error);
    onClose();
  };

  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
    setActualDeliveryDate(
      card.actualDeliveryDate ? format(parseISO(card.actualDeliveryDate), "yyyy-MM-dd") : ""
    );
    setEditingTitle(false);
    setEditingDesc(false);
    setActiveTab("details");
  }, [card.id, card.title, card.description, card.actualDeliveryDate]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const imageId = crypto.randomUUID();
        await saveImage(imageId, base64);
        const block: GuidebookBlock = {
          id: crypto.randomUUID(),
          type: "image",
          content: imageId,
          order: liveCard.guidebook.length,
          createdAt: new Date().toISOString(),
        };
        syncCard({ guidebook: [...liveCard.guidebook, block] });
      };
      reader.readAsDataURL(file);
    },
    [liveCard, syncCard]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (activeTab !== "guidebook") return;
      const items = Array.from(e.clipboardData?.items ?? []);
      const imgItem = items.find((item) => item.type.startsWith("image/"));
      if (imgItem) {
        const file = imgItem.getAsFile();
        if (file) await handleImageUpload(file);
      }
    },
    [activeTab, handleImageUpload]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const isLate =
    liveCard.dueDate &&
    isBefore(parseISO(liveCard.dueDate), new Date()) &&
    liveCard.stage !== "published";

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4" />;
      case "presentation": return <Presentation className="w-4 h-4" />;
      case "game": return <Gamepad2 className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const handleToggleChecklist = (checkId: string) => {
    const updated = liveCard.checklist.map((c) =>
      c.id === checkId ? { ...c, done: !c.done } : c
    );
    syncCard({ checklist: updated });
  };

  const handleSaveTitle = () => {
    if (title.trim()) syncCard({ title: title.trim() });
    setEditingTitle(false);
  };

  const handleSaveDescription = () => {
    syncCard({ description: description.trim() });
    setEditingDesc(false);
  };

  const handleApproval = (status: "approved" | "rejected" | "pending") => {
    syncCard({ approvalStatus: status });
  };

  const handleActualDeliveryDate = (dateStr: string) => {
    setActualDeliveryDate(dateStr);
    const isoDate = dateStr ? `${dateStr}T12:00:00.000Z` : null;
    syncCard({ actualDeliveryDate: isoDate });
  };

  const handleFinalize = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const deliveryDate = actualDeliveryDate || today;
    if (!actualDeliveryDate) setActualDeliveryDate(today);
    syncCard({
      stage: "published",
      actualDeliveryDate: `${deliveryDate}T12:00:00.000Z`,
    });
  };

  const checkDone = liveCard.checklist.filter((c) => c.done).length;
  const checkTotal = liveCard.checklist.length;

  const addTextBlock = () => {
    const block: GuidebookBlock = {
      id: crypto.randomUUID(),
      type: "text",
      content: "",
      order: liveCard.guidebook.length,
      createdAt: new Date().toISOString(),
    };
    syncCard({ guidebook: [...liveCard.guidebook, block] });
  };

  const updateTextBlock = (blockId: string, content: string) => {
    const updated = liveCard.guidebook.map((b) =>
      b.id === blockId ? { ...b, content } : b
    );
    syncCard({ guidebook: updated });
  };

  const deleteBlock = async (blockId: string) => {
    const block = liveCard.guidebook.find((b) => b.id === blockId);
    if (block?.type === "image") {
      await deleteImage(block.content);
    }
    const updated = liveCard.guidebook.filter((b) => b.id !== blockId);
    syncCard({ guidebook: updated });
  };

  const handleImageInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleImageUpload(file);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  return (
    <>
      {/* Header glassmorphism */}
      <div className="relative border-b border-white/[0.06]">
        {/* Gradient topo */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/12 via-transparent to-transparent pointer-events-none" />
        <div className="relative p-5 pb-0 space-y-4">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-bold text-base bg-white/[0.06] border-white/10 focus:border-violet-500/50"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
              />
              <Button size="icon" variant="ghost" onClick={handleSaveTitle} className="shrink-0"><Check className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => { setEditingTitle(false); setTitle(liveCard.title); }} className="shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-2 group cursor-pointer" onClick={() => setEditingTitle(true)}>
              <h2 className="text-base font-bold flex-1 leading-snug text-white">{liveCard.title}</h2>
              <Pencil className="w-3.5 h-3.5 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/70">
              {getContentTypeIcon(liveCard.contentType)}
              {contentTypeLabels[liveCard.contentType]}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60">
              <ChevronRight className="w-3 h-3" />
              {stageLabels[liveCard.stage]}
            </span>
            <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-1 rounded-lg border ${priorityColors[liveCard.priority]}`}>
              {priorityLabels[liveCard.priority]}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5">
            {(["details", "guidebook"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
                  activeTab === tab
                    ? "border-violet-500 text-violet-400 bg-violet-500/[0.08]"
                    : "border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                {tab === "details" ? <ListChecks className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                {tab === "details" ? "Detalhes" : "Guidebook"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "details" ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="p-5 space-y-4"
            >
              {/* Due Date (prevista) */}
              <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${isLate ? "bg-red-500/[0.08] border-red-500/20" : "bg-white/[0.04] border-white/[0.06]"}`}>
                <CalendarIcon className={`w-5 h-5 shrink-0 ${isLate ? "text-red-400" : "text-white/40"}`} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-0.5">Data Prevista de Entrega</p>
                  <p className={`text-sm font-medium ${isLate ? "text-red-400" : "text-white/80"}`}>
                    {liveCard.dueDate
                      ? format(parseISO(liveCard.dueDate), "dd 'de' MMMM, yyyy", { locale: ptBR })
                      : "Não definida"}
                    {isLate && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-400 font-normal">
                        <AlertTriangle className="w-3 h-3" /> Atrasado
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Descrição</p>
                {editingDesc ? (
                  <div className="space-y-2">
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      autoFocus
                      className="bg-white/[0.06] border-white/10 focus:border-violet-500/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveDescription} className="bg-violet-600 hover:bg-violet-500">Salvar</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingDesc(false); setDescription(liveCard.description); }} className="text-white/50">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm min-h-[60px] cursor-pointer hover:bg-white/[0.07] hover:border-white/[0.10] transition-all group"
                    onClick={() => setEditingDesc(true)}
                  >
                    <span className={liveCard.description ? "text-white/75 leading-relaxed" : "text-white/25 italic"}>
                      {liveCard.description || "Clique para adicionar uma descrição..."}
                    </span>
                    <Pencil className="w-3 h-3 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity inline ml-2" />
                  </div>
                )}
              </div>

              {/* Checklist */}
              {checkTotal > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Checklist</p>
                    <span className="text-xs font-semibold text-white/50 bg-white/[0.06] px-2 py-0.5 rounded-full">
                      {checkDone}/{checkTotal}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(checkDone / checkTotal) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  {/* Items */}
                  <div className="space-y-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 overflow-hidden">
                    {liveCard.checklist.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleToggleChecklist(item.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                          item.done
                            ? "bg-emerald-500/[0.08] border border-emerald-500/[0.15] hover:bg-emerald-500/[0.12]"
                            : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.10]"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
                          item.done
                            ? "bg-emerald-500 border-emerald-500"
                            : "border border-white/25 hover:border-violet-400"
                        }`}>
                          {item.done && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-sm transition-all ${
                          item.done ? "line-through text-white/30" : "text-white/75"
                        }`}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval */}
              <div className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Status de Aprovação</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                    liveCard.approvalStatus === "approved"
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : liveCard.approvalStatus === "rejected"
                      ? "bg-red-500/15 border-red-500/30 text-red-400"
                      : "bg-white/[0.06] border-white/[0.10] text-white/50"
                  }`}>
                    {approvalStatusLabels[liveCard.approvalStatus]}
                  </span>
                  {liveCard.approvalStatus !== "approved" && (
                    <button
                      onClick={() => handleApproval("approved")}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                      Aprovar
                    </button>
                  )}
                  {liveCard.approvalStatus !== "rejected" && (
                    <button
                      onClick={() => handleApproval("rejected")}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      Reprovar
                    </button>
                  )}
                  {liveCard.approvalStatus !== "pending" && (
                    <button
                      onClick={() => handleApproval("pending")}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition-all"
                    >
                      Resetar
                    </button>
                  )}
                </div>
              </div>

              {/* Data Real de Entrega */}
              <div
                className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.04] cursor-pointer hover:border-violet-500/30 hover:bg-white/[0.07] transition-all group"
                onClick={() => actualDateInputRef.current?.click()}
              >
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${actualDeliveryDate ? "text-emerald-400" : "text-white/30"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-0.5">Data Real de Entrega</p>
                  <p className={`text-sm font-medium ${actualDeliveryDate ? "text-emerald-400" : "text-white/30 italic"}`}>
                    {actualDeliveryDate
                      ? format(parseISO(`${actualDeliveryDate}T12:00:00.000Z`), "dd 'de' MMMM, yyyy", { locale: ptBR })
                      : "Clique para definir..."}
                  </p>
                </div>
                <Pencil className="w-3.5 h-3.5 text-white/20 group-hover:text-violet-400 transition-colors shrink-0" />
                <input
                  ref={actualDateInputRef}
                  type="date"
                  value={actualDeliveryDate}
                  onChange={(e) => handleActualDeliveryDate(e.target.value)}
                  className="absolute opacity-0 w-0 h-0 pointer-events-none"
                  tabIndex={-1}
                />
              </div>

              {/* Finalizar Tarefa */}
              {liveCard.stage !== "published" ? (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFinalize}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/35 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finalizar Tarefa
                </motion.button>
              ) : (
                <div className="flex items-center justify-center gap-2 h-10 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] text-sm font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Tarefa Finalizada
                </div>
              )}

              {/* Delete */}
              <div className="pt-2">
                <AnimatePresence mode="wait">
                  {!confirmDelete ? (
                    <motion.button
                      key="delete-btn"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-red-500/20 bg-red-500/[0.06] text-xs font-medium text-red-400/70 hover:bg-red-500/[0.12] hover:text-red-400 hover:border-red-500/35 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir este card
                    </motion.button>
                  ) : (
                    <motion.div
                      key="delete-confirm"
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rounded-xl border border-red-500/25 bg-red-500/[0.08] p-3.5 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <p className="text-xs font-semibold">Excluir permanentemente?</p>
                      </div>
                      <p className="text-[11px] text-white/35 leading-relaxed">
                        O card e todos os dados (checklist, guidebook) serão removidos do Supabase. Essa ação não pode ser desfeita.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(false)} className="flex-1 h-8 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:bg-white/[0.07] transition-all">
                          Cancelar
                        </button>
                        <button onClick={handleDelete} className="flex-1 h-8 rounded-lg bg-red-500/20 border border-red-500/35 text-xs font-semibold text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all">
                          Excluir
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="guidebook"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="p-6 space-y-4"
            >
              <p className="text-xs text-muted-foreground">
                Espaço de brainstorm — anotações, referências e imagens. Cole uma imagem (Ctrl+V) ou clique em &quot;Imagem&quot;.
              </p>

              <AnimatePresence initial={false}>
                {liveCard.guidebook.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl"
                  >
                    <BookOpen className="w-10 h-10 mb-3 opacity-40" />
                    <p className="text-sm font-medium">Guidebook vazio</p>
                    <p className="text-xs mt-1">Adicione texto ou imagens abaixo</p>
                  </motion.div>
                )}

                {liveCard.guidebook
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((block) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {block.type === "text" ? (
                        <GuidebookTextBlock
                          block={block}
                          onSave={(content) => updateTextBlock(block.id, content)}
                          onDelete={() => deleteBlock(block.id)}
                        />
                      ) : (
                        <GuidebookImageBlock block={block} onDelete={() => deleteBlock(block.id)} />
                      )}
                    </motion.div>
                  ))}
              </AnimatePresence>

              {/* Add block actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="gap-2 flex-1" onClick={addTextBlock}>
                  <FileText className="w-4 h-4" />
                  Texto
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 flex-1"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImagePlus className="w-4 h-4" />
                  Imagem
                </Button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageInput}
                />
              </div>

              {liveCard.guidebook.some((b) => b.type === "image") && (
                <p className="text-xs text-muted-foreground text-center">
                  <Plus className="w-3 h-3 inline mr-1" />
                  Você também pode colar imagens com Ctrl+V
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export function CardDetailSheet({ card, open, onOpenChange }: CardDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0 flex flex-col bg-zinc-900/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl shadow-black/60">
        <SheetTitle className="sr-only">Detalhes do Card</SheetTitle>
        <SheetDescription className="sr-only">Visualize e edite os detalhes deste card</SheetDescription>
        {card && <CardDetailContent card={card} onClose={() => onOpenChange(false)} />}
      </SheetContent>
    </Sheet>
  );
}
