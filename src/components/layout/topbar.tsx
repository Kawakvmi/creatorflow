"use client";

import { Moon, Sun, Search, Menu, Settings, Lock, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Topbar() {
  const supabase = createClient();
  const router   = useRouter();
  const { theme, setTheme } = useTheme();
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sbUser,    setSbUser]    = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSbUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSbUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = sbUser?.user_metadata?.name || sbUser?.email?.split("@")[0] || "Usuário";
  const initials    = displayName.substring(0, 2).toUpperCase();
  const email       = sbUser?.email ?? "";

  const handleLogout = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [menuOpen]);

  const btnCls = "relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 border-zinc-200 dark:border-white/[0.08] bg-zinc-100/80 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/[0.09] hover:border-zinc-300 dark:hover:border-white/[0.14] text-zinc-500 dark:text-white/50 hover:text-zinc-800 dark:hover:text-white/90";

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-white/[0.07] flex items-center justify-between px-4 sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-2xl">

      {/* Glass top highlight (dark only) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none hidden dark:block" />

      {/* Left — mobile menu + search */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger — shows sidebar sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={<button className={`${btnCls} md:hidden`} />}
          >
            <Menu className="w-4 h-4" />
            <span className="sr-only">Abrir menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <SheetDescription className="sr-only">Acesse as áreas do aplicativo</SheetDescription>
            <Sidebar className="border-none w-full" />
          </SheetContent>
        </Sheet>

        {/* Search trigger (desktop) */}
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          className="hidden md:flex items-center gap-2.5 h-9 px-3.5 w-64 rounded-xl border transition-all duration-200 text-sm border-zinc-200 dark:border-white/[0.07] bg-zinc-100/60 dark:bg-white/[0.03] hover:bg-zinc-200/60 dark:hover:bg-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.12] text-zinc-400 dark:text-white/35 hover:text-zinc-600 dark:hover:text-white/60"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left text-[13px]">Buscar...</span>
          <kbd className="flex items-center gap-0.5 text-[10px] font-mono border border-zinc-300 dark:border-white/[0.10] bg-zinc-200/70 dark:bg-white/[0.04] text-zinc-400 dark:text-white/30 px-1.5 py-0.5 rounded-md">
            <span className="text-xs leading-none">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={btnCls}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-200 dark:bg-white/[0.08] mx-1" />

        {/* Avatar + dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className={`flex items-center gap-2.5 pl-1 pr-3 h-9 rounded-xl border transition-all duration-200 focus:outline-none ${
              menuOpen
                ? "border-zinc-300 dark:border-white/[0.16] bg-zinc-100 dark:bg-white/[0.08]"
                : "border-zinc-200 dark:border-white/[0.07] bg-zinc-50 dark:bg-white/[0.03] hover:bg-zinc-100 dark:hover:bg-white/[0.07] hover:border-zinc-300 dark:hover:border-white/[0.13]"
            }`}
          >
            <div className="relative">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/30">
                <span className="text-[10px] font-bold text-white">{initials}</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-zinc-50 dark:border-zinc-950 shadow-sm" />
            </div>
            <span className="hidden sm:block text-xs font-medium text-zinc-600 dark:text-white/60 max-w-[80px] truncate">
              {displayName.split(" ")[0]}
            </span>
          </button>

          {/* Dropdown panel */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/[0.09] shadow-2xl shadow-black/60 overflow-hidden z-[9999]"
                style={{ background: "rgba(14,13,20,0.94)", backdropFilter: "blur(28px) saturate(150%)" }}
              >
                {/* User header */}
                <div className="relative px-4 py-3.5 border-b border-white/[0.06]">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-3 relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/30 shrink-0">
                      <span className="text-sm font-bold text-white">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white/85 truncate leading-tight">{displayName}</p>
                      <p className="text-[11px] text-white/35 truncate">{email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => { setMenuOpen(false); router.push("/settings"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.07] transition-all text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 group-hover:bg-violet-500/15 group-hover:border-violet-500/25 transition-all">
                      <Settings className="w-3.5 h-3.5 group-hover:text-violet-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-tight">Configurações</p>
                      <p className="text-[10px] text-white/25">Preferências e perfil</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setMenuOpen(false); router.push("/settings"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.07] transition-all text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 group-hover:bg-sky-500/15 group-hover:border-sky-500/25 transition-all">
                      <Lock className="w-3.5 h-3.5 group-hover:text-sky-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-tight">Alterar Senha</p>
                      <p className="text-[10px] text-white/25">Segurança da conta</p>
                    </div>
                  </button>
                </div>

                <div className="p-1.5 pt-0">
                  <div className="h-px bg-white/[0.06] mx-2 mb-1.5" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.09] transition-all text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-500/[0.08] border border-red-500/[0.12] flex items-center justify-center shrink-0 group-hover:bg-red-500/[0.15] group-hover:border-red-500/25 transition-all">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-tight">Sair</p>
                      <p className="text-[10px] text-red-400/40">Encerrar sessão</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
