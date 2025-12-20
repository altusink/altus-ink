'use client'

import { Shield, Lock, CheckCircle, CloudLightning } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SecuritySealProps {
    variant?: 'footer' | 'badge'
}

export default function SecuritySeal({ variant = 'footer' }: SecuritySealProps) {
    // In a real app, this would come from a Context or API
    // For now, we default to TRUE as it's a requested features
    const [enabled, setEnabled] = useState(true)

    if (!enabled) return null

    if (variant === 'badge') {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F38020]/10 border border-[#F38020]/20 rounded-full">
               <CloudLightning className="w-3 h-3 text-[#F38020]" />
               <span className="text-[10px] font-bold text-[#F38020] uppercase tracking-wider">Protected by Cloudflare</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-[#F38020]/50 transition-colors group cursor-default"
            >
                <div className="p-2 bg-[#F38020]/10 rounded-md group-hover:bg-[#F38020]/20 transition-colors">
                    <CloudLightning className="w-5 h-5 text-[#F38020]" />
                </div>
                <div>
                    <p className="text-xs text-text-muted font-medium mb-0.5">Segurança Ativa</p>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Cloudflare Protected</p>
                </div>
                <div className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </motion.div>
        </div>
    )
}
