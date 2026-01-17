'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="min-h-screen flex items-center justify-center px-4 pt-20">
                <div className="text-center">
                    <h1 className="text-9xl font-heading font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent mb-4">
                        404
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                        Página não encontrada
                    </h2>
                    <p className="text-text-secondary mb-8 max-w-md mx-auto">
                        A página que você está procurando não existe ou foi movida.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-green to-neon-blue text-bg-dark rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar para Home
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    )
}
