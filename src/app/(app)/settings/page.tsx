"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Palette, Lock, LogOut, Sun, Moon, Monitor,
  Check, AlertCircle, Eye, EyeOff, Pencil, X, ShieldAlert, AtSign, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Feedback banner ────────────────────────────────────────────────────── */
function Feedback({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${
        type === "success"
          ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
          : "bg-red-500/10 border border-red-500/25 text-red-400"
      }`}
    >
      {type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {message}
    </motion.div>
  );
}

/* ─── Section card ───────────────────────────────────────────────────────── */
function Section({ icon: Icon, title, subtitle, children }: {
  icon: React.ElementType; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] dark:border-white/[0.08] border-zinc-200 bg-white dark:bg-white/[0.04] backdrop-blur-xl shadow-lg shadow-black/10 overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.06] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25 shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white/90">{title}</h2>
          <p className="text-xs text-zinc-500 dark:text-white/35">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

type UsernameState = "idle" | "checking" | "available" | "taken" | "invalid";

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const supabase  = createClient();
  const { theme, setTheme } = useTheme();
  const campaigns = useCreatorStore((s) => s.campaigns);
  const cards     = useCreatorStore((s) => s.cards);

  /* user state */
  const [userId,   setUserId]   = useState("");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [username, setUsername] = useState("");
  const [initials, setInitials] = useState("CF");

  /* profile editing */
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName,     setEditName]     = useState("");
  const [editEmail,    setEditEmail]    = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [usernameState, setUsernameState] = useState<UsernameState>("idle");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  /* password */
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew,     setShowNew]     = useState(false);
  const [showConf,    setShowConf]    = useState(false);
  const [savingPass,  setSavingPass]  = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  /* logout */
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const n = (user.user_metadata?.name as string) || user.email?.split("@")[0] || "Usuário";
      const e = user.email || "";
      setUserId(user.id);
      setName(n);
      setEmail(e);
      setInitials(n.substring(0, 2).toUpperCase());
      setEditName(n);
      setEditEmail(e);

      /* load username from profiles table */
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile?.username) {
        setUsername(profile.username);
        setEditUsername(profile.username);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Username availability check (on blur) ─── */
  const handleUsernameBlur = async () => {
    const v = editUsername.trim().toLowerCase();
    if (!v || v === username) { setUsernameState("idle"); return; }
    if (!/^[a-z0-9_]{3,20}$/.test(v)) { setUsernameState("invalid"); return; }
    setUsernameState("checking");
    const { data } = await supabase.rpc("check_username_available", { p_username: v });
    setUsernameState(data ? "available" : "taken");
  };

  /* ─── Save profile ─── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const newUsername = editUsername.trim().toLowerCase();
    const usernameChanged = newUsername !== username;

    /* block save if username invalid/taken */
    if (usernameChanged) {
      if (usernameState === "taken") {
        setProfileFeedback({ type: "error", msg: "Este @username já está em uso. Escolha outro." });
        return;
      }
      if (usernameState === "invalid" || (newUsername && !/^[a-z0-9_]{3,20}$/.test(newUsername))) {
        setProfileFeedback({ type: "error", msg: "Username inválido: use 3–20 caracteres (letras, números, _)." });
        return;
      }
    }

    setSavingProfile(true);
    setProfileFeedback(null);

    try {
      /* update auth metadata (name, email) */
      const authUpdates: { data?: { name: string }; email?: string } = { data: { name: editName.trim() } };
      if (editEmail.trim() && editEmail.trim() !== email) authUpdates.email = editEmail.trim();
      const { error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) throw authError;

      /* update profiles table (username) */
      if (usernameChanged && newUsername) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ username: newUsername })
          .eq("id", userId);
        if (profileError) throw profileError;
        setUsername(newUsername);
        setEditUsername(newUsername);
      }

      setName(editName.trim());
      setEmail(editEmail.trim() || email);
      setInitials(editName.trim().substring(0, 2).toUpperCase());
      setUsernameState("idle");
      setEditingProfile(false);
      setProfileFeedback({
        type: "success",
        msg: authUpdates.email
          ? "Perfil atualizado! Confirme o novo e-mail na sua caixa de entrada."
          : "Perfil atualizado com sucesso.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar perfil.";
      setProfileFeedback({ type: "error", msg });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileFeedback(null), 5000);
    }
  };

  /* ─── Save password ─── */
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassFeedback(null);
    if (newPass.length < 6) { setPassFeedback({ type: "error", msg: "A senha deve ter pelo menos 6 caracteres." }); return; }
    if (newPass !== confirmPass) { setPassFeedback({ type: "error", msg: "As senhas não coincidem." }); return; }
    setSavingPass(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      setNewPass(""); setConfirmPass("");
      setPassFeedback({ type: "success", msg: "Senha alterada com sucesso." });
    } catch (err: unknown) {
      setPassFeedback({ type: "error", msg: err instanceof Error ? err.message : "Erro ao alterar senha." });
    } finally {
      setSavingPass(false);
      setTimeout(() => setPassFeedback(null), 5000);
    }
  };

  const handleLogout = async () => { setLoggingOut(true); await supabase.auth.signOut(); };

  const themeOptions = [
    { key: "light",  label: "Claro",   icon: Sun },
    { key: "dark",   label: "Escuro",  icon: Moon },
    { key: "system", label: "Sistema", icon: Monitor },
  ] as const;

  /* username status helper */
  const usernameHint = () => {
    if (usernameState === "checking") return { color: "text-white/40", text: "Verificando..." };
    if (usernameState === "available") return { color: "text-emerald-400", text: "Username disponível" };
    if (usernameState === "taken")   return { color: "text-red-400",     text: "Username já está em uso" };
    if (usernameState === "invalid") return { color: "text-amber-400",   text: "3–20 caracteres: letras minúsculas, números e _" };
    return null;
  };
  const hint = usernameHint();

  return (
    <div
      className="min-h-full"
      style={{ background: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(109,40,217,0.10) 0%, transparent 60%)` }}
    >
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie seu perfil, senha e preferências.</p>
        </motion.div>

        {/* ── Perfil ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Section icon={User} title="Perfil" subtitle="Seu nome, @username e endereço de e-mail">
            <div className="space-y-5">

              {/* Avatar + info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-white/90 truncate">{name}</p>

                  {/* username badge */}
                  {username ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <AtSign className="w-3 h-3 text-violet-400 shrink-0" />
                      <span className="text-sm font-medium text-violet-400">{username}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <AtSign className="w-3 h-3 text-white/25 shrink-0" />
                      <span className="text-xs text-white/30 italic">username não definido</span>
                    </div>
                  )}

                  <p className="text-xs text-zinc-500 dark:text-white/35 truncate mt-0.5">{email}</p>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-500 dark:text-violet-400 font-medium">
                      {campaigns.filter(c => !c.archived).length} campanhas
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.10] text-zinc-500 dark:text-white/40 font-medium">
                      {cards.length} cards
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {profileFeedback && <Feedback type={profileFeedback.type} message={profileFeedback.msg} />}
              </AnimatePresence>

              {/* Form / View toggle */}
              <AnimatePresence mode="wait">
                {!editingProfile ? (
                  <motion.button
                    key="edit-btn"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => { setEditName(name); setEditEmail(email); setEditUsername(username); setUsernameState("idle"); setEditingProfile(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/[0.10] bg-zinc-50 dark:bg-white/[0.04] text-sm font-medium text-zinc-700 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-white transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar perfil
                  </motion.button>
                ) : (
                  <motion.form
                    key="edit-form"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    onSubmit={handleSaveProfile}
                    className="space-y-4"
                  >
                    {/* Nome */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-zinc-500 dark:text-white/50 uppercase tracking-wider">Nome</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Seu nome"
                        required
                        className="rounded-xl dark:border-white/[0.10] dark:bg-white/[0.05] dark:placeholder:text-white/25 dark:focus:border-violet-500/50"
                      />
                    </div>

                    {/* Username */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-zinc-500 dark:text-white/50 uppercase tracking-wider">
                        Username
                        <span className="ml-1.5 normal-case tracking-normal font-normal text-zinc-400 dark:text-white/25">(usado no login)</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-violet-400 pointer-events-none">
                          <AtSign className="w-4 h-4" />
                        </div>
                        <Input
                          value={editUsername}
                          onChange={(e) => {
                            const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                            setEditUsername(v);
                            setUsernameState("idle");
                          }}
                          onBlur={handleUsernameBlur}
                          placeholder="seuusername"
                          maxLength={20}
                          className="rounded-xl pl-8 pr-10 dark:border-white/[0.10] dark:bg-white/[0.05] dark:placeholder:text-white/25 dark:focus:border-violet-500/50"
                          style={
                            usernameState === "available" ? { borderColor: "rgba(52,211,153,0.4)" } :
                            usernameState === "taken"     ? { borderColor: "rgba(248,113,113,0.4)" } :
                            undefined
                          }
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {usernameState === "checking"  && <Loader2 className="w-4 h-4 text-white/30 animate-spin" />}
                          {usernameState === "available" && <Check className="w-4 h-4 text-emerald-400" />}
                          {usernameState === "taken"     && <X className="w-4 h-4 text-red-400" />}
                        </div>
                      </div>
                      <AnimatePresence>
                        {hint && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`text-[11px] ${hint.color}`}
                          >
                            {hint.text}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* E-mail */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-zinc-500 dark:text-white/50 uppercase tracking-wider">
                        E-mail
                        <span className="ml-1.5 normal-case tracking-normal font-normal text-zinc-400 dark:text-white/25">(requer confirmação)</span>
                      </Label>
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="rounded-xl dark:border-white/[0.10] dark:bg-white/[0.05] dark:placeholder:text-white/25 dark:focus:border-violet-500/50"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setEditingProfile(false); setUsernameState("idle"); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/[0.10] bg-zinc-50 dark:bg-white/[0.04] text-sm text-zinc-600 dark:text-white/50 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-all"
                      >
                        <X className="w-3.5 h-3.5" /> Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile || usernameState === "checking" || usernameState === "taken"}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 transition-all"
                      >
                        {savingProfile
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Check className="w-4 h-4" />}
                        Salvar
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Section>
        </motion.div>

        {/* ── Senha ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}>
          <Section icon={Lock} title="Alterar Senha" subtitle="Defina uma nova senha para sua conta">
            <form onSubmit={handleSavePassword} className="space-y-4">
              <AnimatePresence>
                {passFeedback && <Feedback type={passFeedback.type} message={passFeedback.msg} />}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500 dark:text-white/50 uppercase tracking-wider">Nova Senha</Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="rounded-xl pr-10 dark:border-white/[0.10] dark:bg-white/[0.05] dark:placeholder:text-white/25 dark:focus:border-violet-500/50"
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/30 hover:text-zinc-700 dark:hover:text-white/70 transition-colors">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500 dark:text-white/50 uppercase tracking-wider">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    type={showConf ? "text" : "password"}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="rounded-xl pr-10 dark:border-white/[0.10] dark:bg-white/[0.05] dark:placeholder:text-white/25 dark:focus:border-violet-500/50"
                  />
                  <button type="button" onClick={() => setShowConf(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/30 hover:text-zinc-700 dark:hover:text-white/70 transition-colors">
                    {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPass.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div key={lvl} className={`h-1 flex-1 rounded-full transition-all ${
                        newPass.length >= lvl * 3
                          ? lvl <= 2 ? "bg-red-400" : lvl === 3 ? "bg-amber-400" : "bg-emerald-400"
                          : "bg-zinc-200 dark:bg-white/[0.08]"
                      }`} />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={savingPass || !newPass || !confirmPass}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 transition-all"
              >
                {savingPass
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Lock className="w-4 h-4" />}
                Alterar Senha
              </button>
            </form>
          </Section>
        </motion.div>

        {/* ── Aparência ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section icon={Palette} title="Aparência" subtitle="Escolha o tema visual da aplicação">
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                    theme === key
                      ? "border-violet-500/60 bg-violet-500/[0.08]"
                      : "border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.16] hover:bg-zinc-50 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  {theme === key && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <Icon className={`w-5 h-5 ${theme === key ? "text-violet-500 dark:text-violet-400" : "text-zinc-500 dark:text-white/40"}`} />
                  <span className={`text-xs font-semibold ${theme === key ? "text-violet-600 dark:text-violet-400" : "text-zinc-600 dark:text-white/50"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        </motion.div>

        {/* ── Zona de perigo ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] backdrop-blur-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-red-500/15 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shrink-0">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-red-500 dark:text-red-400">Zona de Perigo</h2>
                <p className="text-xs text-red-400/60 dark:text-red-400/50">Ações irreversíveis da conta</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-red-500/15 bg-white dark:bg-transparent">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white/80">Sair da conta</p>
                  <p className="text-xs text-zinc-500 dark:text-white/35 mt-0.5">Você será redirecionado para a tela de login.</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/[0.08] text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-500/[0.15] disabled:opacity-60 transition-all shrink-0"
                >
                  {loggingOut
                    ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    : <LogOut className="w-4 h-4" />}
                  Sair
                </button>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
