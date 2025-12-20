'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SelectableCardProps {
    isSelected: boolean
    onClick: () => void
    title?: string
    subtitle?: string | ReactNode
    icon?: ReactNode
    children?: ReactNode
    variant?: 'default' | 'small' | 'date'
    className?: string
}

export default function SelectableCard({ 
    isSelected, 
    onClick, 
    title, 
    subtitle, 
    icon, 
    children, 
    variant = 'default',
    className = ''
}: SelectableCardProps) {
    if (variant === 'date') {
        return (
            <motion.button
                type="button"
                onClick={onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                    flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 w-full relative overflow-hidden group
                    ${isSelected 
                        ? 'bg-neon-cyan text-bg-dark border-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.5)]' 
                        : 'bg-white/5 border-white/10 text-text-muted hover:border-neon-cyan/50 hover:bg-white/10'
                    }
                    ${className}
                `}
            >
                <div className="relative z-10 flex flex-col items-center gap-1 font-bold">
                    {children}
                </div>
            </motion.button>
        )
    }

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`
                relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col items-center justify-between gap-4 group overflow-hidden
                ${isSelected 
                    ? 'bg-neon-cyan/10 border-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.2)]' 
                    : 'bg-white/5 border-white/10 hover:border-neon-cyan/50 hover:bg-white/10'
                }
                ${className}
            `}
        >
            
            {/* Icon - Glow Effect */}
            {icon && (
                <div className={`
                    p-3 rounded-xl transition-all duration-300
                    ${isSelected 
                        ? 'bg-neon-cyan text-bg-dark shadow-[0_0_15px_rgba(0,240,255,0.6)]' 
                        : 'bg-white/10 text-white/50 group-hover:text-neon-cyan group-hover:bg-neon-cyan/10'
                    }
                `}>
                    {icon}
                </div>
            )}

            <div className="text-center z-10 space-y-1">
                {title && (
                    <div className={`font-heading font-bold text-sm leading-tight transition-colors ${isSelected ? 'text-white' : 'text-text-secondary group-hover:text-white'}`}>
                        {title}
                    </div>
                )}
                {subtitle && (
                    <div className={`text-[10px] uppercase tracking-wider font-mono transition-opacity ${isSelected ? 'text-neon-cyan' : 'text-white/30'}`}>
                        {subtitle}
                    </div>
                )}
                {children}
            </div>
            
            {/* Active Indicator (Neon Line) */}
            {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-white to-neon-cyan shadow-[0_2px_10px_rgba(0,240,255,0.8)]" />
            )}
        </motion.div>
    )
}
