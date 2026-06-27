"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Sparkles, AlertCircle, AtSign } from "lucide-react";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode]               = useState<"login" | "signup">("login");
  const [name, setName]               = useState("");
  const [username, setUsername]       = useState("");
  const [loginIdentifier, setLoginId] = useState(""); // email OR username for login
  const [email, setEmail]             = useState("");  // email for signup
  const [password, setPassword]       = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "login") {
      const isEmail = loginIdentifier.includes("@");
      let emailToUse = loginIdentifier.trim();

      if (!isEmail) {
        // Look up email by username via RPC
        const { data: foundEmail, error: rpcError } = await supabase.rpc(
          "get_email_by_username",
          { p_username: emailToUse.toLowerCase() }
        );
        if (rpcError || !foundEmail) {
          setError("Usuário ou senha incorretos.");
          setLoading(false);
          return;
        }
        emailToUse = foundEmail as string;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });
      if (authError) {
        setError("E-mail, usuário ou senha incorretos.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      // Signup validations
      if (!name.trim()) {
        setError("Informe seu nome.");
        setLoading(false);
        return;
      }
      if (!USERNAME_REGEX.test(username.toLowerCase())) {
        setError("Usuário deve ter 3–20 caracteres: letras minúsculas, números ou _");
        setLoading(false);
        return;
      }

      // Check username availability
      const { data: available } = await supabase.rpc("check_username_available", {
        p_username: username.toLowerCase(),
      });
      if (!available) {
        setError("Este nome de usuário já está em uso.");
        setLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim(), username: username.toLowerCase() },
        },
      });
      if (authError) {
        setError(
          authError.message.includes("already")
            ? "Este e-mail já está cadastrado."
            : authError.message
        );
        setLoading(false);
        return;
      }
      setSuccess("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      setLoading(false);
    }
  };

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setError(null);
    setSuccess(null);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(109,40,217,0.18) 0%, transparent 60%), #09090b" }}
    >
      {/* Glow orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md px-4 relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/30 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CreatorFlow</h1>
          <p className="text-sm text-white/40 mt-1">Gerencie sua produção de conteúdo</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/[0.09] overflow-hidden shadow-2xl shadow-black/60"
          style={{ background: "rgba(14,13,20,0.90)", backdropFilter: "blur(28px)" }}
        >
          {/* Tabs */}
          <div className="flex border-b border-white/[0.07]">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                  mode === m
                    ? "text-white border-b-2 border-violet-500 bg-white/[0.03]"
                    : "text-white/35 hover:text-white/60"
                }`}
              >
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden space-y-4"
                >
                  {/* Nome */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Nome</Label>
                    <Input
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl border-white/[0.08] bg-white/[0.05] placeholder:text-white/20 text-white"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Usuário</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                      <Input
                        placeholder="seu_usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        maxLength={20}
                        className="rounded-xl border-white/[0.08] bg-white/[0.05] placeholder:text-white/20 text-white pl-9"
                      />
                    </div>
                    <p className="text-[11px] text-white/25">3–20 caracteres. Letras, números e _ apenas.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* E-mail ou usuário (login) / E-mail (signup) */}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                {mode === "login" ? "E-mail ou usuário" : "E-mail"}
              </Label>
              {mode === "login" ? (
                <Input
                  placeholder="voce@exemplo.com ou seu_usuario"
                  value={loginIdentifier}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  autoComplete="username"
                  className="rounded-xl border-white/[0.08] bg-white/[0.05] placeholder:text-white/20 text-white"
                />
              ) : (
                <Input
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="rounded-xl border-white/[0.08] bg-white/[0.05] placeholder:text-white/20 text-white"
                />
              )}
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Senha</Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="rounded-xl border-white/[0.08] bg-white/[0.05] placeholder:text-white/20 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-[11px] text-white/25">Mínimo de 6 caracteres.</p>
              )}
            </div>

            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "login" ? "Entrando..." : "Criando conta..."}
                </>
              ) : (
                mode === "login" ? "Entrar" : "Criar conta"
              )}
            </button>

            {mode === "login" && (
              <p className="text-center text-xs text-white/30">
                Não tem conta?{" "}
                <button type="button" onClick={() => switchMode("signup")} className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  Criar agora
                </button>
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
