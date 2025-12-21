'use client'

import { useState, useEffect } from 'react'
import { getSystemSettings, updateSystemSetting } from '@/app/actions/settings'
import { Toaster, toast } from 'sonner'
import { Save, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import ThemeEditor from '@/components/admin/ThemeEditor'

export default function SettingsPage() {
    const [settings, setSettings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        const data = await getSystemSettings()
        setSettings(data)
        setLoading(false)
    }

    async function handleSave(key: string, value: string) {
        setSaving(key)
        const result = await updateSystemSetting(key, value)
        if (result.success) {
            toast.success('Configuração atualizada!')
            // Optimistic update
            setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
        } else {
            toast.error(result.error || 'Erro ao salvar')
        }
        setSaving(null)
    }

    const categories = [
        { id: 'visual', label: 'Identidade Visual (Theme Engine)' },
        { id: 'sales', label: 'Vendas & Metas' },
        { id: 'payment', label: 'Pagamentos (Stripe/MP)' },
        { id: 'email', label: 'E-mail & Notificações' },
        { id: 'ai', label: 'Inteligência Artificial' },
        { id: 'users', label: 'Gerenciar Usuários' },
        { id: 'cms', label: 'Conteúdo do Site (CMS)' },
        { id: 'security', label: 'Segurança & Selos' }
    ]

    // User Creation State
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'ARTIST' })
    const [isCreatingUser, setIsCreatingUser] = useState(false)

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault()
        setIsCreatingUser(true)
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify(newUser),
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await res.json()
        if (data.success) {
            toast.success('Usuário criado com sucesso!')
            setNewUser({ email: '', password: '', role: 'ARTIST' })
        } else {
            toast.error(data.error || 'Erro ao criar usuário')
        }
        setIsCreatingUser(false)
    }

    if (loading) return <div className="p-8 text-white">Carregando configurações...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-heading">Configurações do Sistema</h1>
                    <p className="text-text-muted">Gerencie chaves, usuários e textos do site.</p>
                </div>
            </div>

            <div className="space-y-8">
                {categories.map(cat => {
                    if (cat.id === 'visual') {
                         return (
                            <div key={cat.id} className="animate-fade-in">
                                <ThemeEditor />
                            </div>
                         )
                    }

                    // Special Sections
                    if (cat.id === 'users') {
                        return (
                            <div key={cat.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">{cat.label}</h2>
                                <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
                                    <div>
                                        <label className="text-sm text-text-muted">Email</label>
                                        <input 
                                            type="email" 
                                            required
                                            aria-label="Email do novo usuário"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white"
                                            value={newUser.email}
                                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-text-muted">Senha Provisória</label>
                                        <input 
                                            type="text" 
                                            required
                                            aria-label="Senha do novo usuário"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white"
                                            value={newUser.password}
                                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-text-muted">Função (Role)</label>
                                        <select 
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white"
                                            value={newUser.role}
                                            aria-label="Função do novo usuário"
                                            onChange={e => setNewUser({...newUser, role: e.target.value})}
                                        >
                                            <option value="ARTIST">Artista</option>
                                            <option value="COORDINATOR">Coordenador</option>
                                            <option value="SALES">Vendas</option>
                                            <option value="CEO">CEO (Admin)</option>
                                        </select>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isCreatingUser}
                                        className="w-full py-3 bg-neon-green text-bg-dark font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isCreatingUser ? 'Criando...' : 'Criar Conta'}
                                    </button>
                                </form>
                            </div>
                        )
                    }

                    if (cat.id === 'cms') {
                        const cmsSettings = settings.filter(s => s.key.startsWith('cms_'))
                        return (
                            <div key={cat.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">{cat.label}</h2>
                                <div className="space-y-4">
                                    {cmsSettings.length === 0 && <p className="text-text-muted italic">Nenhum texto configurável encontrado no banco (adicione chaves 'cms_' na tabela system_settings).</p>}
                                    
                                    {cmsSettings.map(setting => (
                                         <div key={setting.key}>
                                            <label className="block text-sm font-medium text-white mb-1">{setting.key.replace('cms_', '').replace(/_/g, ' ').toUpperCase()}</label>
                                            <textarea
                                                defaultValue={setting.value}
                                                aria-label={setting.key}
                                                className="w-full h-32 bg-bg-dark border border-white/10 rounded-lg p-3 text-white focus:border-neon-green outline-none"
                                                onBlur={(e) => handleSave(setting.key, e.target.value)}
                                            />
                                            <div className="flex justify-end mt-1">
                                                 {saving === setting.key && <span className="text-xs text-neon-green">Salvando...</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    if (cat.id === 'security') {
                        return (
                             <div key={cat.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">{cat.label}</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div>
                                            <h3 className="text-white font-bold">Selo Cloudflare</h3>
                                            <p className="text-xs text-text-muted">Exibir selo de proteção no rodapé</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                id="security-toggle"
                                                aria-label="Ativar Selo Cloudflare"
                                                className="sr-only peer"
                                                defaultChecked={settings.find(s => s.key === 'show_security_seal')?.value === 'true'}
                                                onChange={(e) => handleSave('show_security_seal', e.target.checked ? 'true' : 'false')}
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    const catSettings = settings.filter(s => s.category === cat.id)
                    if (catSettings.length === 0) return null

                    return (
                        <div key={cat.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">{cat.label}</h2>
                            <div className="space-y-4">
                                {catSettings.map(setting => (
                                    <div key={setting.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                        <div>
                                            <label className="block text-sm font-medium text-white">{setting.key.replace(/_/g, ' ').toUpperCase()}</label>
                                            <p className="text-xs text-text-muted">{setting.description}</p>
                                        </div>
                                        <div className="md:col-span-2 flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type={setting.is_secret && !showSecrets[setting.key] ? "password" : "text"}
                                                    defaultValue={setting.value}
                                                    aria-label={`Configuração ${setting.key}`}
                                                    name={setting.key}
                                                    id={`setting-${setting.key}`}
                                                    className="w-full bg-bg-dark border border-white/10 rounded-lg p-3 text-white focus:border-neon-green outline-none"
                                                    onChange={(e) => {
                                                        // Optional: could save on blur or store in local state to save later
                                                    }}
                                                    onBlur={(e) => handleSave(setting.key, e.target.value)}
                                                />
                                                {setting.is_secret && (
                                                    <button
                                                        onClick={() => setShowSecrets(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                                                        className="absolute right-3 top-3 text-text-muted hover:text-white"
                                                        aria-label={showSecrets[setting.key] ? "Ocultar senha" : "Mostrar senha"}
                                                    >
                                                        {showSecrets[setting.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="w-8 flex items-center justify-center">
                                                {saving === setting.key && <Loader2 className="animate-spin text-neon-green" />}
                                                {saving !== setting.key && <div className="w-2 h-2 rounded-full bg-green-500/50" title="Sales automatically" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
            <Toaster position="top-right" theme="dark" />
        </div>
    )
}
