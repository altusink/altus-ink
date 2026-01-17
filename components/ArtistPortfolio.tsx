'use client'

import { useState } from 'react'
import { TattooCategory } from '@/types'

const categories: { id: TattooCategory; name: string }[] = [
    { id: 'ultrarealism', name: 'Ultrarrealismo' },
    { id: 'fineline', name: 'Fineline' },
    { id: 'coverup', name: 'Cobertura' },
    { id: 'oldschool', name: 'Old School' },
    { id: 'colorful', name: 'Colorido' },
]

export default function ArtistPortfolio() {
    const [selectedCategory, setSelectedCategory] = useState<TattooCategory | null>(null)

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                        <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                            Portfólio por Categoria
                        </span>
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Selecione um estilo para ver os trabalhos
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${selectedCategory === cat.id
                                ? 'bg-gradient-to-r from-neon-green to-neon-blue text-bg-dark shadow-neon-green scale-105'
                                : 'bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10 hover:border-neon-green'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Portfolio Grid - ONLY SHOWS WHEN CATEGORY SELECTED */}
                {selectedCategory ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="group aspect-square rounded-2xl bg-gradient-to-br from-neon-pink/10 to-neon-purple/10 border border-white/10 backdrop-blur-xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-center"
                            >
                                <div className="text-center p-4">
                                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-neon-green/30 to-neon-blue/30 border-2 border-neon-green/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="text-xl font-heading font-bold text-neon-green">{i + 1}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-text-muted text-lg">
                            Selecione uma categoria acima para ver o portfólio
                        </p>
                    </div>
                )}
            </div>
        </section>
    )
}
