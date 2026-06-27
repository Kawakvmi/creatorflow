"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import { Card, GuidebookBlock, stageLabels, contentTypeLabels } from "@/lib/types";
import * as db from "@/lib/supabase/db";
import { format, parseISO, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon, Video, Gamepad2, Presentation,
  AlertTriangle, ChevronRight, ChevronLeft, Pencil, Check, X, BookOpen, ListChecks,
  Plus, Trash2, ImagePlus, FileText, CheckCircle2, CalendarCheck,
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
  low:    "text-sky-400 bg-sky-500/10 border-sky-500/25",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  high:   "text-red-400 bg-red-500/10 border-red-500/25",
};
const priorityLabels = { low: "Baixa", medium: "Média", high: "Alta" };

/* ── Guidebook helpers ──────────────────────────────────── */

function GuidebookImageBlock({ block, onDelete }: { block: GuidebookBlock; onDelete: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => { getImage(block.content).then((s) => setSrc(s ?? null)); }, [block.content]);

  return (
    <div className="group relative rounded-xl overflow-hidden border border-border bg-muted/30">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Imagem do guidebook" className="w-full max-h-64 object-contain" />
      ) : (
        <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">Carregando imagem...</div>
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
  block, onSave, onDelete,
}: { block: GuidebookBlock; onSave: (c: string) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(block.content === "");
  const [value, setValue] = useState(block.content);
  const handleSave = () => { onSave(value); setEditing(false); };

  if (editing) return (
    <div className="space-y-2">
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={4}
        placeholder="Escreva suas anotações, referências, ideias..." className="resize-none" autoFocus />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>Salvar</Button>
        <Button size="sm" variant="ghost" onClick={() => { setValue(block.content); setEditing(false); }}>Cancelar</Button>
      </div>
    </div>
  );

  return (
    <div
      className="group relative p-3 rounded-xl bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => setEditing(true)}
    >
      <p className="text-sm whitespace-pre-wrap leading-relaxed">
        {block.content || <span className="italic text-muted-foreground">Clique para editar...</span>}
      </p>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          className="p-1 rounded-md bg-background border border-border hover:bg-muted"><Pencil className="w-3 h-3" /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded-md bg-background border border-border text-destructive hover:bg-destructive/10"><Trash2 className="w-3 h-3" /></button>
      </div>
    </div>
  );
}

/* ── Beautiful finalize modal with custom calendar ──────── */

function FinalizeModal({ onConfirm, onClose }: { onConfirm: (dateStr: string) => void; onClose: () => void }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(format(today, "yyyy-MM-dd"));

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayRaw = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const startOffset = firstDayRaw === 0 ? 6 : firstDayRaw - 1; // Monday-first grid

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const todayStr = format(today, "yyyy-MM-dd");

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.68)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="w-full max-w-xs rounded-2xl border border-white/[0.10] overflow-hidden"
        style={{
          background: "rgba(13,13,15,0.99)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04), 0 0 40px rgba(16,185,129,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="border-b border-white/[0.06] px-5 pt-5 pb-4"
          style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.10) 0%, transparent 60%)" }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 6px rgba(16,185,129,0.25)",
                  "0 0 20px rgba(16,185,129,0.55)",
                  "0 0 6px rgba(16,185,129,0.25)",
                ],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="w-10 h-10 rounded-xl bg-emerald-500/12 border border-emerald-500/30 flex items-center justify-center shrink-0"
            >
              <CalendarCheck className="w-5 h-5 text-emerald-400" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-sm text-white leading-snug">Finalizar Tarefa</h3>
              <p className="text-[11px] text-white/40 mt-0.5">Selecione a data real de entrega</p>
            </div>
          </div>
        </div>

        {/* Calendar body */}
        <div className="px-4 pt-4 pb-3 space-y-2.5">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/[0.07] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-white/80 capitalize">
              {format(viewDate, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/[0.07] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7">
            {weekdays.map((d) => (
              <div key={d} className="text-center text-[9px] font-bold text-white/20 py-1.5 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} className="h-8" />;
              const yr = viewDate.getFullYear();
              const mo = String(viewDate.getMonth() + 1).padStart(2, "0");
              const dStr = `${yr}-${mo}-${String(day).padStart(2, "0")}`;
              const isSel   = dStr === selected;
              const isToday = dStr === todayStr;

              return (
                <button
                  key={day}
                  onClick={() => setSelected(dStr)}
                  className={`relative h-8 w-full rounded-lg text-xs font-medium transition-all ${
                    isSel
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/40"
                      : isToday
                      ? "text-white border border-white/[0.20] bg-white/[0.08]"
                      : "text-white/50 hover:text-white/90 hover:bg-white/[0.07]"
                  }`}
                >
                  {day}
                  {isToday && !isSel && (
                    <span className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <button
            onClick={() => {
              setSelected(todayStr);
              setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
            }}
            className="w-full h-8 rounded-xl border border-white/[0.07] text-[11px] font-semibold text-white/30 hover:text-emerald-400/70 hover:bg-emerald-500/[0.06] hover:border-emerald-500/20 transition-all"
          >
            Hoje
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-4 pb-5">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-white/[0.09] text-sm text-white/40 hover:text-white/65 hover:bg-white/[0.05] transition-all"
          >
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => selected && onConfirm(selected)}
            className="flex-1 h-10 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
              boxShadow: "0 4px 16px rgba(16,185,129,0.30)",
            }}
          >
            Confirmar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Card detail content ────────────────────────────────── */

function CardDetailContent({ card, onClose }: { card: Card; onClose: () => void }) {
  const updateCard = useCreatorStore((state) => state.updateCard);
  const removeCard = useCreatorStore((state) => state.removeCard);
  const liveCard   = useCreatorStore((state) => state.cards.find((c) => c.id === card.id)) ?? card;

  const syncCard = useCallback(async (updates: Partial<Card>) => {
    updateCard(liveCard.id, updates);
    db.updateCard(liveCard.id, updates).catch(console.error);
  }, [liveCard.id, updateCard]);

  const [confirmDelete, setConfirmDelete]       = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [activeTab, setActiveTab]               = useState<Tab>("details");
  const [editingTitle, setEditingTitle]         = useState(false);
  const [editingDesc, setEditingDesc]           = useState(false);
  const [title, setTitle]                       = useState(card.title);
  const [description, setDescription]           = useState(card.description);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
    setEditingTitle(false);
    setEditingDesc(false);
    setActiveTab("details");
  }, [card.id, card.title, card.description]);

  const handleDelete = async () => {
    removeCard(liveCard.id);
    db.deleteCard(liveCard.id).catch(console.error);
    onClose();
  };

  const handleImageUpload = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const imageId = crypto.randomUUID();
      await saveImage(imageId, base64);
      const block: GuidebookBlock = {
        id: crypto.randomUUID(), type: "image", content: imageId,
        order: liveCard.guidebook.length, createdAt: new Date().toISOString(),
      };
      syncCard({ guidebook: [...liveCard.guidebook, block] });
    };
    reader.readAsDataURL(file);
  }, [liveCard, syncCard]);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (activeTab !== "guidebook") return;
    const imgItem = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
    if (imgItem) { const file = imgItem.getAsFile(); if (file) await handleImageUpload(file); }
  }, [activeTab, handleImageUpload]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const isLate = liveCard.dueDate && isBefore(parseISO(liveCard.dueDate), new Date()) && liveCard.stage !== "published";

  const getContentTypeIcon = (type: string) => {
    if (type === "video")        return <Video className="w-4 h-4" />;
    if (type === "presentation") return <Presentation className="w-4 h-4" />;
    if (type === "game")         return <Gamepad2 className="w-4 h-4" />;
    return <Video className="w-4 h-4" />;
  };

  const handleSaveTitle = () => { if (title.trim()) syncCard({ title: title.trim() }); setEditingTitle(false); };
  const handleSaveDescription = () => { syncCard({ description: description.trim() }); setEditingDesc(false); };

  const handleToggleChecklist = (checkId: string) => {
    syncCard({ checklist: liveCard.checklist.map((c) => c.id === checkId ? { ...c, done: !c.done } : c) });
  };

  const handleFinalizeConfirm = (dateStr: string) => {
    setShowFinalizeModal(false);
    syncCard({ stage: "published", actualDeliveryDate: `${dateStr}T12:00:00.000Z` });
  };

  const checkDone  = liveCard.checklist.filter((c) => c.done).length;
  const checkTotal = liveCard.checklist.length;

  const addTextBlock = () => {
    const block: GuidebookBlock = {
      id: crypto.randomUUID(), type: "text", content: "",
      order: liveCard.guidebook.length, createdAt: new Date().toISOString(),
    };
    syncCard({ guidebook: [...liveCard.guidebook, block] });
  };

  const updateTextBlock = (blockId: string, content: string) =>
    syncCard({ guidebook: liveCard.guidebook.map((b) => b.id === blockId ? { ...b, content } : b) });

  const deleteBlock = async (blockId: string) => {
    const block = liveCard.guidebook.find((b) => b.id === blockId);
    if (block?.type === "image") await deleteImage(block.content);
    syncCard({ guidebook: liveCard.guidebook.filter((b) => b.id !== blockId) });
  };

  const handleImageInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleImageUpload(file);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  return (
    <>
      <AnimatePresence>
        {showFinalizeModal && (
          <FinalizeModal onConfirm={handleFinalizeConfirm} onClose={() => setShowFinalizeModal(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/12 via-transparent to-transparent pointer-events-none" />
        <div className="relative p-5 pb-0 space-y-4">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)}
                className="font-bold text-base bg-white/[0.06] border-white/10 focus:border-violet-500/50"
                autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()} />
              <Button size="icon" variant="ghost" onClick={handleSaveTitle} className="shrink-0"><Check className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => { setEditingTitle(false); setTitle(liveCard.title); }} className="shrink-0"><X className="w-4 h-4" /></Button>
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
              {/* Due date */}
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
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      rows={4} autoFocus className="bg-white/[0.06] border-white/10 focus:border-violet-500/50 resize-none" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveDescription} className="bg-violet-600 hover:bg-violet-500">Salvar</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingDesc(false); setDescription(liveCard.description); }} className="text-white/50">Cancelar</Button>
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
                    <span className="text-xs font-semibold text-white/50 bg-white/[0.06] px-2 py-0.5 rounded-full">{checkDone}/{checkTotal}</span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(checkDone / checkTotal) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
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
                          item.done ? "bg-emerald-500 border-emerald-500" : "border border-white/25 hover:border-violet-400"
                        }`}>
                          {item.done && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-sm transition-all ${item.done ? "line-through text-white/30" : "text-white/75"}`}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Finalizar / Finalizada */}
              {liveCard.stage !== "published" ? (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFinalizeModal(true)}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white shadow-lg transition-all"
                  style={{
                    background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
                    boxShadow: "0 4px 20px rgba(16,185,129,0.28)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finalizar Tarefa
                </motion.button>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">Tarefa Finalizada</span>
                  </div>
                  {liveCard.actualDeliveryDate && (
                    <p className="text-[11px] text-emerald-400/50">
                      Entregue em {format(parseISO(liveCard.actualDeliveryDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                  )}
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
                        <button onClick={() => setConfirmDelete(false)}
                          className="flex-1 h-8 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:bg-white/[0.07] transition-all">Cancelar</button>
                        <button onClick={handleDelete}
                          className="flex-1 h-8 rounded-lg bg-red-500/20 border border-red-500/35 text-xs font-semibold text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all">Excluir</button>
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
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl"
                  >
                    <BookOpen className="w-10 h-10 mb-3 opacity-40" />
                    <p className="text-sm font-medium">Guidebook vazio</p>
                    <p className="text-xs mt-1">Adicione texto ou imagens abaixo</p>
                  </motion.div>
                )}

                {liveCard.guidebook
                  .slice().sort((a, b) => a.order - b.order)
                  .map((block) => (
                    <motion.div key={block.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    >
                      {block.type === "text" ? (
                        <GuidebookTextBlock block={block}
                          onSave={(content) => updateTextBlock(block.id, content)}
                          onDelete={() => deleteBlock(block.id)} />
                      ) : (
                        <GuidebookImageBlock block={block} onDelete={() => deleteBlock(block.id)} />
                      )}
                    </motion.div>
                  ))}
              </AnimatePresence>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="gap-2 flex-1" onClick={addTextBlock}>
                  <FileText className="w-4 h-4" /> Texto
                </Button>
                <Button size="sm" variant="outline" className="gap-2 flex-1" onClick={() => imageInputRef.current?.click()}>
                  <ImagePlus className="w-4 h-4" /> Imagem
                </Button>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageInput} />
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

/* ── Sheet wrapper ──────────────────────────────────────── */

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
