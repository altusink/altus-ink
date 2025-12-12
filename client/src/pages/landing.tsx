import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/hooks/useLocale";
import {
  Calendar,
  Clock,
  Shield,
  Globe,
  ArrowRight,
  Star,
  MapPin,
  CreditCard,
  Users,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { SiInstagram, SiTiktok } from "react-icons/si";

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

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

export default function Landing() {
  const { t } = useLocale();

  // Fetch public artists
  const { data: artists = [], isLoading: artistsLoading } = useQuery<PublicArtist[]>({
    queryKey: ["/api/public/artists"],
  });

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background scroll-momentum">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <motion.div
                className="flex items-center gap-3 cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src="/logo-altus.png"
                  alt="Altus International Ink"
                  className="h-10 w-auto"
                />
              </motion.div>
            </Link>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                  {t.common.login}
                </Button>
              </Link>
              <Link href="#artists">
                <Button className="bg-gold hover:bg-gold-light text-black font-semibold">
                  {t.common.bookNow}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 gradient-hero hero-section perspective-2000">
        {/* Background grid with scanlines for futuristic feel */}
        <div className="absolute inset-0 grid-pattern opacity-50 scanlines" />

        {/* Ambient glow effects - GPU accelerated */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[200px] gpu-accelerated animate-neon-breathe" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[150px] gpu-accelerated" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
              border border-gold/30 bg-gold/5 mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-gold text-sm font-medium">{t.hero.badge}</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 font-display"
          >
            <span className="text-white">{t.hero.headline}</span>
            <span className="text-glow-gold block mt-2">
              {t.hero.headlineHighlight}
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10"
          >
            {t.hero.subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {/* Primary CTA */}
            <Link href="#artists">
              <Button
                size="lg"
                className="group relative px-10 py-6 rounded-2xl font-bold text-lg
                  bg-gradient-to-r from-gold to-gold-light text-black
                  shadow-glow-gold hover:shadow-[0_0_60px_rgba(201,162,39,0.5)]
                  transition-all duration-300 hover:-translate-y-1 h-auto"
                data-testid="button-hero-cta"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Ver Artistas
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>

            {/* Secondary CTA */}
            <Button
              size="lg"
              variant="outline"
              className="px-10 py-6 rounded-2xl font-medium text-lg
                border border-zinc-700 text-white
                hover:border-gold/50 hover:bg-gold/5
                transition-all duration-300 h-auto"
              data-testid="button-hero-secondary"
            >
              {t.hero.secondary}
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-zinc-500"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-neon-green" />
              <span className="text-sm">{t.hero.securePayment}</span>
            </div>
            <div className="w-px h-4 bg-zinc-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-gold text-gold" />
              <span className="text-sm">{t.hero.reviews}</span>
            </div>
            <div className="w-px h-4 bg-zinc-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm">{t.hero.locations}</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-gold rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Artists Section */}
      <section id="artists" className="py-24 px-6 relative">
        <div className="absolute inset-0 grid-pattern-fine opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-gold/5 to-transparent blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.p
              className="text-gold font-medium tracking-widest uppercase mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Nossos Artistas
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white font-display mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Talentos Internacionais
            </motion.h2>
            <motion.p
              className="text-xl text-zinc-400 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Artistas selecionados pela expertise e reconhecimento internacional
            </motion.p>
          </div>

          {/* Artists Grid */}
          {artistsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-card/50 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="w-32 h-5" />
                        <Skeleton className="w-24 h-4" />
                      </div>
                    </div>
                    <Skeleton className="w-full h-20 mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="w-24 h-10" />
                      <Skeleton className="w-24 h-10" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : artists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Users className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Em breve novos artistas
              </h3>
              <p className="text-zinc-400">
                Estamos selecionando os melhores talentos para você
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {artists.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="artist-card card-3d group h-full bg-zinc-900/50 backdrop-blur-xl 
                      border-zinc-800/50 hover:border-gold/40 overflow-hidden touch-feedback gpu-accelerated"
                    style={{
                      "--artist-color": artist.themeColor || "#C9A227"
                    } as React.CSSProperties}
                  >
                    <CardContent className="p-6 relative preserve-3d">
                      {/* Top accent line */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1 opacity-60 group-hover:opacity-100 transition-opacity"
                        style={{ background: `linear-gradient(90deg, transparent, ${artist.themeColor || "#C9A227"}, transparent)` }}
                      />

                      {/* Artist Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-16 h-16 border-2 transition-all group-hover:scale-105"
                          style={{ borderColor: artist.themeColor || "#C9A227" }}
                        >
                          <AvatarImage src={artist.coverImageUrl || undefined} />
                          <AvatarFallback
                            className="text-lg font-bold"
                            style={{
                              backgroundColor: `${artist.themeColor || "#C9A227"}20`,
                              color: artist.themeColor || "#C9A227"
                            }}
                          >
                            {getInitials(artist.displayName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xl text-white truncate mb-1">
                            {artist.displayName}
                          </h3>

                          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">
                              {artist.city || "International"}{artist.country && `, ${artist.country}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {artist.tourModeEnabled && (
                              <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan text-xs">
                                <Globe className="w-3 h-3 mr-1" />
                                On Tour
                              </Badge>
                            )}
                            {artist.specialty && (
                              <Badge variant="secondary" className="text-xs">
                                {artist.specialty}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-zinc-400 text-sm line-clamp-3 mb-6 min-h-[4.5rem]">
                        {artist.bio || "Artista internacional especializado em tatuagens personalizadas."}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-3">
                        {artist.instagram && (
                          <a
                            href={`https://instagram.com/${artist.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              className="w-full border-zinc-700 hover:border-zinc-500"
                            >
                              <SiInstagram className="w-4 h-4 mr-2" />
                              Portfolio
                            </Button>
                          </a>
                        )}

                        <Link href={`/book/${artist.subdomain}`} className="flex-1">
                          <Button
                            className="w-full font-semibold"
                            style={{
                              backgroundColor: artist.themeColor || "#C9A227",
                              color: "#000"
                            }}
                          >
                            Agendar
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-card/30 relative">
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <motion.p
              className="text-gold font-medium tracking-widest uppercase mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Features
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white font-display"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Por que escolher a ALTUS INK
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Agendamento Inteligente",
                description: "Veja disponibilidade em tempo real e reserve seu horário preferido instantaneamente.",
                color: "var(--gold)"
              },
              {
                icon: Shield,
                title: "Pagamento Seguro",
                description: "Depósitos protegidos com múltiplas formas de pagamento europeias.",
                color: "hsl(var(--neon-green))"
              },
              {
                icon: Globe,
                title: "Tour Mode",
                description: "Siga seus artistas favoritos em tour. Agende sessões em diferentes cidades.",
                color: "hsl(var(--neon-cyan))"
              },
              {
                icon: CreditCard,
                title: "Múltiplos Pagamentos",
                description: "Stripe, SEPA, iDEAL, Bancontact, Revolut, Wise, PayPal e muito mais.",
                color: "hsl(var(--neon-magenta))"
              },
              {
                icon: Users,
                title: "Artistas Elite",
                description: "Tatuadores selecionados e reconhecidos internacionalmente.",
                color: "hsl(var(--neon-purple))"
              },
              {
                icon: Sparkles,
                title: "Experiência Premium",
                description: "Design futurístico e interface intuitiva para uma experiência única.",
                color: "hsl(var(--neon-blue))"
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full glass-card hover:border-gold/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <feature.icon
                        className="w-6 h-6"
                        style={{ color: feature.color }}
                      />
                    </div>
                    <h3 className="font-semibold text-xl text-white mb-2">{feature.title}</h3>
                    <p className="text-zinc-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[200px]" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white font-display mb-6">
              Pronto para sua próxima tattoo?
            </h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              Junte-se a milhares de clientes satisfeitos que transformaram suas visões em arte permanente.
            </p>
            <Link href="#artists">
              <Button
                size="lg"
                className="px-12 py-6 rounded-2xl font-bold text-lg
                  bg-gradient-to-r from-gold to-gold-light text-black
                  shadow-glow-gold hover:shadow-[0_0_60px_rgba(201,162,39,0.5)]
                  transition-all duration-300 hover:-translate-y-1 h-auto"
                data-testid="button-cta-bottom"
              >
                Escolher Artista
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <img
                src="/logo-altus.png"
                alt="Altus International Ink"
                className="h-12 w-auto mb-6"
              />
              <p className="text-zinc-400 max-w-md mb-6 leading-relaxed">
                Conectando você com os melhores tatuadores da Europa.
                Arte corporal premium com agendamento simplificado e pagamentos seguros.
              </p>

              {/* Social Links */}
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center
                  hover:bg-gold/20 hover:text-gold transition-colors text-zinc-400">
                  <SiInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center
                  hover:bg-gold/20 hover:text-gold transition-colors text-zinc-400">
                  <SiTiktok className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-6">{t.footer.navigation}</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-zinc-400 hover:text-gold transition-colors">{t.common.home}</Link></li>
                <li><Link href="#artists" className="text-zinc-400 hover:text-gold transition-colors">Artistas</Link></li>
                <li><Link href="/login" className="text-zinc-400 hover:text-gold transition-colors">{t.common.login}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-6">{t.footer.legal}</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-zinc-400 hover:text-gold transition-colors">{t.footer.privacy}</a></li>
                <li><a href="#" className="text-zinc-400 hover:text-gold transition-colors">{t.footer.terms}</a></li>
                <li><a href="#" className="text-zinc-400 hover:text-gold transition-colors">{t.footer.cancellation}</a></li>
                <li><a href="#" className="text-zinc-400 hover:text-gold transition-colors">{t.footer.cookies}</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trust & Integrations Bar */}
        <div className="border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Payment Methods */}
              <div className="flex items-center gap-6">
                <span className="text-zinc-500 text-sm">{t.footer.securePayment}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800">
                    <CreditCard className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs text-zinc-400">Stripe</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800">
                    <span className="text-xs text-zinc-400">SEPA</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800">
                    <span className="text-xs text-zinc-400">iDEAL</span>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800">
                  <Shield className="w-4 h-4 text-neon-green" />
                  <span className="text-xs text-zinc-400">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-xs text-zinc-400">GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm">
              {t.footer.copyright}
            </p>
            <p className="text-zinc-500 text-sm">
              {t.footer.madeWith}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
