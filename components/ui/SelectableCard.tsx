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
                    flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 w-full relative overflow-hidden
                    ${isSelected 
                        ? 'bg-neon-green text-bg-dark border-neon-green shadow-[0_0_15px_rgba(0,255,157,0.3)]' 
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30'
                    }
                    ${className}
                `}
            >
                {/* Glow Effect */}
                {isSelected && <div className="absolute inset-0 bg-white/20 blur-md" />}
                <div className="relative z-10 flex flex-col items-center">
                    {children}
                </div>
            </motion.button>
        )
    }

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                relative p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col items-center justify-between gap-3 group overflow-hidden
                ${isSelected 
                    ? 'bg-neon-green/10 border-neon-green shadow-[0_0_20px_rgba(0,255,157,0.2)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                }
                ${className}
            `}
        >
            {/* Background Gradient on Select */}
            {isSelected && <div className="absolute inset-0 bg-gradient-to-b from-neon-green/5 to-transparent pointer-events-none" />}
            
            {/* Icon */}
            {icon && (
                <div className={`
                    p-3 rounded-full transition-all duration-300
                    ${isSelected 
                        ? 'bg-neon-green text-bg-dark scale-110' 
                        : 'bg-white/10 text-text-muted group-hover:text-white group-hover:bg-white/20'
                    }
                `}>
                    {icon}
                </div>
            )}

            <div className="text-center z-10 space-y-1">
                {title && (
                    <div className={`font-bold text-sm leading-tight transition-colors ${isSelected ? 'text-white' : 'text-text-secondary group-hover:text-white'}`}>
                        {title}
                    </div>
                )}
                {subtitle && (
                    <div className={`text-[10px] uppercase tracking-wider font-mono transition-opacity ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
                        {subtitle}
                    </div>
                )}
                {children}
            </div>
            
            {/* Active Indicator Checkmark (Optional, pure CSS preferred to reduce DOM) */}
            {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-green shadow-[0_0_10px_#39FF14]" />
            )}
        </motion.div>
    )
}
