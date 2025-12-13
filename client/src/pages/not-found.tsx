/**
 * ALTUS INK - SMART NAVIGATOR (ENTERPRISE)
 * Intelligent Navigation Hub with Cyberpunk Aesthetics
 * 
 * Purpose: Transform dead-ends into discovery opportunities
 * 
 * Features:
 * - AI-powered path suggestions based on URL patterns
 * - Animated glitch typography with neon effects
 * - Quick navigation to popular destinations
 * - Integrated search functionality 
 * - Context-aware page recommendations
 * - Seamless connection to all platform sections
 * - Support contact integration
 */

import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { EnterpriseButton, EnterpriseCard, EnterpriseInput } from "@/components/ui/enterprise-core";
import {
  Home,
  Calendar,
  Users,
  Image,
  Search,
  ArrowRight,
  ShoppingBag,
  MessageCircle,
  Globe,
  Sparkles,
  MapPin,
  Clock,
  Palette,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Zap
} from "lucide-react";

// Popular destinations with icons
const POPULAR_DESTINATIONS = [
  {
    href: "/",
    label: "Home",
    description: "Página inicial",
    icon: Home,
    color: "from-brand-primary to-brand-secondary"
  },
  {
    href: "/book",
    label: "Reservar",
    description: "Agende sua sessão",
    icon: Calendar,
    color: "from-green-400 to-emerald-500"
  },
  {
    href: "/artists",
    label: "Artistas",
    description: "Conheça nossos talentos",
    icon: Palette,
    color: "from-purple-400 to-pink-500"
  },
  {
    href: "/portfolio",
    label: "Portfólio",
    description: "Galeria de trabalhos",
    icon: Image,
    color: "from-amber-400 to-orange-500"
  },
  {
    href: "/store",
    label: "Loja",
    description: "Produtos exclusivos",
    icon: ShoppingBag,
    color: "from-cyan-400 to-blue-500"
  },
  {
    href: "/contact",
    label: "Contato",
    description: "Fale conosco",
    icon: MessageCircle,
    color: "from-rose-400 to-red-500"
  },
];

// Suggested pages based on common paths
const SUGGESTED_PATHS: Record<string, { label: string; href: string }[]> = {
  "artist": [
    { label: "Ver Artistas", href: "/artists" },
    { label: "Agendar Sessão", href: "/book" },
  ],
  "book": [
    { label: "Fazer Reserva", href: "/book" },
    { label: "Ver Disponibilidade", href: "/artists" },
  ],
  "portfolio": [
    { label: "Ver Portfólio", href: "/portfolio" },
    { label: "Nossos Artistas", href: "/artists" },
  ],
  "shop": [
    { label: "Acessar Loja", href: "/store" },
    { label: "Ver Produtos", href: "/store" },
  ],
  "store": [
    { label: "Acessar Loja", href: "/store" },
  ],
  "admin": [
    { label: "Dashboard CEO", href: "/ceo" },
    { label: "Login", href: "/auth" },
  ],
  "login": [
    { label: "Autenticação", href: "/auth" },
  ],
  "dashboard": [
    { label: "Dashboard CEO", href: "/ceo" },
    { label: "Painel Admin", href: "/admin" },
  ],
  "help": [
    { label: "FAQ", href: "/faq" },
    { label: "Contato", href: "/contact" },
  ],
  "support": [
    { label: "Contato", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
};

// Quick actions
const QUICK_ACTIONS = [
  { icon: Calendar, label: "Agendar Agora", href: "/book", primary: true },
  { icon: Globe, label: "Explorar Site", href: "/" },
  { icon: HelpCircle, label: "Precisa de Ajuda?", href: "/contact" },
];

export default function SmartNavigator() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  // Extract path segments for intelligent suggestions
  const pathSegments = useMemo(() => {
    return location.split("/").filter(Boolean);
  }, [location]);

  // Get suggestions based on attempted path
  const suggestions = useMemo(() => {
    const allSuggestions: { label: string; href: string }[] = [];

    for (const segment of pathSegments) {
      const lowerSegment = segment.toLowerCase();
      for (const [key, paths] of Object.entries(SUGGESTED_PATHS)) {
        if (lowerSegment.includes(key)) {
          allSuggestions.push(...paths);
        }
      }
    }

    // Remove duplicates
    const unique = allSuggestions.filter(
      (item, index, self) => self.findIndex(i => i.href === item.href) === index
    );

    return unique.slice(0, 3);
  }, [pathSegments]);

  // Glitch effect trigger
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Could integrate with actual search - for now redirect to home with query param
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 relative overflow-hidden px-4 py-12">

      {/* ═══════════════════════════════════════════════════════════════════════
          ANIMATED BACKGROUND
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[150px]"
        />

        {/* Secondary glow */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-error/15 rounded-full blur-[120px]"
        />

        {/* Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.02)_50%)] bg-[size:4px_4px]" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          GLITCH 404 HEADER
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-8"
      >
        {/* 404 Typography */}
        <div className="relative mb-4">
          {/* Base layer */}
          <h1 className="text-[8rem] md:text-[12rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent leading-none select-none">
            404
          </h1>

          {/* Glitch layer */}
          <motion.h1
            animate={glitchActive ? {
              x: [0, -8, 8, -4, 4, 0],
              opacity: [1, 0.7, 1, 0.8, 1]
            } : {}}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 text-[8rem] md:text-[12rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-error to-brand-secondary leading-none"
          >
            404
          </motion.h1>

          {/* Cyan offset (glitch) */}
          <AnimatePresence>
            {glitchActive && (
              <motion.h1
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 0.5, x: -3 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 text-[8rem] md:text-[12rem] lg:text-[14rem] font-black text-cyan-400/50 leading-none mix-blend-screen"
              >
                404
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Página não encontrada
          </h2>
          <p className="text-neutral-400 max-w-md mx-auto">
            O destino <span className="text-brand-primary font-mono">"{location}"</span> não existe nesta dimensão.
          </p>
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          INTELLIGENT SUGGESTIONS
      ═══════════════════════════════════════════════════════════════════════ */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 mb-8 w-full max-w-md"
        >
          <EnterpriseCard className="p-4 backdrop-blur-xl bg-neutral-900/60 border-brand-primary/20">
            <div className="flex items-center gap-2 mb-3 text-brand-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Você quis dizer:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, i) => (
                <Link key={i} href={suggestion.href}>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium hover:bg-brand-primary/20 transition-colors cursor-pointer"
                  >
                    {suggestion.label}
                    <ChevronRight className="w-3 h-3" />
                  </motion.span>
                </Link>
              ))}
            </div>
          </EnterpriseCard>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          QUICK ACTIONS
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex flex-wrap justify-center gap-3 mb-8"
      >
        {QUICK_ACTIONS.map((action, i) => (
          <Link key={i} href={action.href}>
            <EnterpriseButton
              variant={action.primary ? "primary" : "glass"}
              className="flex items-center gap-2"
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </EnterpriseButton>
          </Link>
        ))}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SEARCH BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 w-full max-w-md mb-10"
      >
        <form onSubmit={handleSearch} className="relative">
          <EnterpriseInput
            type="text"
            placeholder="Buscar no site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          POPULAR DESTINATIONS GRID
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 w-full max-w-3xl"
      >
        <h3 className="text-center text-neutral-500 text-sm font-medium mb-4 uppercase tracking-wider">
          Destinos Populares
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {POPULAR_DESTINATIONS.map((dest, i) => (
            <Link key={i} href={dest.href}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative p-4 rounded-xl bg-neutral-900/60 backdrop-blur-sm border border-white/5 hover:border-brand-primary/30 transition-all cursor-pointer overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${dest.color} transition-opacity duration-300`} />

                <div className="relative z-10 flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${dest.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <dest.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-brand-primary transition-colors">
                      {dest.label}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {dest.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATUS INDICATOR
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 mt-12 flex flex-col items-center gap-4"
      >
        {/* Error code */}
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-brand-error animate-pulse" />
          <span>ERROR_CODE: ROUTE_NOT_FOUND</span>
          <span className="text-neutral-700">|</span>
          <span>PATH: {location}</span>
        </div>

        {/* Help link */}
        <p className="text-neutral-600 text-sm">
          Precisa de ajuda? {" "}
          <Link href="/contact" className="text-brand-primary hover:underline">
            Entre em contato com o suporte
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
