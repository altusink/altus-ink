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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                    flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 w-full relative overflow-hidden group
                    ${isSelected 
                        ? 'bg-white text-bg-dark border-white shadow-lg' 
                        : 'bg-transparent border-white/20 text-white hover:border-white/40'
                    }
                    ${className}
                `}
            >
                <div className="relative z-10 flex flex-col items-center">
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
                relative p-4 rounded-lg border cursor-pointer transition-all duration-200 flex flex-col items-center justify-between gap-3 group
                ${isSelected 
                    ? 'bg-white text-bg-dark border-white shadow-xl' 
                    : 'bg-transparent border-white/20 hover:border-white/40'
                }
                ${className}
            `}
        >
            
            {/* Icon */}
            {icon && (
                <div className={`
                    p-2 rounded-full transition-all duration-200
                    ${isSelected 
                        ? 'bg-bg-dark text-white' 
                        : 'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
                    }
                `}>
                    {icon}
                </div>
            )}

            <div className="text-center z-10 space-y-1">
                {title && (
                    <div className={`font-semibold text-sm leading-tight transition-colors ${isSelected ? 'text-bg-dark' : 'text-white/90'}`}>
                        {title}
                    </div>
                )}
                {subtitle && (
                    <div className={`text-[10px] uppercase tracking-wider font-mono transition-opacity ${isSelected ? 'text-bg-dark/70' : 'text-white/50'}`}>
                        {subtitle}
                    </div>
                )}
                {children}
            </div>
            
            {/* Active Indicator (Clean Dot) */}
            {isSelected && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-bg-dark" />
            )}
        </motion.div>
    )
}
