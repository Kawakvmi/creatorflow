"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import { ChecklistItem, ContentType, Stage } from "@/lib/types";
import * as db from "@/lib/supabase/db";
import { Plus, X, GripVertical } from "lucide-react";

const checklistTemplates: Record<ContentType, string[]> = {
  video:        ["Roteiro escrito", "Narração gravada", "Trilha sonora", "Thumbnail/arte", "Edição finalizada", "Revisão de qualidade", "Legendas", "Upload feito"],
  presentation: ["Estrutura definida", "Conteúdo escrito", "Design dos slides", "Dados revisados", "Narração (se houver)", "Exportação final"],
  game:         ["Conceito/GDD", "Assets visuais", "Protótipo/programação", "Testes", "Trailer/demo", "Publicado"],
  layout:       ["Brief de layout", "Wireframe", "Mockup desktop", "Mockup mobile", "Revisão de cores", "Tipografia definida", "Assets exportados", "Aprovação final"],
  site:         ["Planejamento de páginas", "Wireframe", "Design desktop", "Design mobile", "Desenvolvimento", "Conteúdo inserido", "Testes", "Publicação"],
  identity:     ["Pesquisa de referências", "Moodboard", "Conceito do logo", "Variações do logo", "Paleta de cores", "Tipografia", "Aplicações", "Manual da marca"],
};

function buildChecklist(items: string[]): ChecklistItem[] {
  return items.filter(l => l.trim()).map((label, i) => ({
    id: `new-${i}-${crypto.randomUUID()}`, label, done: false,
  }));
}

interface NewCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  initialStage: Stage;
}

export function NewCardDialog({ open, onOpenChange, campaignId, initialStage }: NewCardDialogProps) {
  const addCard = useCreatorStore((s) => s.addCard);

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<ContentType>("video");
  const [priority,    setPriority]    = useState<"low" | "medium" | "high">("medium");
  const [dueDate,     setDueDate]     = useState("");

  /* checklist editing */
  const [checklistItems, setChecklistItems] = useState<string[]>(checklistTemplates["video"]);
  const [editingChecklist, setEditingChecklist] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState("");

  const handleTypeChange = (type: ContentType) => {
    setContentType(type);
    setChecklistItems(checklistTemplates[type]);
    setEditingChecklist(false);
  };

  const addChecklistItem = () => {
    if (!newItemLabel.trim()) return;
    setChecklistItems(prev => [...prev, newItemLabel.trim()]);
    setNewItemLabel("");
  };

  const removeChecklistItem = (i: number) => {
    setChecklistItems(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateChecklistItem = (i: number, val: string) => {
    setChecklistItems(prev => prev.map((item, idx) => idx === i ? val : item));
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setContentType("video");
    setPriority("medium"); setDueDate("");
    setChecklistItems(checklistTemplates["video"]);
    setEditingChecklist(false); setNewItemLabel("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const created = await db.createCard({
        campaignId,
        title: title.trim(),
        description: description.trim(),
        contentType,
        stage: initialStage,
        priority,
        approvalStatus: "pending",
        dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
        checklist: buildChecklist(checklistItems),
        guidebook: [],
      });
      addCard(created);
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error("Erro ao criar card:", err);
    }
  };

  const selectCls = "w-full h-9 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-sm text-white/80 transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/40";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white/90">Novo Card</DialogTitle>
            <DialogDescription className="text-white/40">Adicione uma nova tarefa de conteúdo.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Título */}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Título</Label>
              <Input
                placeholder="Ex: Episódio 3: Edição Avançada"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="rounded-xl border-white/[0.08] bg-white/[0.05] placeholder:text-white/20"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                Descrição <span className="text-white/25 normal-case tracking-normal font-normal">(opcional)</span>
              </Label>
              <Textarea
                placeholder="Contexto, referências, objetivo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="rounded-xl border-white/[0.08] bg-white/[0.05] placeholder:text-white/20 resize-none"
              />
            </div>

            {/* Tipo + Prioridade */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Tipo</Label>
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
                <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Prioridade</Label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")} className={selectCls}>
                  <option value="low"    style={{ background: "#18181b" }}>🟢 Baixa</option>
                  <option value="medium" style={{ background: "#18181b" }}>🟡 Média</option>
                  <option value="high"   style={{ background: "#18181b" }}>🔴 Alta</option>
                </select>
              </div>
            </div>

            {/* Data de entrega */}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Data de Entrega</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl border-white/[0.08] bg-white/[0.05]"
              />
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                  Checklist <span className="text-white/25 normal-case tracking-normal font-normal">({checklistItems.length} itens)</span>
                </Label>
                <button
                  type="button"
                  onClick={() => setEditingChecklist(v => !v)}
                  className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
                >
                  {editingChecklist ? "Fechar edição" : "Editar checklist"}
                </button>
              </div>

              {editingChecklist ? (
                /* Editable mode */
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 space-y-2">
                  {checklistItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <GripVertical className="w-3.5 h-3.5 text-white/20 shrink-0" />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateChecklistItem(i, e.target.value)}
                        className="flex-1 text-xs bg-white/[0.05] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-white/75 placeholder:text-white/25 focus:outline-none focus:border-violet-500/40"
                      />
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(i)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* Add item */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-3.5 shrink-0" />
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
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white/40 hover:text-violet-400 hover:bg-violet-500/10 transition-all shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Preview mode */
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <div className="grid grid-cols-2 gap-1.5">
                    {checklistItems.slice(0, 6).map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-white/40">
                        <div className="w-3 h-3 rounded border border-white/20 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                    {checklistItems.length > 6 && (
                      <div className="text-[11px] text-white/25 col-span-2 mt-0.5">
                        +{checklistItems.length - 6} mais itens...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2 border-t border-white/[0.06] -mx-4 px-4 pb-1">
            <button
              type="button"
              onClick={() => { onOpenChange(false); resetForm(); }}
              className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-white/55 hover:bg-white/[0.08] hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Criar Card
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
