'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { LogIn, Key, Mail, Loader2, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const t = useTranslations('Login')
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (authError || !user) {
                setError(t('form.error'))
                console.error(authError?.message)
                return
            }

            // Fetch Profile to determine Role
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            const role = profile?.role?.toUpperCase() || 'USER'

            // 1. Refresh to propagate cookies
            router.refresh()
            
            // 2. Wait a tick to ensure cookies are set (just to be safe)
            await new Promise(resolve => setTimeout(resolve, 500))

            // 3. Smart Redirect based on Role
            switch (role) {
                case 'ARTIST':
                    router.push('/admin/portal') 
                    break
                case 'SALES':
                    router.push('/admin/sales')  
                    break
                case 'COORDINATOR':
                    router.push('/admin/bookings') 
                    break
                default:
                    router.push('/admin') 
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-bg-dark text-white selection:bg-neon-green/30">
            <Navbar />

            <div className="min-h-screen flex items-center justify-center pt-20 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 shadow-[0_0_15px_rgba(0,255,157,0.1)]">
                            <LogIn className="w-4 h-4 text-neon-green" />
                            <span className="text-sm text-text-secondary font-medium tracking-wide">{t('badge')}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                            <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(0,255,157,0.3)]">
                                {t('title')}
                            </span>
                        </h1>
                        <p className="text-text-secondary font-light">
                            {t('subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6 bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl animate-fade-in-up delay-100">
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-sm mb-4 animate-shake">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm text-text-secondary font-medium ml-1">{t('form.email_label')}</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-neon-green transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('form.email_placeholder')}
                                    required
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-neon-green focus:bg-white/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-text-secondary font-medium ml-1">{t('form.password_label')}</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-neon-green transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('form.password_placeholder')}
                                    required
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-neon-green focus:bg-white/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-neon-green to-emerald-500 text-bg-dark font-bold rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(0,255,157,0.3)] mt-8"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {t('form.submitting')}
                                </>
                            ) : (
                                <>
                                    {t('form.submit')}
                                    <LogIn size={20} />
                                </>
                            )}
                        </button>
                        
                        <div className="text-center mt-4">
                            <a href="/login/reset" className="text-sm text-text-muted hover:text-neon-green transition-colors">
                                Esqueceu a senha?
                            </a>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-xs text-text-muted opacity-50">
                        {t('dev_note')}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
