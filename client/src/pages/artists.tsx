import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ArrowLeft,
    MapPin,
    Globe,
    Sparkles,
    ChevronRight
} from "lucide-react";

interface PublicArtist {
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

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

const staggerContainer = {
    animate: {
        transition: { staggerChildren: 0.1 }
    }
};

export default function ArtistsPage() {
    const { data: artists = [], isLoading } = useQuery<PublicArtist[]>({
        queryKey: ["/api/public/artists"],
    });

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </Button>
                    </Link>

                    <Link href="/">
                        <img
                            src="/logo-altus.png"
                            alt="ALTUS INK"
                            className="h-8 w-auto"
                        />
                    </Link>

                    <Link href="/login">
                        <Button variant="outline" size="sm">
                            Entrar
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Page Title */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4"
                    >
                        Conheça o Time 🎨
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        Talentos internacionais prontos pra fazer sua próxima arte
                    </motion.p>
                </div>
            </section>

            {/* Artists Grid */}
            <section className="px-6 pb-24">
                <div className="max-w-6xl mx-auto">
                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Card key={i} className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <Skeleton className="w-full h-48" />
                                        <div className="p-6 space-y-3">
                                            <Skeleton className="w-32 h-6" />
                                            <Skeleton className="w-48 h-4" />
                                            <Skeleton className="w-full h-16" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : artists.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24"
                        >
                            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                Em breve! ✨
                            </h3>
                            <p className="text-muted-foreground">
                                Estamos selecionando os melhores talentos pra você
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {artists.map((artist, index) => (
                                <motion.div
                                    key={artist.id}
                                    variants={fadeInUp}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link href={`/artist/${artist.subdomain}`}>
                                        <Card className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 group border-2 border-transparent hover:border-primary/30">
                                            {/* Cover Image */}
                                            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                                                {artist.coverImageUrl ? (
                                                    <img
                                                        src={artist.coverImageUrl}
                                                        alt={artist.displayName}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                                                            <AvatarImage src={undefined} />
                                                            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                                                                {getInitials(artist.displayName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                )}

                                                {/* Badges overlay */}
                                                <div className="absolute top-4 right-4 flex gap-2">
                                                    {artist.tourModeEnabled && (
                                                        <Badge className="bg-accent text-accent-foreground">
                                                            <Globe className="w-3 h-3 mr-1" />
                                                            On Tour
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <CardContent className="p-6">
                                                {/* Name & Location */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                            {artist.displayName}
                                                        </h3>
                                                        {(artist.city || artist.country) && (
                                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {artist.city}{artist.country && `, ${artist.country}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {artist.specialty && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {artist.specialty}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Bio */}
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                    {artist.bio || "Artista internacional pronto pra criar sua próxima arte."}
                                                </p>

                                                {/* CTA */}
                                                <Button
                                                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                                    variant="outline"
                                                >
                                                    Ver Portfolio
                                                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
}
