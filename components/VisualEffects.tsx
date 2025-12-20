'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function VisualEffects() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    // Fixed Background Layer - Z-Index 0 (Content is Z-10)
    // Deep Space Blue/Black Base
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#020410]" aria-hidden="true">
      
      {/* 
        Aurora 2.0 - Liquid Glass Effect 
        Uses CSS Blurs + Slower Motion for Premium Feel
      */}
      
      {/* Orb 1: Neon Green (Left Top) */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen opacity-50 animate-pulse-slow filter blur-[120px] bg-[radial-gradient(circle,rgba(57,255,20,0.6)_0%,rgba(57,255,20,0)_70%)] [animation-duration:15s]"
      />

      {/* Orb 2: Neon Blue (Right Top) */}
      <div 
        className="absolute top-[-5%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen opacity-50 animate-float filter blur-[140px] bg-[radial-gradient(circle,rgba(0,245,255,0.6)_0%,rgba(0,245,255,0)_70%)] [animation-duration:20s]"
      />

      {/* Orb 3: Neon Purple (Bottom Left) */}
      <div 
        className="absolute bottom-[-20%] left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen opacity-40 animate-glow filter blur-[160px] bg-[radial-gradient(circle,rgba(139,0,255,0.6)_0%,rgba(139,0,255,0)_70%)] [animation-duration:25s]"
      />

      {/* Noise Texture Overlay (Optional for "Film" look) */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] pointer-events-none" />

    </div>
  )
}
