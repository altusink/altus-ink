'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        logger.error('Segment Error Boundary caught an error', error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-2xl space-y-4">
                <div className="inline-flex p-3 rounded-full bg-orange-500/10">
                    <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>

                <h2 className="text-xl font-bold text-white">Falha ao carregar conteúdo</h2>
                
                <p className="text-sm text-text-secondary">
                    Não foi possível exibir esta seção no momento.
                </p>

                <div className="bg-black/20 p-2 rounded text-[10px] font-mono text-orange-400/80 border border-orange-500/10 truncate">
                    {error.message}
                </div>

                <button
                    onClick={() => reset()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    <RotateCcw className="w-4 h-4" />
                    Recarregar
                </button>
            </div>
        </div>
    )
}
