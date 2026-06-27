"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, Calendar, CheckCircle2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard",     href: "/dashboard", icon: LayoutDashboard },
  { name: "Campanhas",     href: "/campaigns", icon: Megaphone },
  { name: "Calendário",    href: "/calendar",  icon: Calendar },
  { name: "Concluídos",    href: "/completed", icon: CheckCircle2 },
  { name: "Configurações", href: "/settings",  icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col w-64 h-full border-r relative overflow-hidden",
        "border-zinc-200 dark:border-white/[0.05]",
        "bg-zinc-50 dark:bg-zinc-950",
        className
      )}
    >
      {/* Violet glow — visible on both modes but subtle on light */}
      <div
        className="absolute top-0 left-0 w-full h-40 pointer-events-none opacity-60 dark:opacity-100"
        style={{ background: "radial-gradient(ellipse 80% 60% at 30% 0%, rgba(109,40,217,0.14) 0%, transparent 70%)" }}
      />

      {/* Left edge accent */}
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-violet-500/40 via-violet-500/10 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-7 relative">
        <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="m9 15 2 2 4-4"/>
          </svg>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
          CreatorFlow
        </span>
      </div>

      {/* Label */}
      <div className="px-5 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-white/20">Menu</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden",
                isActive
                  ? "text-violet-600 dark:text-violet-300 bg-violet-500/[0.10] dark:bg-violet-500/[0.12] border border-violet-500/30 dark:border-violet-500/[0.20]"
                  : "text-zinc-500 dark:text-white/45 hover:text-zinc-800 dark:hover:text-white/85 hover:bg-zinc-100 dark:hover:bg-white/[0.05] border border-transparent"
              )}
            >
              {/* Active glow bg */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/[0.08] to-transparent pointer-events-none rounded-xl" />
              )}

              {/* Left accent for active */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-violet-400 to-purple-500 rounded-full" />
              )}

              <item.icon
                className={cn(
                  "w-4 h-4 shrink-0 relative transition-colors",
                  isActive
                    ? "text-violet-500 dark:text-violet-400"
                    : "text-zinc-400 dark:text-white/35 group-hover:text-zinc-600 dark:group-hover:text-white/70"
                )}
              />
              <span className="relative">{item.name}</span>

              {/* Hover shimmer (dark only) */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom status card */}
      <div className="px-4 py-5 mt-auto">
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-100/70 dark:bg-white/[0.03] p-3.5 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-white/50">Sistema online</p>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-white/25 leading-relaxed">Todas as integrações ativas e sincronizadas.</p>
        </div>
      </div>
    </aside>
  );
}
