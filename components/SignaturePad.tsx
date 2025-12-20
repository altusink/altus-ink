'use client'

import React, { useRef, useState, useEffect } from 'react'

export default function SignaturePad({ onSave }: { onSave: (base64: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasSignature, setHasSignature] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
            canvas.width = canvas.parentElement?.clientWidth || 500
            canvas.height = 200
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.strokeStyle = '#00ff9d' // Neon Green
                ctx.lineWidth = 2
                ctx.lineCap = 'round'
            }
        }
    }, [])

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        setIsDrawing(true)
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        const rect = canvas.getBoundingClientRect()
        let x, y
        
        if ('touches' in e) {
             x = e.touches[0].clientX - rect.left
             y = e.touches[0].clientY - rect.top
        } else {
             x = (e as React.MouseEvent).clientX - rect.left
             y = (e as React.MouseEvent).clientY - rect.top
        }
        
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        const rect = canvas.getBoundingClientRect()
        let x, y

        if ('touches' in e) {
             x = e.touches[0].clientX - rect.left
             y = e.touches[0].clientY - rect.top
        } else {
             x = (e as React.MouseEvent).clientX - rect.left
             y = (e as React.MouseEvent).clientY - rect.top
        }

        ctx.lineTo(x, y)
        ctx.stroke()
        setHasSignature(true)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clear = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
        setHasSignature(false)
    }

    const handleSave = () => {
        if (!hasSignature) return
        const canvas = canvasRef.current
        if (canvas) {
            onSave(canvas.toDataURL('image/png'))
        }
    }

    return (
        <div className="w-full">
            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden touch-none relative">
                 {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <span className="text-white text-xl font-handwriting">Assine aqui</span>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[200px] cursor-crosshair"
                />
            </div>
            
            <div className="flex justify-between mt-4">
                <button 
                    onClick={clear}
                    className="text-xs text-text-muted hover:text-white underline"
                >
                    Limpar
                </button>
                <button 
                    onClick={handleSave}
                    disabled={!hasSignature}
                    className="px-6 py-2 bg-neon-green text-black font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neon-green/90 transition-colors"
                >
                    CONFIRMAR ASSINATURA
                </button>
            </div>
        </div>
    )
}
