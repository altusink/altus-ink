'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Download, Type, Image as ImageIcon, Sparkles, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function BrandedContentStudio() {
    const [image, setImage] = useState<string | null>(null)
    const [city, setCity] = useState('Lisboa')
    const [artistHandle, setArtistHandle] = useState('@artist.name')
    const [style, setStyle] = useState('Neon')
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            setImage(event.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    // Effect to draw on canvas whenever inputs change
    useEffect(() => {
        if (!image || !canvasRef.current) return
        drawCanvas()
    }, [image, city, artistHandle, style])

    const drawCanvas = () => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        const img = new Image()
        img.src = image!

        img.onload = () => {
            canvas.width = 1080
            canvas.height = 1920

            // 1. Draw Image (Cover)
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height)
            const x = (canvas.width / 2) - (img.width / 2) * scale
            const y = (canvas.height / 2) - (img.height / 2) * scale
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

            // 2. Gradient Overlay (Always Dark at bottom)
            const gradient = ctx.createLinearGradient(0, canvas.height - 600, 0, canvas.height)
            gradient.addColorStop(0, 'transparent')
            gradient.addColorStop(0.8, 'rgba(0,0,0,0.9)')
            ctx.fillStyle = gradient
            ctx.fillRect(0, canvas.height - 600, canvas.width, 600)

            // 3. Styles Logic
            ctx.textAlign = 'center'
            
            if (style === 'Neon') {
                // Neon Border
                ctx.shadowBlur = 20
                ctx.shadowColor = '#00ff9d'
                ctx.strokeStyle = '#00ff9d'
                ctx.lineWidth = 20
                ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)
                ctx.shadowBlur = 0 // Reset

                // Text
                ctx.fillStyle = '#ffffff'
                ctx.font = 'bold 40px Inter'
                ctx.fillText(`${city.toUpperCase()} • ${new Date().getFullYear()}`, canvas.width / 2, canvas.height - 180)

                ctx.fillStyle = '#00ff9d'
                ctx.font = 'bold 60px Inter'
                ctx.fillText(artistHandle, canvas.width / 2, canvas.height - 100)
            } 
            else if (style === 'Minimal') {
                // Thin White Border
                ctx.strokeStyle = '#ffffff'
                ctx.lineWidth = 4
                ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120)

                // Text
                ctx.fillStyle = '#cccccc'
                ctx.font = '300 30px Helvetica'
                ctx.letterSpacing = '8px'
                ctx.fillText(`${city.toUpperCase()} | ${new Date().getFullYear()}`, canvas.width / 2, canvas.height - 150)

                ctx.fillStyle = '#ffffff'
                ctx.font = 'bold 50px Helvetica'
                ctx.fillText(artistHandle, canvas.width / 2, canvas.height - 80)
            }
            else if (style === 'Gothic') {
                // Ornate Corners (Simulated)
                ctx.strokeStyle = '#a855f7' // Purple
                ctx.lineWidth = 10
                ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)
                
                // Text
                ctx.font = 'bold 40px "UnifrakturMaguntia", serif' // Fallback to serif
                ctx.fillStyle = '#d8b4fe'
                ctx.fillText(`Est. ${new Date().getFullYear()} • ${city}`, canvas.width / 2, canvas.height - 180)

                ctx.fillStyle = '#ffffff'
                ctx.font = '60px serif'
                ctx.fillText(artistHandle, canvas.width / 2, canvas.height - 100)
            }
            else if (style === 'Grunge') {
                // Dashed/Rough Border
                ctx.setLineDash([20, 10, 5, 10])
                ctx.strokeStyle = '#fca5a5' // Light Red
                ctx.lineWidth = 15
                ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)
                ctx.setLineDash([]) // Reset

                // Text
                ctx.fillStyle = '#ffffff'
                ctx.font = 'bold 50px Courier New'
                ctx.fillText(`${city.toUpperCase()}`, canvas.width / 2, canvas.height - 160)

                ctx.fillStyle = '#fca5a5'
                ctx.save()
                ctx.rotate(-0.05)
                ctx.font = 'bold 70px Courier New'
                ctx.fillText(artistHandle, canvas.width / 2, canvas.height - 80)
                ctx.restore()
            }
            else if (style === 'Classic') {
                // Double Border
                ctx.strokeStyle = '#e2e8f0'
                ctx.lineWidth = 5
                ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)
                ctx.lineWidth = 2
                ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120)

                // Text
                ctx.fillStyle = '#ffffff'
                ctx.font = 'italic 40px Times New Roman'
                ctx.fillText(`Guest Spot • ${city}`, canvas.width / 2, canvas.height - 160)

                ctx.fillStyle = '#ffffff'
                ctx.font = 'bold 60px Times New Roman'
                ctx.fillText(artistHandle, canvas.width / 2, canvas.height - 90)
            }
        }
    }

    const downloadImage = () => {
        if (!canvasRef.current) return
        const link = document.createElement('a')
        link.download = `altus-story-${Date.now()}.png`
        link.href = canvasRef.current.toDataURL('image/png')
        link.click()
        toast.success("Story baixado! Pronto para postar. 📸")
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Controls */}
            <div className="space-y-6">
                <div className="bg-bg-card/50 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white font-heading mb-1">Branded Content Studio 📸</h2>
                    <p className="text-text-muted text-sm mb-6">Crie um story profissional com a marca da Altus em segundos.</p>

                    <div className="space-y-4">
                        {/* Upload */}
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-neon-green/50 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    aria-label="Upload de imagem"
                                />
                            <Upload className="mx-auto text-text-muted mb-2 group-hover:text-neon-green" />
                            <p className="text-sm text-text-muted">Clique para enviar foto (9:16)</p>
                        </div>

                        {/* Visual Settings */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-secondary uppercase">Cidade / Legenda</label>
                            <div className="bg-bg-dark rounded-lg p-3 flex items-center gap-3 border border-white/10">
                                <Type size={16} className="text-text-muted" />
                                <input
                                    className="bg-transparent outline-none text-white text-sm w-full"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Ex: Lisboa, Guest Spot..."
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-secondary uppercase">Seu @Instagram</label>
                            <div className="bg-bg-dark rounded-lg p-3 flex items-center gap-3 border border-white/10">
                                <Sparkles size={16} className="text-neon-green" />
                                <input
                                    className="bg-transparent outline-none text-white text-sm w-full"
                                    value={artistHandle}
                                    onChange={(e) => setArtistHandle(e.target.value)}
                                    placeholder="@seu.nome"
                                />
                            </div>
                        </div>

                        {/* Frame Style Selector */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-secondary uppercase">Estilo da Moldura</label>
                            <div className="grid grid-cols-5 gap-2">
                                {['Neon', 'Minimal', 'Gothic', 'Grunge', 'Classic'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStyle(s)}
                                        className={`p-2 rounded-lg border text-xs font-bold transition-all ${style === s 
                                            ? 'bg-neon-green text-black border-neon-green' 
                                            : 'bg-bg-dark border-white/10 text-text-muted hover:text-white'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            disabled={!image}
                            onClick={downloadImage}
                            className="w-full bg-neon-green text-black font-bold py-4 rounded-xl hover:bg-neon-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            Baixar Story Pronto
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,157,0.05),transparent_70%)]" />

                {image ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative shadow-2xl">
                        <canvas
                            ref={canvasRef}
                            className="w-[300px] h-[533px] object-cover rounded-lg border border-white/10 shadow-neon-green/20 shadow-2xl"
                        />
                    </motion.div>
                ) : (
                    <div className="text-center text-text-muted">
                        <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                        <p>O preview aparecerá aqui</p>
                    </div>
                )}
            </div>
        </div>
    )
}
