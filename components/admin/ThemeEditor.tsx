/* eslint-disable */
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

    // Dynamic Styles (Extracted to satisfy linters)
    const cardStyle = {
        backgroundColor: `rgba(0,0,0, ${theme.glassOpacity})`,
        borderColor: theme.primaryColor,
        boxShadow: `0 0 20px -5px ${theme.primaryColor}40`
    }

    const scanlinesStyle = {
        backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 2px, 3px 100%'
    }

    const primaryBgStyle = { backgroundColor: theme.primaryColor }
    const primaryTextStyle = { color: theme.primaryColor }
    const secondaryTextStyle = { color: theme.secondaryColor }
    const secondaryBorderStyle = { borderColor: theme.secondaryColor, color: theme.secondaryColor }

    // Helper for Chart Bar Styles
    const getBarStyle = (height: number, index: number) => ({
        height: `${height}%`,
        backgroundColor: index === 9 ? theme.primaryColor : `${theme.primaryColor}40`
    })

    const iconBoxStyle = { color: theme.primaryColor }
    const headingFont = { fontFamily: theme.fontHeading }
    const footerButtonStyle = { color: theme.secondaryColor }
    const miniWidgetStyle = {
        backgroundColor: `rgba(0,0,0, ${theme.glassOpacity})`,
        borderColor: theme.secondaryColor
    }
    const miniWidgetTextStyle = { color: theme.secondaryColor }


    // Inject CSS Variables for the entire component subtree
    const themeStyles = {
        '--primary': theme.primaryColor,
        '--secondary': theme.secondaryColor,
        '--glass': theme.glassOpacity,
        '--heading-font': theme.fontHeading,
        '--primary-rgb': theme.primaryColor.startsWith('#') ? hexToRgb(theme.primaryColor) : '0, 255, 157' // simplified for now
    } as React.CSSProperties

    // Helper to convert hex to rgb for opacity handling if needed, 
    // or just use color-mix which is modern. 
    // For now, we rely on the hex values directly in vars.

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={themeStyles}>
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
                
                {/* REAL WIDGET REPLICA: Revenue Card */}
                {/* Uses CSS Vars injected at parent level */}
                <div 
                    className="relative overflow-hidden rounded-2xl border p-6 transition-all duration-300"
                    style={{
                        backgroundColor: `rgba(0,0,0, var(--glass))`,
                        borderColor: 'var(--primary)',
                        boxShadow: '0 0 20px -5px rgba(0,255,157, 0.2)' // Fallback or complex calc needed for color opacity
                    }}
                >
                    {theme.enableScanlines && (
                         <div className="absolute inset-0 pointer-events-none opacity-10 bg-[image:linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" 
                              style={{ backgroundSize: '100% 2px, 3px 100%' }}
                         />
                    )}

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-white/5 text-[var(--primary)]">
                                    <Type size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-white/50 font-medium">Receita Mensal</p>
                                    <h3 className="text-3xl font-bold text-white tracking-tight font-[family-name:var(--heading-font)]">
                                        € 124.500
                                    </h3>
                                </div>
                            </div>
                            <span className="flex items-center gap-1 text-sm text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                                +12.5%
                            </span>
                        </div>

                        {/* Chart Area Replica */}
                        <div className="h-32 w-full flex items-end justify-between gap-1 mt-4">
                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 50].map((h, i) => (
                                <div 
                                    key={i} 
                                    className="w-full rounded-t-sm transition-all duration-500 hover:opacity-80"
                                    // Height is the only unavoidable inline style for dynamic charts
                                    style={{ 
                                        height: `${h}%`, 
                                        backgroundColor: i === 9 ? 'var(--primary)' : 'rgba(255,255,255,0.1)' 
                                    }} 
                                />
                            ))}
                        </div>

                        {/* Footer / Action */}
                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                            <p className="text-xs text-white/40">Atualizado agora</p>
                            <button className="text-sm font-bold hover:underline text-[var(--secondary)]">
                                Ver Relatório Completo &rarr;
                            </button>
                        </div>
                    </div>
                </div>

                {/* Second Widget: Client List (Mini) */}
                <div 
                    className="relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 opacity-60 hover:opacity-100"
                    style={{
                         backgroundColor: `rgba(0,0,0, var(--glass))`,
                         borderColor: 'var(--secondary)'
                    }}
                >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">JD</div>
                        <div>
                            <p className="text-white font-bold text-sm">John Doe</p>
                            <p className="text-xs text-[var(--secondary)]">Novo Cliente VIP</p>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    )
}

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

