'use client'

import Image from 'next/image'
import { Link } from '@/navigation'
import { Instagram, Facebook, Twitter, Globe, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface Artist {
    id: string
    stage_name: string
    slug: string // Added slug
    bio: string | null
    specialties: string[] | null
    portfolio_images: string[] | null
    social_links: Record<string, string> | null
}

export default function ArtistCard({ artist }: { artist: Artist }) {
    const t = useTranslations('ArtistsSection.card')
    const mainImage = artist.portfolio_images?.[0] || '/images/artist_placeholder.jpg'

    // Robust Link Generation
    const artistLink = artist.slug 
        ? `/artistas/${artist.slug}` 
        : `/artistas/${artist.stage_name.toLowerCase().replace(/\s+/g, '-')}`

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl hover:border-neon-green/50 transition-all duration-500"
        >
            {/* Image Container */}
            <div className="relative h-96 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent z-10" />
                <Image
                    src={mainImage}
                    alt={artist.stage_name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-3xl font-heading font-bold text-white mb-2 group-hover:text-neon-green transition-colors">
                        {artist.stage_name}
                    </h3>

                    {/* Specialties Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {artist.specialties?.slice(0, 3).map((specialty, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 text-xs font-semibold rounded-full bg-neon-blue/10 border border-neon-blue/30 text-neon-blue"
                            >
                                {specialty}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hover Content (Details) */}
            <div className="p-6">
                <p className="text-text-secondary text-sm line-clamp-3 mb-6">
                    {artist.bio || t('description')}
                </p>

                <div className="flex items-center justify-between gap-4">
                    <Link
                        href={artistLink}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-neon-green to-neon-blue text-bg-dark font-bold hover:opacity-90 transition-opacity"
                        aria-label={t('view_portfolio')}
                        title={t('view_portfolio')}
                    >
                        {t('view_portfolio')}
                        <ArrowRight size={16} />
                    </Link>

                    {/* Social Links */}
                    <div className="flex gap-2">
                        {artist.social_links?.instagram && (
                            <a 
                                href={artist.social_links.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-neon-pink transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram size={18} />
                            </a>
                        )}
                        {/* Add more social icons as needed */}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
