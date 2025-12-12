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
    Instagram,
    Grid3X3,
    Sparkles
} from "lucide-react";
import { SiInstagram } from "react-icons/si";

// Portfolio categories
const PORTFOLIO_CATEGORIES = [
    { id: "all", label: "Todos", icon: Grid3X3 },
    { id: "fineline", label: "Fineline", icon: Sparkles },
    { id: "blackwork", label: "Blackwork", icon: Sparkles },
    { id: "realismo", label: "Realismo", icon: Sparkles },
    { id: "cobertura", label: "Cobertura", icon: Sparkles },
    { id: "tradicional", label: "Tradicional", icon: Sparkles },
    { id: "newschool", label: "New School", icon: Sparkles },
];

// Sample portfolio images (in real app, comes from API)
const SAMPLE_PORTFOLIO = [
    { id: 1, category: "fineline", url: "https://images.unsplash.com/photo-1590246814883-57c511e76fc0?w=400&h=400&fit=crop" },
    { id: 2, category: "blackwork", url: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=400&h=400&fit=crop" },
    { id: 3, category: "realismo", url: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=400&h=400&fit=crop" },
    { id: 4, category: "fineline", url: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=400&fit=crop" },
    { id: 5, category: "tradicional", url: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=400&fit=crop" },
    { id: 6, category: "cobertura", url: "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&h=400&fit=crop" },
    { id: 7, category: "blackwork", url: "https://images.unsplash.com/photo-1542382257-80dedb725088?w=400&h=400&fit=crop" },
    { id: 8, category: "realismo", url: "https://images.unsplash.com/photo-1590246814883-57c511e76fc0?w=400&h=400&fit=crop" },
    { id: 9, category: "fineline", url: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=400&h=400&fit=crop" },
    { id: 10, category: "newschool", url: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=400&h=400&fit=crop" },
    { id: 11, category: "tradicional", url: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=400&fit=crop" },
    { id: 12, category: "cobertura", url: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=400&fit=crop" },
];

interface ArtistProfile {
    id: string;
    subdomain: string;
    displayName: string;
    bio: string | null;
    instagram: string | null;
    coverImageUrl: string | null;
    themeColor: string | null;
    city: string | null;
    country: string | null;
    tourModeEnabled: boolean;
    specialty: string | null;
}

export default function ArtistFeedPage() {
    const { subdomain } = useParams<{ subdomain: string }>();
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    // Fetch artist data
    const { data: artist, isLoading } = useQuery<ArtistProfile>({
        queryKey: [`/api/public/artist/${subdomain}`],
        enabled: !!subdomain,
    });

    // Filter portfolio by category
    const filteredPortfolio = activeCategory === "all"
        ? SAMPLE_PORTFOLIO
        : SAMPLE_PORTFOLIO.filter(img => img.category === activeCategory);

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    // Demo artist if loading
    const displayArtist = artist || {
        displayName: "Danilo Santos",
        bio: "Especialista em Fineline e Blackwork. Mais de 10 anos criando arte na pele. Cada traço é único, cada tattoo conta uma história.",
        instagram: "danilosantos.ink",
        city: "Lisboa",
        country: "Portugal",
        tourModeEnabled: true,
        specialty: "Fineline",
        themeColor: "#00D4FF"
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Sticky Header with AGENDAR Button */}
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/artists">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </Button>
                    </Link>

                    <h1 className="font-bold text-lg truncate max-w-[40%]">
                        {displayArtist.displayName}
                    </h1>

                    <Link href={`/book/${subdomain}`}>
                        <Button
                            size="sm"
                            className="bg-gold hover:bg-gold-light text-foreground font-bold gap-2 shadow-lg"
                        >
                            <Calendar className="w-4 h-4" />
                            AGENDAR
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Artist Profile Header */}
            <section className="px-4 py-8 border-b border-border">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <Avatar className="w-28 h-28 border-4 border-primary shadow-xl">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                                {getInitials(displayArtist.displayName)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                                <h2 className="text-2xl font-bold">{displayArtist.displayName}</h2>
                                {displayArtist.tourModeEnabled && (
                                    <Badge className="bg-accent text-accent-foreground">
                                        <Globe className="w-3 h-3 mr-1" />
                                        On Tour
                                    </Badge>
                                )}
                            </div>

                            {(displayArtist.city || displayArtist.country) && (
                                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-1 mb-3">
                                    <MapPin className="w-4 h-4" />
                                    {displayArtist.city}{displayArtist.country && `, ${displayArtist.country}`}
                                </p>
                            )}

                            <p className="text-foreground max-w-md mb-4">
                                {displayArtist.bio}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <Link href={`/book/${subdomain}`}>
                                    <Button className="bg-gold hover:bg-gold-light text-foreground font-bold gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Agendar Sessão
                                    </Button>
                                </Link>

                                {displayArtist.instagram && (
                                    <a
                                        href={`https://instagram.com/${displayArtist.instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button variant="outline" className="gap-2">
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

            {/* Category Filter */}
            <section className="sticky top-[57px] z-40 bg-background border-b border-border">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex overflow-x-auto py-3 gap-2 scrollbar-hide">
                        {PORTFOLIO_CATEGORIES.map((category) => (
                            <Button
                                key={category.id}
                                variant={activeCategory === category.id ? "default" : "outline"}
                                size="sm"
                                className={`flex-shrink-0 rounded-full transition-all ${activeCategory === category.id
                                        ? "bg-primary text-primary-foreground shadow-lg"
                                        : "hover:bg-primary/10"
                                    }`}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                {category.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio Grid */}
            <section className="px-4 py-6">
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-3 gap-1 md:gap-2"
                        >
                            {filteredPortfolio.map((image, index) => (
                                <motion.div
                                    key={image.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-sm md:rounded-lg"
                                    onClick={() => setSelectedImage(image.id)}
                                >
                                    <img
                                        src={image.url}
                                        alt={`Portfolio ${image.category}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {filteredPortfolio.length === 0 && (
                        <div className="text-center py-16">
                            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                Nenhuma foto nessa categoria ainda
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* See More on Instagram */}
            {displayArtist.instagram && (
                <section className="px-4 pb-24 pt-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <a
                            href={`https://instagram.com/${displayArtist.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-full border-2 gap-2 hover:bg-primary/10"
                            >
                                <SiInstagram className="w-5 h-5" />
                                Veja mais no Instagram
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </a>
                    </div>
                </section>
            )}

            {/* Floating AGENDAR Button (Mobile) */}
            <div className="fixed bottom-6 left-4 right-4 md:hidden z-50">
                <Link href={`/book/${subdomain}`}>
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-bold bg-gold hover:bg-gold-light text-foreground shadow-2xl rounded-2xl"
                    >
                        <Calendar className="w-5 h-5 mr-2" />
                        AGENDAR AGORA
                    </Button>
                </Link>
            </div>

            {/* Image Lightbox - TODO: implement */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <motion.img
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        src={SAMPLE_PORTFOLIO.find(img => img.id === selectedImage)?.url}
                        alt="Portfolio"
                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    />
                </div>
            )}
        </div>
    );
}
