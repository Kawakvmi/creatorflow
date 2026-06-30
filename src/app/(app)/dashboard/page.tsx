"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import {
  stageLabels,
  Stage,
  ContentType,
  contentTypeLabels,
  Card,
  Campaign,
  Client,
} from "@/lib/types";
import {
  isBefore,
  isAfter,
  subDays,
  startOfMonth,
  addDays,
  format,
  parseISO,
  isWithinInterval,
} from "date-fns";
import * as db from "@/lib/supabase/db";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardDetailSheet } from "@/components/kanban/card-detail-sheet";
import {
  AlertCircle, CheckCircle2, Clock, FolderOpen,
  Video, Gamepad2, Presentation, TrendingUp,
  Plus, ListTodo, X, Sparkles, ChevronRight, ChevronLeft,
  LayoutTemplate, Globe, Palette, GripVertical,
  LayoutGrid, List, CalendarDays, Building2,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend, Sector,
} from "recharts";

/* ─────────────────────────────────────────────────────────
   Constantes e helpers
───────────────────────────────────────────────────────── */
const STAGE_COLORS: Record<Stage, string> = {
  script: "#8b5cf6", narration: "#3b82f6", art: "#ec4899",
  editing: "#f59e0b", review: "#0ea5e9", published: "#10b981",
};

/* gradientes para o gráfico de rosca: [light, dark] */
const STAGE_GRADIENTS: Record<Stage, [string, string]> = {
  script:    ["#c084fc", "#6d28d9"],
  narration: ["#818cf8", "#1d4ed8"],
  art:       ["#f472b6", "#be185d"],
  editing:   ["#fcd34d", "#b45309"],
  review:    ["#7dd3fc", "#0369a1"],
  published: ["#6ee7b7", "#047857"],
};

const priorityConfig = {
  low:    { label: "Baixa",  cls: "text-sky-700 dark:text-sky-400 border-sky-400/40 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10" },
  medium: { label: "Média",  cls: "text-amber-700 dark:text-amber-400 border-amber-400/40 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10" },
  high:   { label: "Alta",   cls: "text-red-700 dark:text-red-400 border-red-400/40 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10" },
};

const contentTypeConfig: Record<ContentType, { icon: React.ReactNode; gradient: string }> = {
  video:        { icon: <Video className="w-4 h-4" />,          gradient: "from-violet-500 to-purple-600" },
  presentation: { icon: <Presentation className="w-4 h-4" />,   gradient: "from-sky-500 to-blue-600" },
  game:         { icon: <Gamepad2 className="w-4 h-4" />,       gradient: "from-emerald-500 to-teal-600" },
  layout:       { icon: <LayoutTemplate className="w-4 h-4" />, gradient: "from-pink-500 to-rose-600" },
  site:         { icon: <Globe className="w-4 h-4" />,          gradient: "from-cyan-500 to-sky-600" },
  identity:     { icon: <Palette className="w-4 h-4" />,        gradient: "from-fuchsia-500 to-pink-600" },
};

const checklistTemplates: Record<ContentType, string[]> = {
  video:        ["Roteiro escrito","Narração gravada","Trilha sonora","Thumbnail/arte","Edição finalizada","Revisão de qualidade","Legendas","Upload feito"],
  presentation: ["Estrutura definida","Conteúdo escrito","Design dos slides","Dados revisados","Narração (se houver)","Exportação final"],
  game:         ["Conceito/GDD","Assets visuais","Protótipo/programação","Testes","Trailer/demo","Publicado"],
  layout:       ["Brief de layout","Wireframe","Mockup desktop","Mockup mobile","Revisão de cores","Tipografia definida","Assets exportados","Aprovação final"],
  site:         ["Planejamento de páginas","Wireframe","Design desktop","Design mobile","Desenvolvimento","Conteúdo inserido","Testes","Publicação"],
  identity:     ["Pesquisa de referências","Moodboard","Conceito do logo","Variações do logo","Paleta de cores","Tipografia","Aplicações","Manual da marca"],
};


const kpiConfig = [
  { key: "lateCards",          title: "Em Atraso",        icon: AlertCircle,  gradient: "from-red-500 to-rose-600",      glow: "shadow-red-500/20",     iconBg: "from-red-500 to-rose-600" },
  { key: "inProgressCards",    title: "Em Andamento",     icon: Clock,        gradient: "from-amber-400 to-orange-500",  glow: "shadow-amber-500/20",   iconBg: "from-amber-400 to-orange-500" },
  { key: "completedThisMonth", title: "Concluídos (Mês)", icon: CheckCircle2, gradient: "from-emerald-400 to-teal-600",  glow: "shadow-emerald-500/20", iconBg: "from-emerald-400 to-teal-600" },
  { key: "activeCampaigns",    title: "Campanhas Ativas", icon: FolderOpen,   gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20",  iconBg: "from-violet-500 to-purple-600" },
];

/* ─────────────────────────────────────────────────────────
   Glass card helper
───────────────────────────────────────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-violet-200/60 dark:border-white/[0.08] bg-white/[0.65] dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_4px_24px_rgba(109,40,217,0.09),0_1px_4px_rgba(0,0,0,0.05)] dark:shadow-xl dark:shadow-black/20 ${className}`}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Nova Demanda — modal com animação própria
───────────────────────────────────────────────────────── */
interface QuickDemandDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function QuickDemandDialog({ open, onOpenChange }: QuickDemandDialogProps) {
  const campaigns = useCreatorStore((s) => s.campaigns).filter((c) => !c.archived);
  const clients   = useCreatorStore((s) => s.clients);
  const addCard   = useCreatorStore((s) => s.addCard);

  const [campaignId,      setCampaignId]      = useState("");
  const [clientId,        setClientId]        = useState("");
  const [title,           setTitle]           = useState("");
  const [description,     setDescription]     = useState("");
  const [contentType,     setContentType]     = useState<ContentType>("video");
  const [priority,        setPriority]        = useState<"low" | "medium" | "high">("medium");
  const [dueDate,         setDueDate]         = useState("");
  const [checklistItems,  setChecklistItems]  = useState<string[]>(checklistTemplates["video"]);
  const [editChecklist,   setEditChecklist]   = useState(false);
  const [newItemLabel,    setNewItemLabel]    = useState("");
  const [submitting,      setSubmitting]      = useState(false);

  /* fecha com Esc */
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onOpenChange]);

  const handleTypeChange = (type: ContentType) => {
    setContentType(type);
    setChecklistItems(checklistTemplates[type]);
    setEditChecklist(false);
    setNewItemLabel("");
  };

  const addChecklistItem = () => {
    if (!newItemLabel.trim()) return;
    setChecklistItems(prev => [...prev, newItemLabel.trim()]);
    setNewItemLabel("");
  };

  const reset = () => {
    setTitle(""); setDescription(""); setContentType("video");
    setPriority("medium"); setDueDate("");
    setCampaignId(""); setClientId("");
    setChecklistItems(checklistTemplates["video"]);
    setEditChecklist(false); setNewItemLabel("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const created = await db.createCard({
        campaignId: campaignId || null,
        clientId: clientId || null,
        title: title.trim(),
        description: description.trim(),
        contentType,
        stage: "script",
        priority,
        approvalStatus: "pending",
        dueDate: dueDate ? `${dueDate}T12:00:00.000Z` : new Date().toISOString(),
        checklist: checklistItems.filter(l => l.trim()).map((label, i) => ({
          id: `q-${i}-${crypto.randomUUID()}`, label, done: false,
        })),
        guidebook: [],
      });
      addCard(created);
      onOpenChange(false);
      reset();
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectCls = "w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 backdrop-blur-sm";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-md"
            onClick={() => { onOpenChange(false); reset(); }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-white/12 bg-zinc-900/90 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden"
              style={{ pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white">Nova Tarefa</h2>
                      <p className="text-xs text-white/40">Adicione uma nova tarefa de conteúdo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onOpenChange(false); reset(); }}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Campanha */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Campanha <span className="text-white/25 normal-case tracking-normal font-normal">(opcional)</span>
                  </Label>
                  <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className={selectCls}>
                    <option value="" style={{ background: "#18181b" }}>— Sem campanha —</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: "#18181b" }}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Cliente */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Cliente <span className="text-white/25 normal-case tracking-normal font-normal">(opcional)</span>
                  </Label>
                  <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={selectCls}>
                    <option value="" style={{ background: "#18181b" }}>— Sem cliente —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: "#18181b" }}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Título */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-white/60 uppercase tracking-wider">Título</Label>
                  <Input
                    placeholder="Ex: Episódio 3: Edição Avançada"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="rounded-xl border-white/10 bg-white/[0.06] placeholder:text-white/25 focus:border-violet-500/50 focus:ring-violet-500/30 backdrop-blur-sm"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-white/60 uppercase tracking-wider">Descrição <span className="text-white/25 normal-case tracking-normal font-normal">(opcional)</span></Label>
                  <Textarea
                    placeholder="Contexto, referências, objetivo da tarefa..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="rounded-xl border-white/10 bg-white/[0.06] placeholder:text-white/25 resize-none focus:border-violet-500/50 focus:ring-violet-500/30 backdrop-blur-sm"
                  />
                </div>

                {/* Tipo + Prioridade */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-white/60 uppercase tracking-wider">Tipo</Label>
                    <select value={contentType} onChange={(e) => handleTypeChange(e.target.value as ContentType)} className={selectCls}>
                      <option value="video"        style={{ background: "#18181b" }}>🎬 Vídeo</option>
                      <option value="presentation" style={{ background: "#18181b" }}>📊 Apresentação</option>
                      <option value="game"         style={{ background: "#18181b" }}>🎮 Game</option>
                      <option value="layout"       style={{ background: "#18181b" }}>🖼️ Layout</option>
                      <option value="site"         style={{ background: "#18181b" }}>🌐 Site</option>
                      <option value="identity"     style={{ background: "#18181b" }}>✨ Id. Visual</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-white/60 uppercase tracking-wider">Prioridade</Label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")} className={selectCls}>
                      <option value="low"    style={{ background: "#18181b" }}>🟢 Baixa</option>
                      <option value="medium" style={{ background: "#18181b" }}>🟡 Média</option>
                      <option value="high"   style={{ background: "#18181b" }}>🔴 Alta</option>
                    </select>
                  </div>
                </div>

                {/* Data de entrega */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-white/60 uppercase tracking-wider">Data Prevista de Entrega</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded-xl border-white/10 bg-white/[0.06] focus:border-violet-500/50 focus:ring-violet-500/30 backdrop-blur-sm"
                  />
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium text-white/35 uppercase tracking-wider">
                      Checklist — {checklistItems.length} itens
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditChecklist(v => !v)}
                      className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
                    >
                      {editChecklist ? "Fechar edição" : "Editar checklist"}
                    </button>
                  </div>

                  {editChecklist ? (
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 space-y-2 max-h-44 overflow-y-auto">
                      {checklistItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <GripVertical className="w-3 h-3 text-white/20 shrink-0" />
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => setChecklistItems(prev => prev.map((it, idx) => idx === i ? e.target.value : it))}
                            className="flex-1 text-xs bg-white/[0.05] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-white/75 focus:outline-none focus:border-violet-500/40"
                          />
                          <button
                            type="button"
                            onClick={() => setChecklistItems(prev => prev.filter((_, idx) => idx !== i))}
                            className="w-5 h-5 rounded flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-3 shrink-0" />
                        <input
                          type="text"
                          value={newItemLabel}
                          onChange={(e) => setNewItemLabel(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChecklistItem(); } }}
                          placeholder="Adicionar item..."
                          className="flex-1 text-xs bg-white/[0.05] border border-dashed border-white/[0.10] rounded-lg px-2.5 py-1.5 text-white/75 placeholder:text-white/25 focus:outline-none focus:border-violet-500/40"
                        />
                        <button
                          type="button"
                          onClick={addChecklistItem}
                          className="w-5 h-5 rounded flex items-center justify-center text-white/40 hover:text-violet-400 hover:bg-violet-500/10 transition-all shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                      <div className="grid grid-cols-2 gap-1">
                        {checklistItems.slice(0, 4).map((item, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-white/40">
                            <div className="w-3 h-3 rounded border border-white/20 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                        {checklistItems.length > 4 && (
                          <div className="text-[11px] text-white/25 col-span-2">
                            +{checklistItems.length - 4} mais itens...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { onOpenChange(false); reset(); }}
                    className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/60 hover:bg-white/[0.08] hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Plus className="w-4 h-4" />}
                    Criar Tarefa
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────
   Carousel card — visão horizontal de tarefas
───────────────────────────────────────────────────────── */
function CarouselCard({
  card, campaign, client, index, onClick,
}: {
  card: Card;
  campaign?: Campaign;
  client?: Client;
  index: number;
  onClick: () => void;
}) {
  const typeConf = contentTypeConfig[card.contentType];
  const prioConf = priorityConfig[card.priority];
  const today    = new Date();
  const isLate   = card.dueDate && isBefore(parseISO(card.dueDate), today);
  const checkDone  = card.checklist.filter((c) => c.done).length;
  const checkTotal = card.checklist.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="shrink-0 w-[272px] cursor-pointer group"
    >
      <motion.div
        whileHover={{ y: -7, scale: 1.025 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative rounded-2xl overflow-hidden bg-white/[0.70] dark:bg-white/[0.05] border border-violet-200/60 dark:border-white/[0.09] shadow-[0_4px_20px_rgba(109,40,217,0.10),0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.07)_inset]"
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        {/* Coloured top stripe */}
        <div className={`h-[3px] w-full bg-gradient-to-r ${typeConf.gradient}`} />

        {/* Inner top highlight — glass shine */}
        <div
          className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)" }}
        />

        {/* Hover shimmer sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

        {/* Side glow on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.08), transparent)`,
          }}
        />

        <div className="relative p-5 space-y-3.5">
          {/* Row 1: type icon + stage badge */}
          <div className="flex items-start justify-between gap-2">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeConf.gradient} flex items-center justify-center text-white shadow-lg shrink-0`}
              style={{ boxShadow: `0 4px 12px rgba(0,0,0,0.3)` }}
            >
              {typeConf.icon}
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-1 rounded-lg border mt-0.5"
              style={{
                borderColor: `${STAGE_COLORS[card.stage]}30`,
                color: STAGE_COLORS[card.stage],
                backgroundColor: `${STAGE_COLORS[card.stage]}10`,
              }}
            >
              {stageLabels[card.stage]}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-white/90 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors duration-200 line-clamp-2 min-h-[2.5rem]">
            {card.title}
          </h3>

          {/* Campaign */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: campaign?.color ?? "#8b5cf6",
                boxShadow: `0 0 6px ${campaign?.color ?? "#8b5cf6"}80`,
              }}
            />
            <span className="text-xs text-zinc-500 dark:text-white/40 truncate">{campaign?.name ?? "Sem campanha"}</span>
          </div>

          {/* Client */}
          {client && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-violet-400/70 shrink-0" />
              <span className="text-[11px] text-violet-500 dark:text-violet-400/80 font-medium truncate">{client.name}</span>
            </div>
          )}

          {/* Date */}
          <div className={`flex items-center gap-1.5 text-xs ${isLate ? "text-red-500 dark:text-red-400" : "text-zinc-500 dark:text-white/40"}`}>
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>
              {card.dueDate
                ? format(parseISO(card.dueDate), "dd 'de' MMM, yyyy", { locale: ptBR })
                : "Sem prazo"}
            </span>
            {isLate && <AlertCircle className="w-3 h-3 shrink-0" />}
          </div>

          {/* Checklist progress (if any) */}
          {checkTotal > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-white/25">Checklist</span>
                <span className="text-[9px] text-zinc-400 dark:text-white/30">{checkDone}/{checkTotal}</span>
              </div>
              <div className="w-full bg-violet-100 dark:bg-white/[0.07] rounded-full h-1 overflow-hidden">
                <motion.div
                  className={`h-1 rounded-full bg-gradient-to-r ${typeConf.gradient}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(checkDone / checkTotal) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.06 }}
                />
              </div>
            </div>
          )}

          {/* Footer: priority + content type */}
          <div className="flex items-center justify-between pt-0.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${prioConf.cls}`}>
              {prioConf.label}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-white/25 font-medium">{contentTypeLabels[card.contentType]}</span>
          </div>
        </div>

        {/* Bottom mirror gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(255,255,255,0.025), transparent)" }}
        />
      </motion.div>

      {/* Reflection below card */}
      <div
        className="relative h-8 mx-3 mt-0.5 pointer-events-none overflow-hidden"
        style={{ transform: "scaleY(-1)", opacity: 0.18, filter: "blur(2px)" }}
        aria-hidden
      >
        <div
          className="h-full rounded-b-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
          }}
        />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Client analytics — helpers + types
───────────────────────────────────────────────────────── */
const CLIENT_GRADIENTS_LIST = [
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-sky-600",
  "from-fuchsia-500 to-pink-600",
  "from-indigo-500 to-blue-700",
];
const CLIENT_SOLID_COLORS = [
  "#0ea5e9","#8b5cf6","#10b981","#ec4899","#f59e0b","#06b6d4","#d946ef","#6366f1",
];
function clientInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function clientGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return CLIENT_GRADIENTS_LIST[Math.abs(h) % CLIENT_GRADIENTS_LIST.length];
}
function clientSolidColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return CLIENT_SOLID_COLORS[Math.abs(h) % CLIENT_SOLID_COLORS.length];
}

type ClientStat = Client & {
  total: number;
  delivered: number;
  inProgress: number;
  late: number;
  stageBreakdown: Array<{ stage: Stage; count: number }>;
  clientCards: Card[];
  clientCampaigns: Campaign[];
};

/* ─────────────────────────────────────────────────────────
   ClientAnalyticsModal
───────────────────────────────────────────────────────── */
function ClientAnalyticsModal({
  stat, open, onClose,
}: {
  stat: ClientStat | null;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!stat) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PieMod = Pie as any;
  const donutData = stat.stageBreakdown
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: stageLabels[s.stage],
      value: s.count,
      stageKey: s.stage,
    }));

  const color = clientSolidColor(stat.name);
  const gradient = clientGradient(stat.name);
  const initials = clientInitials(stat.name);

  const kpis = [
    { label: "Total de Tarefas", value: stat.total,      accent: "#8b5cf6", bg: "bg-violet-500/10 dark:bg-violet-500/10", border: "border-violet-400/30" },
    { label: "Entregues",        value: stat.delivered,   accent: "#10b981", bg: "bg-emerald-500/10",                       border: "border-emerald-400/30" },
    { label: "Em Andamento",     value: stat.inProgress,  accent: "#3b82f6", bg: "bg-blue-500/10",                          border: "border-blue-400/30" },
    { label: "Atrasadas",        value: stat.late,        accent: "#ef4444", bg: "bg-red-500/10",                            border: "border-red-400/30" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="client-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="client-panel"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/[0.10]"
              style={{
                pointerEvents: "auto",
                background: "rgba(10,9,18,0.96)",
                backdropFilter: "blur(32px)",
                boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.75), 0 0 60px ${color}18`,
              }}
            >
              {/* Gradient top stripe */}
              <div className={`h-1 w-full rounded-t-3xl bg-gradient-to-r ${gradient}`} />

              {/* Header */}
              <div className="flex items-center gap-4 px-7 py-5 border-b border-white/[0.07]">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white leading-tight">{stat.name}</h2>
                  <p className="text-xs text-white/40 mt-0.5">Relatório Analítico</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white transition-all shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.07]">

                {/* Left: donut chart */}
                <div className="p-6 flex flex-col gap-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Tarefas por Estágio</p>
                  {donutData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <defs>
                            {donutData.map((entry) => (
                              <linearGradient key={entry.stageKey} id={`cmod-${entry.stageKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%"   stopColor={STAGE_GRADIENTS[entry.stageKey][0]} stopOpacity={1} />
                                <stop offset="100%" stopColor={STAGE_GRADIENTS[entry.stageKey][1]} stopOpacity={1} />
                              </linearGradient>
                            ))}
                          </defs>
                          <PieMod
                            data={donutData}
                            cx="50%" cy="50%"
                            innerRadius={55} outerRadius={82}
                            paddingAngle={4}
                            dataKey="value"
                            cornerRadius={6}
                          >
                            {donutData.map((entry, i) => (
                              <Cell key={i} fill={`url(#cmod-${entry.stageKey})`} stroke="transparent" />
                            ))}
                          </PieMod>
                          <RechartsTooltip
                            formatter={(v) => [`${v} tarefas`, ""]}
                            contentStyle={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(18,18,28,0.97)", color: "#fff", fontSize: "12px" }}
                            cursor={false}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Legend */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {donutData.map((entry) => (
                          <div key={entry.stageKey} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STAGE_GRADIENTS[entry.stageKey][0] }} />
                            <span className="text-xs text-white/50 truncate">{entry.name}</span>
                            <span className="text-xs text-white/30 ml-auto">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center py-12">
                      <p className="text-sm text-white/25 text-center">Nenhuma tarefa associada ainda.</p>
                    </div>
                  )}
                </div>

                {/* Right: stats */}
                <div className="p-6 flex flex-col gap-5">
                  {/* KPI grid */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">Resumo Geral</p>
                    <div className="grid grid-cols-2 gap-3">
                      {kpis.map((kpi) => (
                        <div key={kpi.label} className={`rounded-2xl border ${kpi.border} ${kpi.bg} px-4 py-3`}>
                          <p className="text-2xl font-bold" style={{ color: kpi.accent }}>{kpi.value}</p>
                          <p className="text-[11px] text-white/40 leading-tight mt-0.5">{kpi.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campaigns */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-2">Campanhas</p>
                    {stat.clientCampaigns.length > 0 ? (
                      <div className="space-y-1.5">
                        {stat.clientCampaigns.map((camp) => (
                          <div key={camp.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: camp.color, boxShadow: `0 0 5px ${camp.color}80` }} />
                            <span className="text-sm text-white/65 truncate">{camp.name}</span>
                            <span className="ml-auto text-xs text-white/25 shrink-0">
                              {stat.clientCards.filter((c) => c.campaignId === camp.id).length} tarefas
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/25 px-1">Nenhuma campanha vinculada.</p>
                    )}
                  </div>

                  {/* Recent tasks */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-2">Últimas Tarefas</p>
                    {stat.clientCards.length > 0 ? (
                      <div className="space-y-1.5">
                        {stat.clientCards.slice(0, 5).map((card) => (
                          <div key={card.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: STAGE_COLORS[card.stage] }} />
                            <span className="text-sm text-white/65 truncate flex-1">{card.title}</span>
                            <span className="text-[10px] font-semibold shrink-0" style={{ color: STAGE_COLORS[card.stage] }}>
                              {stageLabels[card.stage]}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/25 px-1">Nenhuma tarefa ainda.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────
   Dashboard Page
───────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router    = useRouter();
  const campaigns = useCreatorStore((s) => s.campaigns);
  const cards     = useCreatorStore((s) => s.cards);
  const clients   = useCreatorStore((s) => s.clients);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [demandDialogOpen,  setDemandDialogOpen]  = useState(false);
  const [selectedDemand,    setSelectedDemand]    = useState<Card | null>(null);
  const [demandDetailOpen,  setDemandDetailOpen]  = useState(false);
  const [viewMode,          setViewMode]          = useState<"list" | "carousel">("list");
  const [clientModalStat,   setClientModalStat]   = useState<ClientStat | null>(null);
  const [clientModalOpen,   setClientModalOpen]   = useState(false);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const today               = useMemo(() => new Date(), []);
  const startOfCurrentMonth = useMemo(() => startOfMonth(today), [today]);

  const { lateCards, inProgressCards, completedThisMonth, activeCampaigns } = useMemo(() => {
    let late = 0, inProgress = 0, completed = 0;
    const active = campaigns.filter((c) => !c.archived).length;
    cards.forEach((card) => {
      const done = card.stage === "published" || card.approvalStatus === "approved";
      if (!done) {
        inProgress++;
        if (card.dueDate && isBefore(parseISO(card.dueDate), today)) late++;
      } else if (isAfter(parseISO(card.updatedAt), startOfCurrentMonth)) {
        completed++;
      }
    });
    return { lateCards: late, inProgressCards: inProgress, completedThisMonth: completed, activeCampaigns: active };
  }, [cards, campaigns, today, startOfCurrentMonth]);

  const kpiValues: Record<string, number> = { lateCards, inProgressCards, completedThisMonth, activeCampaigns };

  const [activeChartIndex, setActiveChartIndex] = useState<number | undefined>(undefined);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = { script: 0, narration: 0, art: 0, editing: 0, review: 0, published: 0 };
    cards.forEach((c) => counts[c.stage]++);
    return Object.entries(counts)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, count]) => count > 0)
      .map(([key, value]) => ({
        name: stageLabels[key as Stage],
        value,
        color: STAGE_GRADIENTS[key as Stage][0],
        stageKey: key as Stage,
      }));
  }, [cards]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PieAny = Pie as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 9}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={8}
      />
    );
  };

  const deadlinesThisWeek = useMemo(() => {
    const endOfWeek = addDays(today, 7);
    return cards
      .filter((c) => c.stage !== "published" && c.dueDate && isWithinInterval(parseISO(c.dueDate), { start: subDays(today, 1), end: endOfWeek }))
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [cards, today]);

  const campaignProgress = useMemo(() => {
    return campaigns.filter((c) => !c.archived).map((campaign) => {
      const campCards = cards.filter((c) => c.campaignId === campaign.id);
      const total = campCards.length;
      const done  = campCards.filter((c) => c.stage === "published" || c.approvalStatus === "approved").length;
      return { ...campaign, progress: total === 0 ? 0 : Math.round((done / total) * 100), total, done };
    }).sort((a, b) => b.progress - a.progress);
  }, [campaigns, cards]);

  const activeDemands = useMemo(() => {
    const prioOrder = { high: 0, medium: 1, low: 2 };
    return cards
      .filter((c) => c.stage !== "published" && c.approvalStatus !== "approved")
      .sort((a, b) => {
        const pDiff = prioOrder[a.priority] - prioOrder[b.priority];
        if (pDiff !== 0) return pDiff;
        if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return 0;
      });
  }, [cards]);

  const clientStats = useMemo((): ClientStat[] => {
    return clients.map((client) => {
      const clientCards = cards.filter((c) => c.clientId === client.id);
      const delivered   = clientCards.filter((c) => c.stage === "published" || c.approvalStatus === "approved").length;
      const inProgress  = clientCards.filter((c) => c.stage !== "published" && c.approvalStatus !== "approved").length;
      const late        = clientCards.filter((c) => c.stage !== "published" && c.approvalStatus !== "approved" && c.dueDate && isBefore(parseISO(c.dueDate), today)).length;
      const stageBreakdown = (Object.keys(stageLabels) as Stage[]).map((stage) => ({
        stage, count: clientCards.filter((c) => c.stage === stage).length,
      }));
      const seen = new Set<string>();
      const campIds = clientCards.map((c) => c.campaignId).filter((id): id is string => !!id && !seen.has(id) && !!seen.add(id));
      const clientCampaigns = campaigns.filter((camp) => campIds.includes(camp.id));
      return { ...client, total: clientCards.length, delivered, inProgress, late, stageBreakdown, clientCards, clientCampaigns };
    });
  }, [clients, cards, campaigns, today]);

  const handleDemandClick = (card: Card) => {
    setSelectedDemand(card);
    setDemandDetailOpen(true);
  };

  return (
    <>
      {/* Modal da nova demanda */}
      <QuickDemandDialog open={demandDialogOpen} onOpenChange={setDemandDialogOpen} />

      {/* Detail sheet — abre ao clicar em uma demanda */}
      <CardDetailSheet
        card={selectedDemand}
        open={demandDetailOpen}
        onOpenChange={setDemandDetailOpen}
      />

      {/* Client analytics modal */}
      <ClientAnalyticsModal
        stat={clientModalStat}
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
      />

      {/* Background com gradiente sutil */}
      <div
        className="min-h-full"
        style={isDark ? {
          background: `
            radial-gradient(ellipse 70% 45% at 50% 0%, rgba(109,40,217,0.13) 0%, transparent 65%),
            radial-gradient(ellipse 35% 30% at 100% 80%, rgba(79,70,229,0.07) 0%, transparent 60%)
          `,
        } : {
          backgroundColor: "#f5f3ff",
          backgroundImage: `
            radial-gradient(ellipse 80% 55% at 50% -5%, rgba(109,40,217,0.12) 0%, transparent 65%),
            radial-gradient(ellipse 40% 35% at 100% 88%, rgba(79,70,229,0.08) 0%, transparent 62%),
            radial-gradient(rgba(109,40,217,0.028) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 28px 28px",
        }}
      >
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Visão geral da sua produção de conteúdo.</p>
          </div>

          {/* ── KPI Cards — glassmorphism ───────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiConfig.map((kpi, i) => {
              const isCompleted = kpi.key === "completedThisMonth";
              return (
                <motion.div
                  key={kpi.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  onClick={isCompleted ? () => router.push("/completed") : undefined}
                  className={isCompleted ? "cursor-pointer" : undefined}
                >
                  <motion.div
                    className={`relative rounded-2xl border overflow-hidden shadow-lg transition-all duration-300 group backdrop-blur-xl
                      ${isCompleted
                        ? "border-emerald-300/60 bg-white/70 dark:bg-white/[0.04] hover:border-emerald-400/60"
                        : `border-violet-200/60 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] ${kpi.glow} hover:border-violet-300/70 dark:hover:border-white/[0.14]`
                      }`}
                    animate={isCompleted ? {
                      boxShadow: [
                        "0 0 8px rgba(16,185,129,0.15), 0 0 20px rgba(16,185,129,0.06)",
                        "0 0 16px rgba(16,185,129,0.35), 0 0 40px rgba(16,185,129,0.14)",
                        "0 0 8px rgba(16,185,129,0.15), 0 0 20px rgba(16,185,129,0.06)",
                      ]
                    } : {}}
                    transition={isCompleted ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : {}}
                    whileHover={isCompleted ? {
                      boxShadow: "0 0 20px rgba(16,185,129,0.5), 0 0 50px rgba(16,185,129,0.20)"
                    } : {}}
                  >
                    {/* Linha colorida no topo */}
                    <div className={`h-0.5 w-full bg-gradient-to-r ${kpi.gradient}`} />
                    {/* Glow sutil no canto */}
                    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${kpi.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
                    <div className="p-5 flex items-center gap-4 relative">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.iconBg} flex items-center justify-center shadow-md shrink-0`}>
                        <kpi.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground truncate">{kpi.title}</p>
                        <h3 className="text-3xl font-bold mt-0.5 leading-none">{kpiValues[kpi.key]}</h3>
                        {isCompleted && (
                          <p className="text-[10px] text-emerald-400/70 mt-1 font-medium">Ver todos →</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Demandas Ativas ───────────────────────────── */}
          <GlassCard>
            <div className="p-5 border-b border-zinc-200 dark:border-white/[0.06]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25 shrink-0">
                    <ListTodo className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Tarefas Ativas</h2>
                    <p className="text-xs text-muted-foreground">
                      {activeDemands.length} {activeDemands.length === 1 ? "tarefa em produção" : "tarefas em produção"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* View toggle */}
                  <div className="flex items-center gap-0.5 p-1 rounded-xl border border-violet-200/60 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04]">
                    <button
                      onClick={() => setViewMode("list")}
                      title="Visão lista"
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        viewMode === "list"
                          ? "bg-violet-500/20 text-violet-600 dark:text-violet-400"
                          : "text-zinc-400 dark:text-white/30 hover:text-zinc-600 dark:hover:text-white/60 hover:bg-white dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("carousel")}
                      title="Visão carrossel"
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        viewMode === "carousel"
                          ? "bg-violet-500/20 text-violet-600 dark:text-violet-400"
                          : "text-zinc-400 dark:text-white/30 hover:text-zinc-600 dark:hover:text-white/60 hover:bg-white dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Botão Nova Tarefa */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDemandDialogOpen(true)}
                    className="relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-violet-500/25 group"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    <Plus className="w-4 h-4 relative" />
                    <span className="relative">Nova Tarefa</span>
                    <Sparkles className="w-3.5 h-3.5 relative opacity-70" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* ── Lista ──────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {viewMode === "list" ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="divide-y divide-violet-100/70 dark:divide-white/[0.04]"
                >
                  {activeDemands.length > 0 ? (
                    activeDemands.map((card, i) => {
                      const camp     = campaigns.find((c) => c.id === card.campaignId);
                      const client   = clients.find((c) => c.id === card.clientId);
                      const typeConf = contentTypeConfig[card.contentType];
                      const prioConf = priorityConfig[card.priority];
                      const isLate   = card.dueDate && isBefore(parseISO(card.dueDate), today);

                      return (
                        <motion.button
                          key={card.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.035, duration: 0.3 }}
                          onClick={() => handleDemandClick(card)}
                          className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/50 dark:hover:bg-white/[0.04] transition-colors text-left group cursor-pointer"
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: camp?.color ?? "#8b5cf6", boxShadow: `0 0 6px ${camp?.color ?? "#8b5cf6"}80` }}
                          />
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${typeConf.gradient} flex items-center justify-center shrink-0 text-white shadow-sm`}>
                            {typeConf.icon}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-medium text-sm truncate leading-tight group-hover:text-violet-300 transition-colors">{card.title}</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs text-muted-foreground truncate">{camp?.name ?? "—"}</p>
                              {client && (
                                <>
                                  <span className="text-muted-foreground/40 text-xs">·</span>
                                  <span className="flex items-center gap-1 text-[11px] text-violet-500 dark:text-violet-400/80 font-medium truncate">
                                    <Building2 className="w-3 h-3 shrink-0" />{client.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-md border font-medium"
                              style={{ borderColor: `${STAGE_COLORS[card.stage]}35`, color: STAGE_COLORS[card.stage], backgroundColor: `${STAGE_COLORS[card.stage]}12` }}
                            >
                              {stageLabels[card.stage]}
                            </span>
                            <div className="w-px h-4 bg-violet-200/60 dark:bg-white/[0.08] shrink-0" />
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-[8px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-white/20 leading-none">Prioridade</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${prioConf.cls}`}>
                                {prioConf.label}
                              </span>
                            </div>
                            {card.dueDate && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${isLate ? "text-red-600 dark:text-red-400 border-red-400/40 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10" : "text-zinc-500 dark:text-white/40 border-violet-200/60 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04]"}`}>
                                {format(parseISO(card.dueDate), "dd MMM", { locale: ptBR })}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mr-1 group-hover:text-violet-400" />
                        </motion.button>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/70 dark:bg-white/5 border border-violet-200/60 dark:border-white/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-70" />
                      </div>
                      <p className="text-sm text-muted-foreground">Nenhuma tarefa ativa no momento.</p>
                      <button
                        onClick={() => setDemandDialogOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-violet-200/60 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] text-sm text-zinc-600 dark:text-white/60 hover:bg-white/90 dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-white transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Criar primeira tarefa
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* ── Carrossel ──────────────────────────────── */
                <motion.div
                  key="carousel"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {activeDemands.length > 0 ? (
                    <div className="relative">
                      {/* Fade edges */}
                      <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
                        style={{ background: isDark ? "linear-gradient(to right, rgba(9,9,11,0.9), transparent)" : "linear-gradient(to right, rgba(245,243,255,0.97), transparent)" }} />
                      <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
                        style={{ background: isDark ? "linear-gradient(to left, rgba(9,9,11,0.9), transparent)" : "linear-gradient(to left, rgba(245,243,255,0.97), transparent)" }} />

                      {/* Scroll arrows */}
                      <button
                        onClick={() => scrollCarousel("left")}
                        className={`absolute left-2 top-1/2 -translate-y-6 z-20 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-md ${isDark ? "border border-white/[0.10] bg-black/50 text-white/50 hover:text-white hover:border-white/25" : "border border-zinc-200 bg-white/90 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"}`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollCarousel("right")}
                        className={`absolute right-2 top-1/2 -translate-y-6 z-20 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-md ${isDark ? "border border-white/[0.10] bg-black/50 text-white/50 hover:text-white hover:border-white/25" : "border border-zinc-200 bg-white/90 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Cards container */}
                      <div
                        ref={carouselRef}
                        className="flex gap-4 px-5 py-5 overflow-x-auto"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {activeDemands.map((card, i) => {
                          const camp   = campaigns.find((c) => c.id === card.campaignId);
                          const client = clients.find((c) => c.id === card.clientId);
                          return (
                            <CarouselCard
                              key={card.id}
                              card={card}
                              campaign={camp}
                              client={client}
                              index={i}
                              onClick={() => handleDemandClick(card)}
                            />
                          );
                        })}
                        {/* Spacer to avoid last card touching fade */}
                        <div className="shrink-0 w-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/70 dark:bg-white/5 border border-violet-200/60 dark:border-white/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-70" />
                      </div>
                      <p className="text-sm text-muted-foreground">Nenhuma tarefa ativa no momento.</p>
                      <button
                        onClick={() => setDemandDialogOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-violet-200/60 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] text-sm text-zinc-600 dark:text-white/60 hover:bg-white/90 dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-white transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Criar primeira tarefa
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* ── Middle row ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Chart */}
            <GlassCard className="lg:col-span-1 flex flex-col">
              <div className="p-5 border-b border-zinc-200 dark:border-white/[0.06] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Por Estágio</p>
                  <p className="text-xs text-muted-foreground">Distribuição dos cards</p>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-[240px] p-4">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      {/* SVG gradients */}
                      <defs>
                        {chartData.map((entry) => (
                          <linearGradient key={entry.stageKey} id={`donut-${entry.stageKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%"   stopColor={STAGE_GRADIENTS[entry.stageKey][0]} stopOpacity={1} />
                            <stop offset="100%" stopColor={STAGE_GRADIENTS[entry.stageKey][1]} stopOpacity={1} />
                          </linearGradient>
                        ))}
                      </defs>
                      <PieAny
                        data={chartData}
                        cx="50%" cy="50%"
                        innerRadius={52} outerRadius={78}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={7}
                        activeIndex={activeChartIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_: unknown, index: number) => setActiveChartIndex(index)}
                        onMouseLeave={() => setActiveChartIndex(undefined)}
                        style={{ cursor: "pointer", outline: "none" }}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#donut-${entry.stageKey})`}
                            stroke="transparent"
                            strokeWidth={0}
                          />
                        ))}
                      </PieAny>
                      <RechartsTooltip
                        formatter={(value) => [`${value} cards`, "Qtd"]}
                        contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(24,24,27,0.95)", color: "#fff", fontSize: "12px", backdropFilter: "blur(8px)" }}
                        cursor={false}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={7}
                        wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum dado ainda.</p>
                )}
              </div>
            </GlassCard>

            {/* Prazos */}
            <GlassCard className="lg:col-span-1">
              <div className="p-5 border-b border-zinc-200 dark:border-white/[0.06] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Prazos Próximos</p>
                  <p className="text-xs text-muted-foreground">Entregas desta semana</p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {deadlinesThisWeek.length > 0 ? (
                  deadlinesThisWeek.map((card) => {
                    const isLate = isBefore(parseISO(card.dueDate!), today);
                    return (
                      <div key={card.id} className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-violet-100 dark:border-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.07] transition-colors gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm leading-tight line-clamp-1">{card.title}</p>
                          <p className="text-xs text-muted-foreground">{stageLabels[card.stage]}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium whitespace-nowrap shrink-0 ${isLate ? "text-red-600 dark:text-red-400 border-red-400/40 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10" : "text-zinc-500 dark:text-white/40 border-violet-200/60 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04]"}`}>
                          {format(parseISO(card.dueDate!), "dd MMM", { locale: ptBR })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-50" />
                    <p className="text-xs text-muted-foreground">Tudo em dia esta semana!</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Campanhas */}
            <GlassCard className="lg:col-span-1">
              <div className="p-5 border-b border-zinc-200 dark:border-white/[0.06] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0">
                  <FolderOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Campanhas</p>
                  <p className="text-xs text-muted-foreground">Progresso das tarefas</p>
                </div>
              </div>
              <div className="p-5 space-y-5">
                {campaignProgress.length > 0 ? (
                  campaignProgress.map((camp) => (
                    <div key={camp.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: camp.color, boxShadow: `0 0 6px ${camp.color}80` }} />
                          <span className="font-medium text-sm truncate">{camp.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{camp.done}/{camp.total}</span>
                      </div>
                      <div className="w-full bg-violet-100 dark:bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="h-1.5 rounded-full"
                          style={{ backgroundColor: camp.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${camp.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <span className="text-xs font-semibold" style={{ color: camp.color }}>{camp.progress}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma campanha ativa.</p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* ── Visão por Cliente ───────────────────────── */}
          {clientStats.length > 0 && (
            <GlassCard>
              <div className="p-5 border-b border-zinc-200 dark:border-white/[0.06] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Por Cliente</p>
                  <p className="text-xs text-muted-foreground">Produção agrupada por cliente</p>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {clientStats.map((cs, i) => {
                  const gradient = clientGradient(cs.name);
                  const color    = clientSolidColor(cs.name);
                  const initials = clientInitials(cs.name);
                  const deliverPct = cs.total > 0 ? Math.round((cs.delivered / cs.total) * 100) : 0;

                  return (
                    <motion.div
                      key={cs.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="group rounded-2xl border border-violet-100/70 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] overflow-hidden hover:border-violet-300/60 dark:hover:border-white/[0.14] transition-all shadow-sm hover:shadow-md"
                    >
                      {/* Gradient top strip */}
                      <div className={`h-[3px] w-full bg-gradient-to-r ${gradient}`} />

                      <div className="p-4 space-y-3.5">
                        {/* Header row */}
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md`}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-zinc-900 dark:text-white/90 truncate leading-tight">{cs.name}</p>
                            <p className="text-[11px] text-zinc-400 dark:text-white/30">{cs.total} {cs.total === 1 ? "tarefa" : "tarefas"}</p>
                          </div>
                          {cs.late > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-400/30 text-red-500 dark:text-red-400 font-semibold shrink-0">
                              {cs.late} atras.
                            </span>
                          )}
                        </div>

                        {/* Stage stacked bar */}
                        {cs.total > 0 ? (
                          <div>
                            <div className="flex w-full h-2 rounded-full overflow-hidden gap-px">
                              {cs.stageBreakdown.filter((s) => s.count > 0).map((s) => (
                                <div
                                  key={s.stage}
                                  title={`${stageLabels[s.stage]}: ${s.count}`}
                                  className="h-full transition-all"
                                  style={{
                                    width: `${(s.count / cs.total) * 100}%`,
                                    backgroundColor: STAGE_COLORS[s.stage],
                                    minWidth: "4px",
                                  }}
                                />
                              ))}
                            </div>
                            {/* Entregue % */}
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-zinc-400 dark:text-white/25">Entregues</span>
                              <span className="text-[11px] font-semibold" style={{ color }}>{deliverPct}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-white/[0.05]" />
                        )}

                        {/* KPI chips row */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ {cs.delivered} entregues
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-lg border border-blue-400/25 bg-blue-500/08 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                            {cs.inProgress} em andamento
                          </span>
                        </div>

                        {/* Campaigns */}
                        {cs.clientCampaigns.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {cs.clientCampaigns.slice(0, 3).map((camp) => (
                              <span
                                key={camp.id}
                                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg border font-medium"
                                style={{ borderColor: `${camp.color}35`, color: camp.color, backgroundColor: `${camp.color}12` }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: camp.color }} />
                                {camp.name}
                              </span>
                            ))}
                            {cs.clientCampaigns.length > 3 && (
                              <span className="text-[10px] text-zinc-400 dark:text-white/25">+{cs.clientCampaigns.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* CTA */}
                        <button
                          onClick={() => { setClientModalStat(cs); setClientModalOpen(true); }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-violet-200/60 dark:border-white/[0.09] bg-violet-50/60 dark:bg-white/[0.04] hover:bg-violet-100/80 dark:hover:bg-white/[0.08] hover:border-violet-300/60 dark:hover:border-white/[0.16] text-[11px] font-semibold text-violet-600 dark:text-violet-400 transition-all group-hover:border-violet-300/80 dark:group-hover:border-violet-500/30"
                        >
                          <TrendingUp className="w-3 h-3" />
                          + Informações
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          )}

        </div>
      </div>
    </>
  );
}
