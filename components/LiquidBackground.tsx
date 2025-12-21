'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function LiquidBackground() {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"]
    })

    // Parallax Effects - Orbs move at different speeds relative to scroll
    const y1 = useTransform(scrollYProgress, [0, 1], [0, 200])   // Slower
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -300])  // Reverse & Faster
    const y3 = useTransform(scrollYProgress, [0, 1], [0, 100])   // Subtle

    return (
        <div ref={ref} className="fixed inset-0 overflow-hidden pointer-events-none z-[-2]">
            {/* Deep Void Base */}
            <div className="absolute inset-0 bg-bg-dark" />

            {/* Orb 1: Electric Cyan (Top Left) - Moves Down with Scroll */}
            <motion.div 
                style={{ y: y1 }}
                animate={{
                    x: [0, 100, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-neon-cyan/20 blur-[120px] rounded-full mix-blend-screen opacity-60"
            />

            {/* Orb 2: Deep Violet (Bottom Right) - Moves Up against Scroll */}
            <motion.div 
                style={{ y: y2 }}
                animate={{
                    x: [0, -100, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-neon-purple/20 blur-[130px] rounded-full mix-blend-screen opacity-60"
            />

            {/* Orb 3: Accent Pulse (Center) - Mild Parallax */}
            <motion.div 
                style={{ y: y3 }}
                animate={{
                    opacity: [0.1, 0.3, 0.1],
                    scale: [0.8, 1, 0.8],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-indigo-900/30 blur-[100px] rounded-full mix-blend-overlay"
            />
            
            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('/images/noise.png')] mix-blend-overlay" />
        </div>
    )
}
