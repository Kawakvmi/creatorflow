"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Kanban, Calendar, BarChart3, Palette, Zap, Shield,
  ArrowRight, CheckCircle2,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Animated SVG vectors — ícones leves de criação de conteúdo
───────────────────────────────────────────────────────── */
function FloatingVectors() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>

      {/* Clapperboard — topo direito */}
      <motion.div
        className="absolute top-[8%] right-[8%] opacity-[0.12]"
        animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
          <rect x="4" y="20" width="56" height="38" rx="4" fill="white" />
          <rect x="4" y="10" width="56" height="14" rx="3" fill="white" fillOpacity=".7" />
          {/* stripes */}
          <rect x="12" y="10" width="6" height="14" rx="1" fill="#7c3aed" fillOpacity=".8" />
          <rect x="24" y="10" width="6" height="14" rx="1" fill="#7c3aed" fillOpacity=".8" />
          <rect x="36" y="10" width="6" height="14" rx="1" fill="#7c3aed" fillOpacity=".8" />
          <rect x="48" y="10" width="6" height="14" rx="1" fill="#7c3aed" fillOpacity=".8" />
          {/* clap arm */}
          <rect x="4" y="6" width="56" height="7" rx="2" fill="white" fillOpacity=".5" />
          {/* play symbol inside */}
          <polygon points="22,30 22,48 44,39" fill="white" fillOpacity=".3" />
        </svg>
      </motion.div>

      {/* Waveform — centro esquerdo */}
      <motion.div
        className="absolute top-[45%] left-[3%] opacity-[0.10]"
        animate={{ scaleY: [1, 1.15, 0.9, 1], x: [0, 4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="80" height="44" viewBox="0 0 80 44" fill="none">
          {[4, 12, 20, 28, 36, 44, 52, 60, 68, 76].map((x, i) => {
            const heights = [10, 22, 36, 44, 28, 40, 18, 34, 14, 8];
            const h = heights[i];
            return <rect key={x} x={x - 2} y={(44 - h) / 2} width="4" height={h} rx="2" fill="white" />;
          })}
        </svg>
      </motion.div>

      {/* Pen tool (Illustrator) — baixo direito */}
      <motion.div
        className="absolute bottom-[18%] right-[12%] opacity-[0.11]"
        animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          {/* Pen body */}
          <path d="M28 4 L44 28 L28 36 L12 28 Z" fill="white" fillOpacity=".6" />
          {/* Nib */}
          <path d="M28 36 L22 50 L28 44 L34 50 Z" fill="white" fillOpacity=".4" />
          {/* Handle dots */}
          <circle cx="28" cy="4" r="3" fill="#a78bfa" />
          <circle cx="44" cy="28" r="3" fill="#a78bfa" />
          <circle cx="12" cy="28" r="3" fill="#a78bfa" />
        </svg>
      </motion.div>

      {/* Film strip — topo esquerdo */}
      <motion.div
        className="absolute top-[12%] left-[5%] opacity-[0.09]"
        animate={{ x: [0, 6, 0], y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
        <svg width="90" height="40" viewBox="0 0 90 40" fill="none">
          <rect x="0" y="0" width="90" height="40" rx="4" fill="white" fillOpacity=".15" />
          {/* sprockets */}
          {[8, 22, 36, 50, 64, 78].map((x) => (
            <g key={x}>
              <rect x={x - 4} y="2" width="8" height="7" rx="1.5" fill="white" fillOpacity=".5" />
              <rect x={x - 4} y="31" width="8" height="7" rx="1.5" fill="white" fillOpacity=".5" />
            </g>
          ))}
          {/* frames */}
          {[8, 36, 64].map((x) => (
            <rect key={x} x={x - 4} y="11" width="20" height="18" rx="2" fill="white" fillOpacity=".25" />
          ))}
        </svg>
      </motion.div>

      {/* Bezier path — fundo, centro-alto */}
      <motion.div
        className="absolute top-[25%] left-[40%] opacity-[0.07]"
        animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      >
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
          <path d="M10 70 C30 10, 90 10, 110 70" stroke="white" strokeWidth="2.5" strokeDasharray="6 4" fill="none" />
          <circle cx="10" cy="70" r="5" fill="white" fillOpacity=".6" />
          <circle cx="110" cy="70" r="5" fill="white" fillOpacity=".6" />
          <circle cx="35" cy="15" r="3.5" fill="#a78bfa" fillOpacity=".8" />
          <circle cx="85" cy="15" r="3.5" fill="#a78bfa" fillOpacity=".8" />
          <line x1="10" y1="70" x2="35" y2="15" stroke="white" strokeWidth="1" strokeOpacity=".3" />
          <line x1="110" y1="70" x2="85" y2="15" stroke="white" strokeWidth="1" strokeOpacity=".3" />
        </svg>
      </motion.div>

      {/* Play button — baixo esquerdo */}
      <motion.div
        className="absolute bottom-[22%] left-[10%] opacity-[0.08]"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="24" stroke="white" strokeWidth="2.5" />
          <polygon points="20,14 20,38 40,26" fill="white" fillOpacity=".5" />
        </svg>
      </motion.div>

      {/* Color palette circles — topo centro */}
      <motion.div
        className="absolute top-[6%] left-[42%] opacity-[0.08]"
        animate={{ rotate: [0, 10, -5, 0], y: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="20" r="10" fill="#c084fc" />
          <circle cx="18" cy="38" r="10" fill="#38bdf8" />
          <circle cx="42" cy="38" r="10" fill="#34d399" />
          <circle cx="30" cy="30" r="7" fill="white" fillOpacity=".2" />
        </svg>
      </motion.div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   UpBottom fill button — fill sobe de baixo no hover
───────────────────────────────────────────────────────── */
function FillButton({
  children,
  href,
  variant = "primary",
  external = false,
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "outline";
  external?: boolean;
}) {
  const inner = (
    <motion.div
      whileHover="hover"
      initial="rest"
      className={`relative overflow-hidden rounded-2xl inline-flex cursor-pointer font-semibold text-base px-8 py-4 transition-shadow duration-300 ${
        variant === "primary"
          ? "bg-violet-600 text-white shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50"
          : "border-2 border-white/25 text-white/90"
      }`}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl bg-white"
        variants={{ rest: { y: "101%" }, hover: { y: "0%" } }}
        transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      <motion.span
        className="relative z-10 flex items-center gap-2.5"
        variants={{ rest: { color: "#ffffff" }, hover: { color: "#7c3aed" } }}
        transition={{ duration: 0.25, delay: 0.1 }}
      >
        {children}
      </motion.span>
    </motion.div>
  );

  if (external) return <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>;
  return <Link href={href}>{inner}</Link>;
}

/* ─────────────────────────────────────────────────────────
   Dados
───────────────────────────────────────────────────────── */
const features = [
  { icon: Kanban,    title: "Quadro Kanban",            description: "Drag-and-drop entre 6 estágios de produção com animações fluidas.", color: "from-violet-500 to-purple-600",    shadow: "shadow-violet-500/20" },
  { icon: Calendar,  title: "Calendário Editorial",     description: "Visualize entregas do mês em uma grade interativa com cards clicáveis.", color: "from-sky-400 to-blue-600",      shadow: "shadow-sky-500/20" },
  { icon: BarChart3, title: "Dashboard Analítico",      description: "KPIs, gráfico donut e progresso das campanhas em tempo real.", color: "from-emerald-400 to-teal-600",   shadow: "shadow-emerald-500/20" },
  { icon: Palette,   title: "Campanhas Personalizadas", description: "Projetos com cores, ícones e identidade visual customizada.", color: "from-pink-500 to-rose-600",      shadow: "shadow-pink-500/20" },
  { icon: Zap,       title: "Command Palette",          description: "Navegue instantaneamente com Cmd+K. Busca de cards e campanhas.", color: "from-amber-400 to-orange-600",  shadow: "shadow-amber-500/20" },
  { icon: Shield,    title: "100% Client-Side",         description: "Zero backend. Dados persistidos via Zustand + IndexedDB.", color: "from-indigo-400 to-violet-600",  shadow: "shadow-indigo-500/20" },
];

const techStack = [
  "Next.js 14", "TypeScript", "Tailwind CSS", "shadcn/ui",
  "Zustand", "Recharts", "Framer Motion", "@hello-pangea/dnd", "date-fns",
];

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      {/*
        Performance: radial-gradient no background CSS puro
        é muito mais rápido que divs com filter: blur().
        Mesmo resultado visual, sem custo de GPU.
      */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 80% at -10% -10%, rgba(124,58,237,0.55) 0%, transparent 65%),
            radial-gradient(ellipse 70% 70% at 110% 115%, rgba(6,182,212,0.38) 0%, transparent 65%),
            radial-gradient(ellipse 45% 55% at 108% -5%,  rgba(192,38,211,0.28) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50%  50%,  rgba(99,102,241,0.10) 0%, transparent 55%),
            #070510
          `,
        }}
      >
        <FloatingVectors />

        {/* Linha de brilho horizontal */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent pointer-events-none" />

        {/* Badge */}
        <div className="relative z-10 mb-8 inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 bg-white/5 backdrop-blur-sm text-sm text-white/70">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Projeto de Portfólio — 100% Open Source
        </div>

        {/* Headline */}
        <h1 className="relative z-10 text-6xl md:text-8xl font-extrabold tracking-tighter text-center text-white leading-none mb-6 px-4">
          Creator
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Flow
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="relative z-10 text-lg md:text-xl text-white/55 max-w-xl text-center leading-relaxed mb-12 px-6">
          Sistema de gestão de produção para criadores de conteúdo.
          Vídeos, apresentações e games com fluxo visual profissional.
        </p>

        {/* CTAs */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
          <FillButton href="/login" variant="primary">
            Criar Conta Grátis
            <ArrowRight className="w-5 h-5" />
          </FillButton>
          <FillButton href="https://github.com" variant="outline" external>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            Ver no GitHub
          </FillButton>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/25 text-xs">
          <span>Role para ver mais</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </div>
      </section>

      {/* ── PROBLEMA → SOLUÇÃO ──────────────────────────── */}
      <section className="relative bg-gradient-to-b from-[#070510] to-zinc-950 py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-violet-400 mb-4 border border-violet-500/30 rounded-full px-4 py-1">
              O Problema
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Criadores perdem o controle
              <br />
              <span className="text-white/35">do próprio fluxo de produção.</span>
            </h2>
            <p className="text-white/45 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
              Planilhas espalhadas, prazos esquecidos, revisões perdidas no e-mail.
              O CreatorFlow centraliza tudo em um único lugar visual e intuitivo.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-500/40" />
              <span className="text-violet-400 text-sm font-semibold px-4">A solução</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-500/40" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section className="bg-zinc-950 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Tudo que um criador precisa
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Desenvolvido com as melhores práticas de UX/UI e as tecnologias mais modernas do React.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group p-6 rounded-2xl border border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.06] transition-all duration-300 cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg ${feature.shadow}`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white text-base mb-2">{feature.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ──────────────────────────────────── */}
      <section className="bg-zinc-950 border-t border-white/5 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-3">Stack Tecnológica</h2>
            <p className="text-white/40">Construído com ferramentas de ponta do ecossistema moderno.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-violet-500/40 hover:bg-violet-500/10 rounded-full px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-all duration-200 cursor-default">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {tech}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────── */}
      <section
        className="relative py-28 px-6 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 70% 80% at 50% 120%, rgba(124,58,237,0.22) 0%, transparent 65%),
            #09071a
          `,
        }}
      >
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Pronto para organizar
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                sua produção?
              </span>
            </h2>
            <p className="text-white/45 text-lg mb-10">
              Crie sua conta gratuita e comece a organizar sua produção agora.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <FillButton href="/login" variant="primary">
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5" />
              </FillButton>
              <FillButton href="/login" variant="outline">
                Já tenho conta
              </FillButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-[#070510] border-t border-white/8 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="m9 15 2 2 4-4"/>
              </svg>
            </div>
            <span className="font-semibold text-white">CreatorFlow</span>
          </div>
          <p className="text-sm text-white/25">
            Projeto de portfólio — dados fictícios salvos localmente no navegador.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/35 hover:text-white/70 transition-colors text-sm"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
