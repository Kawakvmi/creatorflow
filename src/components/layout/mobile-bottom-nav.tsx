"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, Calendar, CheckCircle2, Settings } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campanhas", href: "/campaigns", icon: Megaphone },
  { name: "Calendário", href: "/calendar",  icon: Calendar },
  { name: "Concluídos", href: "/completed", icon: CheckCircle2 },
  { name: "Config",     href: "/settings",  icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] dark:border-white/[0.08] border-zinc-200"
      style={{
        background: "rgba(9,9,11,0.96)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around px-1 pt-2 pb-3">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-1 px-5 py-1.5 rounded-2xl transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 rounded-2xl bg-violet-500/[0.12] border border-violet-500/[0.18]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative transition-colors ${
                  isActive ? "text-violet-400" : "text-white/35"
                }`}
              />
              <span
                className={`text-[10px] font-semibold relative transition-colors ${
                  isActive ? "text-violet-400" : "text-white/30"
                }`}
              >
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
