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
    ChevronRight,
    Filter
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

const staggerContainer = {
    animate: {
        transition: { staggerChildren: 0.08 }
    }
};

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

export default function ArtistsPage() {
    const [filter, setFilter] = useState<"all" | "tour">("all");

    const { data: artists = [], isLoading } = useQuery<PublicArtist[]>({
        queryKey: ["/api/public/artists"],
    });

    const filteredArtists = filter === "tour"
        ? artists.filter(a => a.tourModeEnabled)
        : artists;

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-app)]">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-dark border-b border-[var(--border-dark)]">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 text-[var(--text-on-dark-muted)] hover:text-[var(--text-on-dark)]">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                    </Link>

                    <Link href="/">
                        <img src="/logo-altus-white.png" alt="ALTUS INK" className="h-8 w-auto" />
                    </Link>

                    <Link href="/login">
                        <Button variant="outline" size="sm" className="btn-outline-light">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Page Header */}
            <section className="py-16 px-6 gradient-hero">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl"
                    >
                        <h1 className="heading-1 text-[var(--text-on-dark)] mb-4">
                            Our Artists
                        </h1>
                        <p className="body-large text-[var(--text-on-dark-muted)]">
                            World-class tattoo artists available for bookings. Browse portfolios and find your perfect match.
                        </p>
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-8 flex items-center gap-3"
                    >
                        <Filter className="w-4 h-4 text-[var(--text-on-dark-muted)]" />
                        <div className="flex gap-2">
                            <Button
                                variant={filter === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("all")}
                                className={filter === "all" ? "btn-primary" : "btn-outline-light"}
                            >
                                All Artists
                            </Button>
                            <Button
                                variant={filter === "tour" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("tour")}
                                className={filter === "tour" ? "btn-success" : "btn-outline-light"}
                            >
                                <Globe className="w-4 h-4 mr-2" />
                                On Tour
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Artists Grid */}
            <section className="px-6 pb-24 bg-[var(--bg-surface)]">
                <div className="max-w-7xl mx-auto -mt-8">
                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Card key={i} className="card-white overflow-hidden">
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
                    ) : filteredArtists.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24"
                        >
                            <Globe className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
                            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                                No artists found
                            </h3>
                            <p className="text-[var(--text-secondary)]">
                                {filter === "tour" ? "No artists currently on tour." : "Artists will be available soon."}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {filteredArtists.map((artist, index) => (
                                <motion.div
                                    key={artist.id}
                                    variants={fadeInUp}
                                    transition={{ delay: index * 0.08 }}
                                >
                                    <Link href={`/artist/${artist.subdomain}`}>
                                        <Card className="card-interactive overflow-hidden group">
                                            {/* Cover */}
                                            <div className="relative h-48 bg-gradient-to-br from-[var(--brand-primary)]/10 to-[var(--signal-success)]/10 overflow-hidden">
                                                {artist.coverImageUrl ? (
                                                    <img
                                                        src={artist.coverImageUrl}
                                                        alt={artist.displayName}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center gradient-purple">
                                                        <Avatar className="w-20 h-20 border-4 border-white/20">
                                                            <AvatarImage src={undefined} />
                                                            <AvatarFallback className="text-2xl font-bold bg-[var(--brand-primary)] text-white">
                                                                {getInitials(artist.displayName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                )}

                                                {artist.tourModeEnabled && (
                                                    <div className="absolute top-4 right-4">
                                                        <Badge className="badge-success">
                                                            <Globe className="w-3 h-3 mr-1" />
                                                            On Tour
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                                                            {artist.displayName}
                                                        </h3>
                                                        {(artist.city || artist.country) && (
                                                            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {artist.city}{artist.country && `, ${artist.country}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {artist.specialty && (
                                                        <Badge className="badge-primary text-xs">
                                                            {artist.specialty}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
                                                    {artist.bio || "International tattoo artist available for bookings."}
                                                </p>

                                                <Button className="w-full btn-outline-dark">
                                                    View Portfolio
                                                    <ChevronRight className="w-4 h-4 ml-1" />
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
