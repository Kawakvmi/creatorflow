"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import * as db from "@/lib/supabase/db";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Folder, Briefcase, Camera, Music, Palette, PenTool,
  LayoutTemplate, Box, Globe, Megaphone, Sparkles, X, FolderOpen,
  MoreHorizontal, CheckCircle2, Trash2, RotateCcw, ChevronDown, AlertTriangle,
  Users, UserPlus, Pencil, Building2,
} from "lucide-react";
import { Client } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const ICONS = [
  { name: "folder",    icon: Folder },
  { name: "briefcase", icon: Briefcase },
  { name: "camera",    icon: Camera },
  { name: "music",     icon: Music },
  { name: "palette",   icon: Palette },
  { name: "pen",       icon: PenTool },
  { name: "layout",    icon: LayoutTemplate },
  { name: "box",       icon: Box },
  { name: "globe",     icon: Globe },
  { name: "megaphone", icon: Megaphone },
];

const COLORS = [
  "#8b5cf6", "#3b82f6", "#ec4899", "#f59e0b",
  "#10b981", "#ef4444", "#6366f1", "#14b8a6",
];

/* ─── Modal Nova Campanha ──────────────────────────────────────────────────── */
function NewCampaignModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const addCampaign = useCreatorStore((s) => s.addCampaign);
  const [name,          setName]          = useState("");
  const [description,   setDescription]   = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon,  setSelectedIcon]  = useState(ICONS[0].name);
  const [loading,       setLoading]       = useState(false);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onOpenChange]);

  const reset = () => {
    setName(""); setDescription("");
    setSelectedColor(COLORS[0]); setSelectedIcon(ICONS[0].name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const created = await db.createCampaign({ name: name.trim(), description: description.trim(), color: selectedColor, icon: selectedIcon, archived: false });
      addCampaign(created);
      onOpenChange(false);
      reset();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-md" onClick={() => { onOpenChange(false); reset(); }} />
          <motion.div key="modal" initial={{ opacity: 0, scale: 0.9, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-0 z-[61] flex items-center justify-center p-4" style={{ pointerEvents: "none" }}>
            <div className="w-full max-w-md rounded-2xl border border-white/[0.10] bg-zinc-900/90 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden" style={{ pointerEvents: "auto" }} onClick={(e) => e.stopPropagation()}>
              <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white">Nova Campanha</h2>
                      <p className="text-xs text-white/40">Organize seus projetos de conteúdo</p>
                    </div>
                  </div>
                  <button onClick={() => { onOpenChange(false); reset(); }} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-white/60 uppercase tracking-wider">Nome da Campanha</Label>
                  <Input placeholder="Ex: Lançamento Curso 2.0" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl border-white/10 bg-white/[0.06] placeholder:text-white/25 focus:border-violet-500/50 focus:ring-violet-500/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-white/60 uppercase tracking-wider">Descrição <span className="text-white/25 normal-case tracking-normal font-normal">(opcional)</span></Label>
                  <Textarea placeholder="Objetivo principal da campanha..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="rounded-xl border-white/10 bg-white/[0.06] placeholder:text-white/25 resize-none focus:border-violet-500/50 focus:ring-violet-500/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-white/60 uppercase tracking-wider">Cor de Destaque</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setSelectedColor(c)}
                        className={`w-8 h-8 rounded-full transition-all ${selectedColor === c ? "ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110" : "hover:scale-110 opacity-60 hover:opacity-100"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-white/60 uppercase tracking-wider">Ícone</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {ICONS.map((i) => {
                      const IconCmp = i.icon;
                      return (
                        <button key={i.name} type="button" onClick={() => setSelectedIcon(i.name)}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${selectedIcon === i.name ? "border-violet-500/50 bg-violet-500/15 text-violet-400" : "border-white/[0.08] bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70"}`}>
                          <IconCmp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shrink-0" style={{ backgroundColor: selectedColor, boxShadow: `0 4px 14px ${selectedColor}50` }}>
                    {(() => { const ic = ICONS.find(i => i.name === selectedIcon); return ic ? <ic.icon className="w-5 h-5" /> : <Folder className="w-5 h-5" />; })()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white leading-tight">{name || "Nome da campanha"}</p>
                    <p className="text-[11px] text-white/35">{description || "Sem descrição"}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { onOpenChange(false); reset(); }} className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/60 hover:bg-white/[0.08] hover:text-white transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                    Criar Campanha
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

/* ─── Modal Novo Cliente ───────────────────────────────────────────────────── */
function NewClientModal({
  open, onOpenChange, editingClient, onClose,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingClient?: Client | null;
  onClose: () => void;
}) {
  const addClient    = useCreatorStore((s) => s.addClient);
  const updateClient = useCreatorStore((s) => s.updateClient);
  const [name,    setName]    = useState(editingClient?.name    ?? "");
  const [notes,   setNotes]   = useState(editingClient?.notes   ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editingClient?.name ?? "");
      setNotes(editingClient?.notes ?? "");
    }
  }, [open, editingClient]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (editingClient) {
        updateClient(editingClient.id, { name: name.trim(), notes: notes.trim() });
        await db.updateClient(editingClient.id, { name: name.trim(), notes: notes.trim() });
      } else {
        const created = await db.createClient({ name: name.trim(), notes: notes.trim() });
        addClient(created);
      }
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-md" onClick={() => onOpenChange(false)} />
          <motion.div key="modal" initial={{ opacity: 0, scale: 0.9, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-0 z-[61] flex items-center justify-center p-4" style={{ pointerEvents: "none" }}>
            <div className="w-full max-w-md rounded-2xl border border-white/[0.10] bg-zinc-900/90 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden" style={{ pointerEvents: "auto" }} onClick={(e) => e.stopPropagation()}>
              <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-600/10 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white">{editingClient ? "Editar Cliente" : "Novo Cliente"}</h2>
                      <p className="text-xs text-white/40">Cadastre um cliente para vincular às tarefas</p>
                    </div>
                  </div>
                  <button onClick={() => onOpenChange(false)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider block">Nome do Cliente</label>
                  <input
                    placeholder="Ex: Empresa XYZ, João Silva..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    className="w-full h-10 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider block">
                    Informações Adicionais <span className="text-white/25 normal-case tracking-normal font-normal">(opcional)</span>
                  </label>
                  <textarea
                    placeholder="Contato, segmento, observações..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.06] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/40 resize-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => onOpenChange(false)} className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/60 hover:bg-white/[0.08] hover:text-white transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:from-sky-500 hover:to-blue-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editingClient ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingClient ? "Salvar Alterações" : "Cadastrar Cliente"}
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

/* ─── Client Card ──────────────────────────────────────────────────────────── */
function ClientCard({
  client, index, onEdit, onDelete,
}: {
  client: Client;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [menuOpen]);

  const initials = client.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div className="relative rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] backdrop-blur-xl overflow-visible shadow-sm transition-all duration-200 hover:border-sky-300 dark:hover:border-sky-500/30 hover:shadow-md group">
        <div className="h-0.5 w-full rounded-t-2xl bg-gradient-to-r from-sky-400 to-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
              {initials || <Building2 className="w-5 h-5" />}
            </div>
            <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setConfirmDelete(false); setMenuOpen(v => !v); }}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all
                  ${menuOpen
                    ? "bg-white/10 dark:bg-white/10 border-white/20 text-zinc-700 dark:text-white/80"
                    : "opacity-0 group-hover:opacity-100 bg-zinc-100 dark:bg-white/[0.05] border-zinc-200 dark:border-white/[0.08] text-zinc-500 dark:text-white/40 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-800 dark:hover:text-white/80"
                  }`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-white/[0.10] shadow-xl shadow-black/40 overflow-hidden z-[9999]"
                    style={{ background: "rgba(14,13,20,0.95)", backdropFilter: "blur(20px)" }}
                  >
                    <div className="p-1">
                      <button onClick={() => { setMenuOpen(false); onEdit(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white/90 hover:bg-white/[0.07] transition-all text-left">
                        <Pencil className="w-3.5 h-3.5" /> Editar cliente
                      </button>
                      <div className="h-px bg-white/[0.06] mx-1 my-0.5" />
                      {!confirmDelete ? (
                        <button onClick={() => setConfirmDelete(true)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.08] transition-all text-left">
                          <Trash2 className="w-3.5 h-3.5" /> Excluir cliente
                        </button>
                      ) : (
                        <div className="px-3 py-2.5 space-y-2">
                          <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" /> Confirmar exclusão?
                          </div>
                          <p className="text-[10px] text-white/30 leading-relaxed">Os cards vinculados perderão este cliente.</p>
                          <div className="flex gap-2 pt-0.5">
                            <button onClick={() => setConfirmDelete(false)} className="flex-1 h-7 rounded-lg border border-white/10 text-[11px] text-white/50 hover:text-white hover:bg-white/[0.07] transition-all">Cancelar</button>
                            <button onClick={() => { setMenuOpen(false); setConfirmDelete(false); onDelete(); }} className="flex-1 h-7 rounded-lg bg-red-500/20 border border-red-500/30 text-[11px] text-red-400 hover:bg-red-500/30 transition-all font-semibold">Excluir</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <h3 className="font-semibold text-base leading-tight mb-1 text-zinc-900 dark:text-white/90">{client.name}</h3>
          <p className="text-xs text-zinc-400 dark:text-white/30 line-clamp-2 min-h-[2rem]">
            {client.notes || "Sem informações adicionais."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Campaign Card ────────────────────────────────────────────────────────── */
function CampaignCard({
  campaign, index, progress, total, isArchived,
  onOpen, onArchive, onUnarchive, onDelete,
}: {
  campaign: { id: string; name: string; description: string; color: string; icon: string };
  index: number; progress: number; total: number; isArchived: boolean;
  onOpen: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
}) {
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const IconComponent = ICONS.find((i) => i.name === campaign.icon)?.icon || Folder;

  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [menuOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isArchived ? 0.7 : 1, y: 0 }}
      whileHover={{ y: isArchived ? 0 : -5 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`group ${isArchived ? "" : "cursor-pointer"}`}
      onClick={() => { if (!menuOpen && !confirmDelete) onOpen(); }}
    >
      <div className={`relative rounded-2xl border backdrop-blur-xl overflow-visible shadow-lg transition-all duration-300
        ${isArchived
          ? "border-zinc-200 dark:border-white/[0.05] bg-zinc-50 dark:bg-white/[0.02]"
          : "border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] group-hover:border-zinc-300 dark:group-hover:border-white/[0.16] group-hover:bg-zinc-50 dark:group-hover:bg-white/[0.07] group-hover:shadow-xl"
        }`}
        style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.15)` }}
      >
        {/* Hover glow */}
        {!isArchived && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${campaign.color}18 0%, transparent 70%)` }} />
        )}

        {/* Accent line */}
        <div className="h-0.5 w-full rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${campaign.color}${isArchived ? "60" : "ff"}, ${campaign.color}00)` }} />

        {/* Corner glow */}
        {!isArchived && (
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-300 pointer-events-none"
            style={{ backgroundColor: campaign.color }} />
        )}

        <div className="relative p-5">
          {/* Icon + actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 transition-transform group-hover:scale-105 duration-300"
              style={{ background: `linear-gradient(135deg, ${campaign.color}${isArchived ? "80" : "ff"}, ${campaign.color}${isArchived ? "55" : "cc"})`, boxShadow: `0 4px 14px ${campaign.color}${isArchived ? "20" : "40"}` }}>
              {isArchived
                ? <CheckCircle2 className="w-5 h-5" />
                : <IconComponent className="w-5 h-5" />}
            </div>

            {/* Menu trigger */}
            <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setConfirmDelete(false); setMenuOpen(v => !v); }}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all
                  ${menuOpen
                    ? "bg-white/10 dark:bg-white/10 border-white/20 text-zinc-700 dark:text-white/80"
                    : "opacity-0 group-hover:opacity-100 bg-zinc-100 dark:bg-white/[0.05] border-zinc-200 dark:border-white/[0.08] text-zinc-500 dark:text-white/40 hover:bg-zinc-200 dark:hover:bg-white/[0.10] hover:text-zinc-800 dark:hover:text-white/80"
                  }`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown menu */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-white/[0.10] shadow-xl shadow-black/40 overflow-hidden z-[9999]"
                    style={{ background: "rgba(14,13,20,0.95)", backdropFilter: "blur(20px)" }}
                  >
                    {!isArchived ? (
                      <>
                        <div className="p-1">
                          <button onClick={() => { setMenuOpen(false); onOpen(); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white/90 hover:bg-white/[0.07] transition-all text-left">
                            <IconComponent className="w-3.5 h-3.5" />
                            Abrir campanha
                          </button>
                          <button onClick={() => { setMenuOpen(false); onArchive(); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/[0.08] transition-all text-left">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Marcar como Concluída
                          </button>
                        </div>
                        <div className="h-px bg-white/[0.06] mx-2" />
                        <div className="p-1">
                          {!confirmDelete ? (
                            <button onClick={() => setConfirmDelete(true)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.08] transition-all text-left">
                              <Trash2 className="w-3.5 h-3.5" />
                              Excluir campanha
                            </button>
                          ) : (
                            <div className="px-3 py-2.5 space-y-2">
                              <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Excluir permanentemente?
                              </div>
                              <p className="text-[10px] text-white/30 leading-relaxed">Todos os cards serão removidos. Essa ação não pode ser desfeita.</p>
                              <div className="flex gap-2 pt-0.5">
                                <button onClick={() => setConfirmDelete(false)}
                                  className="flex-1 h-7 rounded-lg border border-white/10 text-[11px] text-white/50 hover:text-white hover:bg-white/[0.07] transition-all">
                                  Cancelar
                                </button>
                                <button onClick={() => { setMenuOpen(false); setConfirmDelete(false); onDelete(); }}
                                  className="flex-1 h-7 rounded-lg bg-red-500/20 border border-red-500/30 text-[11px] text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all font-semibold">
                                  Excluir
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="p-1 space-y-0.5">
                        <button onClick={() => { setMenuOpen(false); onUnarchive(); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-violet-400/80 hover:text-violet-300 hover:bg-violet-500/[0.08] transition-all text-left">
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reativar campanha
                        </button>
                        <div className="h-px bg-white/[0.06] mx-1 my-0.5" />
                        {!confirmDelete ? (
                          <button onClick={() => setConfirmDelete(true)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.08] transition-all text-left">
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir definitivamente
                          </button>
                        ) : (
                          <div className="px-3 py-2.5 space-y-2">
                            <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Confirmar exclusão?
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setConfirmDelete(false)} className="flex-1 h-7 rounded-lg border border-white/10 text-[11px] text-white/50 hover:text-white hover:bg-white/[0.07] transition-all">Cancelar</button>
                              <button onClick={() => { setMenuOpen(false); setConfirmDelete(false); onDelete(); }} className="flex-1 h-7 rounded-lg bg-red-500/20 border border-red-500/30 text-[11px] text-red-400 hover:bg-red-500/30 transition-all font-semibold">Excluir</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Name + description */}
          <h3 className={`font-semibold text-base leading-tight mb-1.5 ${isArchived ? "text-zinc-500 dark:text-white/40" : "text-zinc-900 dark:text-white/90"}`}>
            {campaign.name}
          </h3>
          <p className="text-xs text-zinc-400 dark:text-white/30 line-clamp-2 min-h-[2rem] mb-4">
            {campaign.description || "Sem descrição."}
          </p>

          {/* Progress */}
          <div className="border-t border-zinc-200 dark:border-white/[0.05] pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 dark:text-white/35 font-medium">
                {isArchived ? "Concluída" : "Progresso"}
              </span>
              <span className="font-semibold" style={{ color: isArchived ? "#6b7280" : campaign.color }}>
                {progress}%
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
              <div className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, backgroundColor: isArchived ? "#6b7280" : campaign.color }} />
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-white/25">
              {total} card{total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function CampaignsPage() {
  const router         = useRouter();
  const allCampaigns   = useCreatorStore((s) => s.campaigns);
  const cards          = useCreatorStore((s) => s.cards);
  const clients        = useCreatorStore((s) => s.clients);
  const updateCampaign = useCreatorStore((s) => s.updateCampaign);
  const removeCampaign = useCreatorStore((s) => s.removeCampaign);
  const removeClient   = useCreatorStore((s) => s.removeClient);

  const active   = allCampaigns.filter((c) => !c.archived);
  const archived = allCampaigns.filter((c) => c.archived);

  const [open,            setOpen]            = useState(false);
  const [showArchived,    setShowArchived]    = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient,   setEditingClient]   = useState<Client | null>(null);

  const getCampaignProgress = (campaignId: string) => {
    const cc = cards.filter((c) => c.campaignId === campaignId);
    const done = cc.filter((c) => c.stage === "published" || c.approvalStatus === "approved").length;
    return { progress: cc.length === 0 ? 0 : Math.round((done / cc.length) * 100), total: cc.length };
  };

  const handleArchive = async (id: string) => {
    updateCampaign(id, { archived: true });
    await db.updateCampaign(id, { archived: true });
  };

  const handleUnarchive = async (id: string) => {
    updateCampaign(id, { archived: false });
    await db.updateCampaign(id, { archived: false });
  };

  const handleDelete = async (id: string) => {
    removeCampaign(id);
    await db.deleteCampaign(id);
  };

  const handleDeleteClient = async (id: string) => {
    removeClient(id);
    await db.deleteClient(id);
  };

  const openEditClient = (client: Client) => {
    setEditingClient(client);
    setClientModalOpen(true);
  };

  const closeClientModal = () => {
    setClientModalOpen(false);
    setEditingClient(null);
  };

  return (
    <>
      <NewCampaignModal open={open} onOpenChange={setOpen} />
      <NewClientModal
        open={clientModalOpen}
        onOpenChange={(v) => { if (!v) closeClientModal(); else setClientModalOpen(true); }}
        editingClient={editingClient}
        onClose={closeClientModal}
      />

      <div className="min-h-full" style={{ background: `radial-gradient(ellipse 75% 45% at 50% 0%, rgba(109,40,217,0.11) 0%, transparent 60%), radial-gradient(ellipse 35% 30% at 0% 80%, rgba(79,70,229,0.06) 0%, transparent 55%)` }}>
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
              <p className="text-muted-foreground text-sm">Gerencie seus projetos e campanhas de conteúdo.</p>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setOpen(true)}
              className="relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-violet-500/25 shrink-0 group"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <Plus className="w-4 h-4 relative" />
              <span className="relative">Nova Campanha</span>
              <Sparkles className="w-3.5 h-3.5 relative opacity-70" />
            </motion.button>
          </div>

          {/* Active campaigns */}
          {active.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-zinc-200 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center mb-4">
                <FolderOpen className="w-7 h-7 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Nenhuma campanha ativa</h2>
              <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                Crie sua primeira campanha para começar a organizar sua produção de conteúdo.
              </p>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setOpen(true)}
                className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-violet-500/25 group"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <Plus className="w-4 h-4 relative" />
                <span className="relative">Criar Minha Primeira Campanha</span>
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {active.map((campaign, index) => {
                const { progress, total } = getCampaignProgress(campaign.id);
                return (
                  <CampaignCard key={campaign.id} campaign={campaign} index={index} progress={progress} total={total} isArchived={false}
                    onOpen={() => router.push(`/campaigns/${campaign.id}`)}
                    onArchive={() => handleArchive(campaign.id)}
                    onUnarchive={() => handleUnarchive(campaign.id)}
                    onDelete={() => handleDelete(campaign.id)}
                  />
                );
              })}
            </div>
          )}

          {/* Archived / Concluídas */}
          {archived.length > 0 && (
            <div className="space-y-4">
              <button onClick={() => setShowArchived(v => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-white/35 hover:text-zinc-700 dark:hover:text-white/60 transition-colors group">
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showArchived ? "rotate-180" : ""}`} />
                <CheckCircle2 className="w-4 h-4 text-emerald-500/70" />
                Concluídas ({archived.length})
              </button>

              <AnimatePresence>
                {showArchived && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {archived.map((campaign, index) => {
                        const { progress, total } = getCampaignProgress(campaign.id);
                        return (
                          <CampaignCard key={campaign.id} campaign={campaign} index={index} progress={progress} total={total} isArchived
                            onOpen={() => {}}
                            onArchive={() => handleArchive(campaign.id)}
                            onUnarchive={() => handleUnarchive(campaign.id)}
                            onDelete={() => handleDelete(campaign.id)}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── Clientes ─────────────────────────────────────────────────── */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Clientes</h2>
                  <p className="text-xs text-muted-foreground">
                    {clients.length === 0 ? "Nenhum cliente cadastrado" : `${clients.length} cliente${clients.length !== 1 ? "s" : ""} cadastrado${clients.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setEditingClient(null); setClientModalOpen(true); }}
                className="relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-sky-500/20 shrink-0 group"
                style={{ background: "linear-gradient(135deg, #0284c7, #1d4ed8)" }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <UserPlus className="w-4 h-4 relative" />
                <span className="relative">Cadastrar Cliente</span>
              </motion.button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-sky-500/30 via-sky-500/10 to-transparent" />

            {clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-white/[0.02]">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-sky-400 opacity-70" />
                </div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-white/40">Nenhum cliente ainda</p>
                <p className="text-xs text-muted-foreground mt-1">Cadastre clientes para vincular às suas tarefas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {clients.map((client, index) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    index={index}
                    onEdit={() => openEditClient(client)}
                    onDelete={() => handleDeleteClient(client.id)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
