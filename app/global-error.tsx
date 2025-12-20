'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        logger.error('Global Error Boundary caught an error', error)
    }, [error])

    return (
        <html>
            <body className="bg-bg-dark text-white min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl text-center space-y-6">
                    <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-2">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    
                    <h2 className="text-3xl font-heading font-bold">Algo deu errado</h2>
                    
                    <p className="text-text-secondary">
                        Nossos sistemas detectaram um problema crítico. 
                        A equipe de engenharia já foi notificada.
                    </p>

                    {/* Tech details for Devs (Hidden in Prod visually ideally, or kept small) */}
                    <div className="bg-black/40 p-3 rounded-lg text-xs text-left font-mono text-red-400 overflow-auto max-h-32 border border-red-500/20">
                        {error.message || 'Erro Desconhecido'}
                        {error.digest && <div className="mt-1 text-gray-500">Digest: {error.digest}</div>}
                    </div>

                    <button
                        onClick={() => reset()}
                        className="w-full py-4 bg-neon-green text-bg-dark font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Tentar Novamente
                    </button>
                    
                    <div className="text-xs text-text-muted mt-8">
                        Error Code: 500 | System: Altus Ink Core
                    </div>
                </div>
            </body>
        </html>
    )
}
