import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Globe,
    ExternalLink,
    Grid3X3
} from "lucide-react";
import { SiInstagram } from "react-icons/si";

// Available countries for tour
const TOUR_COUNTRIES = [
    { code: "NL", name: "Netherlands" },
    { code: "FR", name: "France" },
    { code: "LU", name: "Luxembourg" },
    { code: "IT", name: "Italy" },
    { code: "GB", name: "London" },
    { code: "DE", name: "Germany" },
];

// Portfolio categories
const PORTFOLIO_CATEGORIES = [
    { id: "fineline", label: "Fineline" },
    { id: "blackwork", label: "Blackwork" },
    { id: "realismo", label: "Realism" },
    { id: "cobertura", label: "Cover-up" },
    { id: "tradicional", label: "Traditional" },
    { id: "newschool", label: "New School" },
];

// Sample portfolio images
const SAMPLE_PORTFOLIO: Record<string, string[]> = {
    fineline: [
        "https://images.unsplash.com/photo-1590246814883-57c511e76fc0?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&h=800&fit=crop",
    ],
    blackwork: [
        "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1542382257-80dedb725088?w=800&h=800&fit=crop",
    ],
    realismo: [
        "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=800&h=800&fit=crop",
    ],
};

interface ArtistProfile {
    id: string;
    subdomain: string;
    displayName: string;
    bio: string | null;
    instagram: string | null;
    coverImageUrl: string | null;
    city: string | null;
    country: string | null;
    tourModeEnabled: boolean;
    specialty: string | null;
}

export default function ArtistFeedPage() {
    const { subdomain } = useParams<{ subdomain: string }>();
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const { data: artist } = useQuery<ArtistProfile>({
        queryKey: [`/api/public/artist/${subdomain}`],
        enabled: !!subdomain,
    });

    const displayArtist = artist || {
        displayName: "Danilo Santos",
        bio: "Specialist in Fineline and Blackwork. Over 10 years creating art on skin. Every stroke is unique, every tattoo tells a story.",
        instagram: "danilosantos.ink",
        city: "Lisbon",
        country: "Portugal",
        tourModeEnabled: true,
        specialty: "Fineline",
    };

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const portfolioImages = activeCategory ? (SAMPLE_PORTFOLIO[activeCategory] || []) : [];

    return (
        <div className="min-h-screen bg-[var(--bg-app)]">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-dark border-b border-[var(--border-dark)]">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/artists">
                        <Button variant="ghost" size="sm" className="gap-2 text-[var(--text-on-dark-muted)] hover:text-[var(--text-on-dark)]">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                    </Link>

                    <h1 className="font-semibold text-lg text-[var(--text-on-dark)] truncate max-w-[40%]">
                        {displayArtist.displayName}
                    </h1>

                    <Link href={`/book/${subdomain}`}>
                        <Button size="sm" className="btn-primary gap-2">
                            <Calendar className="w-4 h-4" />
                            Book Session
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Profile Header */}
            <section className="px-4 py-8 border-b border-[var(--border-dark)] gradient-hero">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <Avatar className="w-24 h-24 border-4 border-[var(--brand-primary)]/30">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="text-2xl font-bold bg-[var(--brand-primary)] text-white">
                                {getInitials(displayArtist.displayName)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                                <h2 className="text-2xl font-bold text-[var(--text-on-dark)]">{displayArtist.displayName}</h2>
                                {displayArtist.tourModeEnabled && (
                                    <Badge className="badge-success">
                                        <Globe className="w-3 h-3 mr-1" />
                                        On Tour
                                    </Badge>
                                )}
                            </div>

                            {(displayArtist.city || displayArtist.country) && (
                                <p className="text-[var(--text-on-dark-muted)] flex items-center justify-center md:justify-start gap-1 mb-3">
                                    <MapPin className="w-4 h-4" />
                                    {displayArtist.city}{displayArtist.country && `, ${displayArtist.country}`}
                                </p>
                            )}

                            <p className="text-[var(--text-on-dark)] max-w-md mb-4">{displayArtist.bio}</p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <Link href={`/book/${subdomain}`}>
                                    <Button className="btn-primary gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Book Session
                                    </Button>
                                </Link>

                                {displayArtist.instagram && (
                                    <a
                                        href={`https://instagram.com/${displayArtist.instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button className="btn-outline-light gap-2">
                                            <SiInstagram className="w-4 h-4" />
                                            @{displayArtist.instagram}
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Country Selector (if on tour) */}
            {displayArtist.tourModeEnabled && (
                <section className="px-4 py-6 border-b border-[var(--border-dark)] bg-[var(--bg-dark)]">
                    <div className="max-w-5xl mx-auto">
                        <p className="text-sm text-[var(--text-on-dark-muted)] mb-3">Select tour location</p>
                        <div className="flex flex-wrap gap-2">
                            {TOUR_COUNTRIES.map((country) => (
                                <Button
                                    key={country.code}
                                    variant={selectedCountry === country.code ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCountry(country.code)}
                                    className={selectedCountry === country.code ? "btn-primary" : "btn-outline-light"}
                                >
                                    {country.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Category Filter */}
            <section className="sticky top-[57px] z-40 bg-[var(--bg-app)] border-b border-[var(--border-dark)]">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex overflow-x-auto py-4 gap-2 scrollbar-hide">
                        {PORTFOLIO_CATEGORIES.map((category) => (
                            <Button
                                key={category.id}
                                variant={activeCategory === category.id ? "default" : "outline"}
                                size="sm"
                                className={`flex-shrink-0 rounded-full ${activeCategory === category.id ? "btn-primary" : "btn-outline-light"}`}
                                onClick={() => setActiveCategory(
                                    activeCategory === category.id ? null : category.id
                                )}
                            >
                                {category.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio Grid */}
            <section className="px-4 py-8 bg-[var(--bg-surface)]">
                <div className="max-w-5xl mx-auto">
                    {!activeCategory ? (
                        <div className="text-center py-20">
                            <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
                            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                                Select a category
                            </h3>
                            <p className="text-[var(--text-secondary)]">
                                Choose a style category above to view the portfolio
                            </p>
                        </div>
                    ) : portfolioImages.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-[var(--text-secondary)]">
                                No images in this category yet
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-3 gap-2"
                            >
                                {portfolioImages.map((url, index) => (
                                    <motion.div
                                        key={url}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg"
                                        onClick={() => setSelectedImage(url)}
                                    >
                                        <img
                                            src={url}
                                            alt={`Portfolio ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </section>

            {/* Instagram Link */}
            {displayArtist.instagram && (
                <section className="px-4 pb-24 pt-8 bg-[var(--bg-surface)]">
                    <div className="max-w-5xl mx-auto text-center">
                        <a
                            href={`https://instagram.com/${displayArtist.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button className="btn-outline-dark rounded-full gap-2">
                                <SiInstagram className="w-5 h-5" />
                                See more on Instagram
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </a>
                    </div>
                </section>
            )}

            {/* Floating CTA (Mobile) */}
            <div className="fixed bottom-6 left-4 right-4 md:hidden z-50">
                <Link href={`/book/${subdomain}`}>
                    <Button className="w-full h-14 text-lg font-semibold rounded-2xl btn-primary shadow-lg glow-purple">
                        <Calendar className="w-5 h-5 mr-2" />
                        Book Now
                    </Button>
                </Link>
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <motion.img
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={selectedImage}
                        alt="Portfolio"
                        className="max-w-full max-h-[85vh] object-contain rounded-lg"
                    />
                </div>
            )}
        </div>
    );
}
