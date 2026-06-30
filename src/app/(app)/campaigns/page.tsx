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
  Users, UserPlus, Pencil, Building2, ChevronRight,
  Mail, Phone, ExternalLink,
} from "lucide-react";
import { Client } from "@/lib/types";

const AVATAR_GRADIENTS = [
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-sky-600",
  "from-fuchsia-500 to-pink-600",
  "from-indigo-500 to-violet-600",
];

function getAvatarGradient(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}
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
  const [name,      setName]      = useState("");
  const [notes,     setNotes]     = useState("");
  const [email,     setEmail]     = useState("");
  const [whatsapp,  setWhatsapp]  = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (open) {
      setName(editingClient?.name      ?? "");
      setNotes(editingClient?.notes    ?? "");
      setEmail(editingClient?.email    ?? "");
      setWhatsapp(editingClient?.whatsapp  ?? "");
      setDriveLink(editingClient?.driveLink ?? "");
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
    const payload = {
      name:      name.trim(),
      notes:     notes.trim(),
      email:     email.trim()     || undefined,
      whatsapp:  whatsapp.trim()  || undefined,
      driveLink: driveLink.trim() || undefined,
    };
    try {
      if (editingClient) {
        updateClient(editingClient.id, payload);
        await db.updateClient(editingClient.id, payload);
      } else {
        const created = await db.createClient(payload);
        addClient(created);
      }
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full h-10 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/40 transition-all";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/65 backdrop-blur-md" onClick={() => onOpenChange(false)} />
          <motion.div key="modal" initial={{ opacity: 0, scale: 0.9, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-0 z-[81] flex items-center justify-center p-4" style={{ pointerEvents: "none" }}>
            <div className="w-full max-w-md rounded-2xl border border-white/[0.10] bg-zinc-900/95 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden" style={{ pointerEvents: "auto" }} onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="relative px-6 pt-5 pb-4 border-b border-white/[0.06]">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-600/8 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/25">
                      <Building2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">{editingClient ? "Editar Cliente" : "Novo Cliente"}</h2>
                      <p className="text-[11px] text-white/35">Todos os campos, exceto nome, são opcionais</p>
                    </div>
                  </div>
                  <button onClick={() => onOpenChange(false)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/40 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
                {/* Nome */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wider block">Nome do Cliente *</label>
                  <input placeholder="Ex: Empresa XYZ, João Silva..." value={name} onChange={(e) => setName(e.target.value)} required autoFocus className={inputCls} />
                </div>

                {/* Linha Email + WhatsApp */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> Email
                    </label>
                    <input type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> WhatsApp
                    </label>
                    <input type="tel" placeholder="+55 11 99999-9999" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputCls} />
                  </div>
                </div>

                {/* Drive */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" /> Link do Drive
                  </label>
                  <input type="url" placeholder="https://drive.google.com/..." value={driveLink} onChange={(e) => setDriveLink(e.target.value)} className={inputCls} />
                </div>

                {/* Observações */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wider block">Observações</label>
                  <textarea
                    placeholder="Segmento, contexto, anotações..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.06] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/40 resize-none transition-all"
                  />
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => onOpenChange(false)} className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/55 hover:bg-white/[0.08] hover:text-white transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-sm font-semibold text-white hover:from-sky-500 hover:to-blue-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
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

/* ─── Compact Client Card ──────────────────────────────────────────────────── */
function CompactClientCard({ client, index, onClick }: { client: Client; index: number; onClick: () => void }) {
  const initials = getInitials(client.name);
  const gradient = getAvatarGradient(client.name);

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-zinc-200/80 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] hover:bg-zinc-50 dark:hover:bg-white/[0.07] hover:border-zinc-300 dark:hover:border-white/[0.14] transition-all duration-200 text-left cursor-pointer"
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-[11px] shrink-0 shadow-sm`}>
        {initials || <Building2 className="w-3.5 h-3.5" />}
      </div>
      {/* Name */}
      <span className="flex-1 text-sm font-medium text-zinc-700 dark:text-white/70 group-hover:text-zinc-900 dark:group-hover:text-white/90 truncate transition-colors leading-none">
        {client.name}
      </span>
      {/* Arrow */}
      <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-white/15 group-hover:text-zinc-400 dark:group-hover:text-white/40 transition-colors shrink-0" />
    </motion.button>
  );
}

/* ─── Client Detail Modal ──────────────────────────────────────────────────── */
function ClientDetailModal({
  client, open, onClose, onEdit, onDelete,
}: {
  client: Client | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) { setConfirmDelete(false); return; }
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!client) return null;

  const initials = getInitials(client.name);
  const gradient = getAvatarGradient(client.name);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[71] flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-white/[0.09] overflow-hidden"
              style={{
                pointerEvents: "auto",
                background: "rgba(14,13,20,0.97)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-5 border-b border-white/[0.06]">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] flex items-center justify-center text-white/40 hover:text-white transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg`}>
                    {initials || <Building2 className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h2 className="text-base font-semibold text-white leading-tight truncate">{client.name}</h2>
                    <p className="text-[11px] text-white/35 mt-0.5">Cliente</p>
                  </div>
                </div>
              </div>

              {/* Contact info — always show all fields */}
              <div className="px-6 py-4 space-y-2">

                {/* Email */}
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/[0.14] transition-all group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider leading-none mb-0.5">Email</p>
                      <p className="text-sm text-white/70 group-hover:text-white/95 truncate transition-colors leading-tight">{client.email}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/50 shrink-0 transition-colors" />
                  </a>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5 text-white/15" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider leading-none mb-0.5">Email</p>
                      <p className="text-sm text-white/20 leading-tight">—</p>
                    </div>
                  </div>
                )}

                {/* WhatsApp — logo original verde */}
                {client.whatsapp ? (
                  <a
                    href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/[0.14] transition-all group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: "#25D366" }}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider leading-none mb-0.5">WhatsApp</p>
                      <p className="text-sm text-white/70 group-hover:text-white/95 truncate transition-colors leading-tight">{client.whatsapp}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/50 shrink-0 transition-colors" />
                  </a>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center opacity-20" style={{ background: "#25D366" }}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider leading-none mb-0.5">WhatsApp</p>
                      <p className="text-sm text-white/20 leading-tight">—</p>
                    </div>
                  </div>
                )}

                {/* Drive */}
                {client.driveLink ? (
                  <a
                    href={client.driveLink}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/[0.14] transition-all group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider leading-none mb-0.5">Link do Drive</p>
                      <p className="text-sm text-white/70 group-hover:text-white/95 truncate transition-colors leading-tight">Google Drive</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/50 shrink-0 transition-colors" />
                  </a>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0">
                      <ExternalLink className="w-3.5 h-3.5 text-white/15" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider leading-none mb-0.5">Link do Drive</p>
                      <p className="text-sm text-white/20 leading-tight">—</p>
                    </div>
                  </div>
                )}

                {/* Observações */}
                <div className="pt-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-1.5 px-1">Observações</p>
                  {client.notes ? (
                    <p className="text-sm text-white/50 leading-relaxed whitespace-pre-wrap px-1">{client.notes}</p>
                  ) : (
                    <p className="text-sm text-white/20 px-1">—</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-5 space-y-2">
                <AnimatePresence mode="wait">
                  {!confirmDelete ? (
                    <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
                      <button
                        onClick={onEdit}
                        className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.09] bg-white/[0.05] hover:bg-white/[0.10] text-xs font-medium text-white/60 hover:text-white/90 transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] hover:bg-red-500/[0.14] text-xs font-medium text-red-400/70 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rounded-xl border border-red-500/20 bg-red-500/[0.07] p-3.5 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Excluir permanentemente?
                      </div>
                      <p className="text-[11px] text-white/30 leading-relaxed">Os cards vinculados a este cliente perderão o vínculo.</p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(false)}
                          className="flex-1 h-8 rounded-lg border border-white/[0.09] text-[11px] text-white/45 hover:text-white hover:bg-white/[0.06] transition-all">Cancelar</button>
                        <button onClick={() => { onDelete(); onClose(); }}
                          className="flex-1 h-8 rounded-lg bg-red-500/20 border border-red-500/30 text-[11px] font-semibold text-red-400 hover:bg-red-500/30 transition-all">Excluir</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
  const [detailClient,    setDetailClient]    = useState<Client | null>(null);
  const [detailOpen,      setDetailOpen]      = useState(false);

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
    setDetailOpen(false);
    setDetailClient(null);
    setEditingClient(client);
    setClientModalOpen(true);
  };

  const closeClientModal = () => {
    setClientModalOpen(false);
    setEditingClient(null);
  };

  const openDetail = (client: Client) => {
    setDetailClient(client);
    setDetailOpen(true);
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
      <ClientDetailModal
        client={detailClient}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailClient(null); }}
        onEdit={() => { if (detailClient) openEditClient(detailClient); }}
        onDelete={() => { if (detailClient) handleDeleteClient(detailClient.id); }}
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
          <div className="space-y-4 pt-2">
            {/* Section header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-zinc-400 dark:text-white/30 shrink-0" />
                <h2 className="text-sm font-semibold text-zinc-500 dark:text-white/40 uppercase tracking-wider">
                  Clientes
                </h2>
                {clients.length > 0 && (
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-white/[0.07] text-zinc-400 dark:text-white/30">
                    {clients.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => { setEditingClient(null); setClientModalOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] hover:bg-zinc-50 dark:hover:bg-white/[0.08] text-xs font-medium text-zinc-500 dark:text-white/45 hover:text-zinc-700 dark:hover:text-white/70 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Cadastrar cliente
              </button>
            </div>

            {/* Thin divider */}
            <div className="h-px bg-zinc-100 dark:bg-white/[0.05]" />

            {clients.length === 0 ? (
              <div className="flex items-center gap-3 py-8 justify-center text-center">
                <p className="text-sm text-zinc-400 dark:text-white/25">
                  Nenhum cliente cadastrado.{" "}
                  <button onClick={() => { setEditingClient(null); setClientModalOpen(true); }} className="text-sky-500 dark:text-sky-400 hover:underline underline-offset-2 transition-all">
                    Cadastrar agora
                  </button>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {clients.map((client, index) => (
                  <CompactClientCard
                    key={client.id}
                    client={client}
                    index={index}
                    onClick={() => openDetail(client)}
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
