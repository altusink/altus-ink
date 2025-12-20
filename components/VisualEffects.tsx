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
    // Changed BG to Deep Dark Blue (Slate 950 variant)
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020410]">

      {/* 
        =============================================
        HIGH SPEED FLUID MOTION (Neon Blue Added)
        Moves X/Y + Morphs Shapes + 3-5s Loop
        =============================================
      */}

      <svg className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%]" preserveAspectRatio="none" viewBox="0 0 1440 900">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(57, 255, 20, 0)" />
            <stop offset="50%" stopColor="rgba(57, 255, 20, 0.25)" />
            <stop offset="100%" stopColor="rgba(57, 255, 20, 0)" />
          </linearGradient>

          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 245, 255, 0)" />
            <stop offset="50%" stopColor="rgba(0, 245, 255, 0.25)" />
            <stop offset="100%" stopColor="rgba(0, 245, 255, 0)" />
          </linearGradient>

          <linearGradient id="grad3" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 0, 255, 0)" />
            <stop offset="50%" stopColor="rgba(139, 0, 255, 0.25)" />
            <stop offset="100%" stopColor="rgba(139, 0, 255, 0)" />
          </linearGradient>

          {/* New Neon Blue Gradient (Replaces Pink) */}
          <linearGradient id="grad4" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 245, 255, 0)" />
            <stop offset="50%" stopColor="rgba(0, 245, 255, 0.25)" />
            <stop offset="100%" stopColor="rgba(0, 245, 255, 0)" />
          </linearGradient>
        </defs>

        {/* Layer 1: Green - SUPER FAST DRIFT */}
        <motion.path
          fill="url(#grad1)"
          className="mix-blend-screen"
          animate={{
            x: ["-10%", "10%", "-10%"],
            y: ["10%", "-10%", "10%"],
            d: [
              "M0,900 C300,600 900,900 1440,600 V900 H0 Z",
              "M0,900 C600,800 1200,500 1440,800 V900 H0 Z",
              "M0,900 C300,600 900,900 1440,600 V900 H0 Z"
            ]
          }}
          transition={{
            duration: 4, // 4s loop
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Layer 2: Cyan - SUPER FAST FLOW */}
        <motion.path
          fill="url(#grad2)"
          className="mix-blend-screen"
          animate={{
            x: ["10%", "-10%", "10%"],
            y: ["-10%", "10%", "-10%"],
            d: [
              "M-200,600 C200,400 1200,800 1640,600 V900 H-200 Z",
              "M-200,500 C400,300 1000,900 1640,500 V900 H-200 Z",
              "M-200,600 C200,400 1200,800 1640,600 V900 H-200 Z"
            ]
          }}
          transition={{
            duration: 5, // 5s loop
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Layer 3: Purple - SPIN */}
        <motion.path
          fill="url(#grad3)"
          className="mix-blend-screen"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 8, -8, 0],
            d: [
              "M0,400 C400,200 1000,600 1440,400 V900 H0 Z",
              "M0,300 C600,100 800,700 1440,300 V900 H0 Z",
              "M0,400 C400,200 1000,600 1440,400 V900 H0 Z"
            ]
          }}
          transition={{
            duration: 6, // 6s loop
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Layer 4: Neon Blue (Replaces Pink) - EXTRA MOVEMENT */}
        <motion.path
          fill="url(#grad4)"
          className="mix-blend-screen"
          animate={{
            x: ["-15%", "5%", "-15%"],
            y: ["-5%", "15%", "-5%"],
            d: [
              "M-200,300 C200,500 800,100 1640,300 V900 H-200 Z",
              "M-200,400 C300,200 900,500 1640,400 V900 H-200 Z",
              "M-200,300 C200,500 800,100 1640,300 V900 H-200 Z"
            ]
          }}
          transition={{
            duration: 3.5, // 3.5s loop (Very Fast)
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

      </svg>

      {/* Soft blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[50px]" />
    </div>
  )
}
