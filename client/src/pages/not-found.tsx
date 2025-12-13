/**
 * ALTUS INK - 404 NOT FOUND (ENTERPRISE)
 * Cyberpunk-style 404 with animated glitch effects
 */

import { Link } from "wouter";
import { motion } from "framer-motion";
import { EnterpriseButton, EnterpriseCard } from "@/components/ui/enterprise-core";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 relative overflow-hidden">

      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-error/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center px-4"
      >
        {/* Glitch 404 */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent leading-none select-none">
            404
          </h1>
          <motion.h1
            animate={{
              x: [0, -5, 5, -3, 3, 0],
              opacity: [1, 0.8, 1, 0.9, 1]
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="absolute inset-0 text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-error to-brand-secondary leading-none"
          >
            404
          </motion.h1>
        </div>

        <EnterpriseCard className="max-w-md mx-auto p-8 backdrop-blur-xl bg-neutral-900/60 border-white/10">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Página não encontrada</h2>
            <p className="text-neutral-400">
              O destino que você procura não existe nesta dimensão.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/">
                <EnterpriseButton variant="primary" className="w-full">
                  Voltar ao Início
                </EnterpriseButton>
              </Link>
              <Link href="/book">
                <EnterpriseButton variant="glass" className="w-full">
                  Fazer Reserva
                </EnterpriseButton>
              </Link>
            </div>
          </div>
        </EnterpriseCard>

        {/* Status Indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-brand-error animate-pulse" />
          <span>ERROR_CODE: PAGE_NOT_FOUND</span>
        </div>
      </motion.div>
    </div>
  );
}
