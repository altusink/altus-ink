'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ThemeConfig } from '@/lib/types/admin'
import { toast } from 'sonner'
import { Save, RefreshCw, Palette, Layers, Type } from 'lucide-react'

// Default values if DB is empty
const DEFAULT_THEME: ThemeConfig = {
    primaryColor: '#00ff9d',
    secondaryColor: '#00f0ff',
    glassOpacity: 0.6,
    borderRadius: '16px',
    fontHeading: 'Orbitron',
    enableScanlines: true,
    enableAurora: true
}

export default function ThemeEditor() {
    const supabase = createClient()
    const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchTheme()
    }, [])

    const fetchTheme = async () => {
        try {
            const { data, error } = await supabase
                .from('admin_settings')
                .select('value')
                .eq('key', 'theme_config')
                .single()
            
            if (data?.value) {
                setTheme({ ...DEFAULT_THEME, ...data.value })
            }
        } catch (error) {
            console.error('Error fetching theme:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('admin_settings')
                .upsert({ 
                    key: 'theme_config', 
                    value: theme,
                    category: 'ui',
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            toast.success('Tema atualizado com sucesso!', {
                description: 'As alterações podem levar alguns segundos para propagar.'
            })
            
            // Force reload to apply specific root variables if not using context yet
            // location.reload() 
        } catch (error) {
            toast.error('Erro ao salvar tema')
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-neon-green animate-pulse">Carregando Studio Visual...</div>

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor Panel */}
            <div className="space-y-6 bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-heading text-white flex items-center gap-2">
                        <Palette className="text-neon-green" />
                        Editor Visual
                    </h3>
                    <button 
                        type="button"
                        onClick={() => fetchTheme()}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        title="Resetar"
                        aria-label="Restaurar configurações padrão"
                    >
                        <RefreshCw size={18} className="text-text-muted" />
                    </button>
                </div>

                {/* Colors */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Cores do Sistema</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-text-muted mb-1 block">Primária (Neon)</span>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    aria-label="Cor Primária"
                                    title="Escolher Cor Primária"
                                    value={theme.primaryColor}
                                    onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                                    className="h-10 w-10 bg-transparent border-0 rounded cursor-pointer"
                                />
                                <input 
                                    type="text" 
                                    aria-label="Código Hex da Cor Primária"
                                    title="Código Hex da Cor Primária"
                                    value={theme.primaryColor}
                                    onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                                    className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm w-full font-mono text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-text-muted mb-1 block">Secundária (Accents)</span>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    aria-label="Cor Secundária"
                                    title="Escolher Cor Secundária"
                                    value={theme.secondaryColor}
                                    onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                    className="h-10 w-10 bg-transparent border-0 rounded cursor-pointer"
                                />
                                <input 
                                    type="text" 
                                    aria-label="Código Hex da Cor Secundária"
                                    title="Código Hex da Cor Secundária"
                                    value={theme.secondaryColor}
                                    onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                    className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm w-full font-mono text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/10 my-4" />

                {/* Glassmorphism */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                        <Layers size={16} /> Efeitos Visuais
                    </label>
                    
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-xs text-text-muted">Glass Opacity</span>
                            <span className="text-xs text-neon-green">{Math.round(theme.glassOpacity * 100)}%</span>
                        </div>
                        <input 
                            type="range" 
                            aria-label="Opacidade do Vidro"
                            min="0" max="1" step="0.05"
                            value={theme.glassOpacity}
                            onChange={(e) => setTheme(prev => ({ ...prev, glassOpacity: parseFloat(e.target.value) }))}
                            className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-neon-green"
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-sm text-white">Scanlines (Retrô Future)</span>
                        <button 
                            type="button"
                            aria-label="Ativar Scanlines"
                            title="Ativar/Desativar efeito de linhas de TV antiga"
                            onClick={() => setTheme(prev => ({ ...prev, enableScanlines: !prev.enableScanlines }))}
                            className={`w-12 h-6 rounded-full relative transition-colors ${theme.enableScanlines ? 'bg-neon-green' : 'bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${theme.enableScanlines ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-sm text-white">Aurora Background (Animado)</span>
                        <button 
                             type="button"
                             aria-label="Ativar Aurora Background"
                             title="Ativar/Desativar fundo animado Aurora"
                            onClick={() => setTheme(prev => ({ ...prev, enableAurora: !prev.enableAurora }))}
                            className={`w-12 h-6 rounded-full relative transition-colors ${theme.enableAurora ? 'bg-neon-cyan' : 'bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${theme.enableAurora ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="h-px bg-white/10 my-4" />

                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 bg-gradient-to-r from-neon-green to-neon-blue text-black font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {saving ? <RefreshCw className="animate-spin" /> : <Save />}
                    {saving ? 'Aplicando no Sistema...' : 'Salvar Alterações'}
                </button>
            </div>

            {/* Live Preview Panel */}
            <div className="space-y-6">
                <h3 className="text-xl font-heading text-white mb-4">Preview em Tempo Real</h3>
                
                {/* Simulated Card */}
                <div 
                    className="relative overflow-hidden rounded-2xl border border-white/10 p-8 transition-all duration-300"
                    style={{ // eslint-disable-line
                        backgroundColor: `rgba(0,0,0, ${theme.glassOpacity})`,
                        borderColor: theme.primaryColor,
                        boxShadow: `0 0 20px -5px ${theme.primaryColor}40`
                    }}
                >
                    {theme.enableScanlines && (
                        <div className="absolute inset-0 pointer-events-none opacity-10" 
                             style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} // eslint-disable-line
                        />
                    )}

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black shadow-lg"
                                style={{ backgroundColor: theme.primaryColor }}
                            >
                                AI
                            </div>
                            <div>
                                <h4 className="font-heading text-lg" style={{ color: theme.primaryColor }}>Altus Ink</h4>
                                <p className="text-xs text-white/50">Official Preview</p>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">
                            Sua experiência <span style={{ color: theme.secondaryColor }}>Premium</span>
                        </h2>

                        <p className="text-white/70 mb-8 leading-relaxed">
                            Este é um exemplo de como o sistema se comportará com as configurações atuais. 
                            O glassmorphism, as cores neon e os efeitos de scanline são aplicados instantaneamente.
                        </p>

                        <div className="flex gap-4">
                            <button 
                                className="px-6 py-2 rounded-lg font-bold text-black transition-transform hover:scale-105"
                                style={{ backgroundColor: theme.primaryColor }}
                            >
                                Confirmar
                            </button>
                            <button 
                                className="px-6 py-2 rounded-lg font-bold border transition-colors hover:bg-white/5"
                                style={{ borderColor: theme.secondaryColor, color: theme.secondaryColor }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
