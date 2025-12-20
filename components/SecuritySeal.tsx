'use client'

import { ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SecuritySealProps {
    variant?: 'full' | 'badge'
}

export default function SecuritySeal({ variant = 'full' }: SecuritySealProps) {
    // In a real implementation, this would fetch the "enabled" state from a config/store
    // For now, we default to true as requested by the prompt requirement to "Add visual component"
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    if (variant === 'badge') {
        return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#F38020]/10 border border-[#F38020]/30" title="Protected by Cloudflare">
                <ShieldCheck className="w-3 h-3 text-[#F38020]" />
                <span className="text-[10px] text-[#F38020] font-bold uppercase tracking-wider">Cloudflare</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm">
            <div className="w-8 h-8 rounded bg-[#F38020]/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#F38020]" />
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Secured by</span>
                <span className="text-[10px] text-text-muted">Cloudflare Enterprise</span>
            </div>
        </div>
    )
}
