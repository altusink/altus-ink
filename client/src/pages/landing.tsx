import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Calendar,
  Shield,
  Zap,
  Globe,
  Users,
  TrendingUp,
  CreditCard,
  CheckCircle,
  Star,
  ChevronRight
} from "lucide-react";

interface PublicArtist {
  id: string;
  subdomain: string;
  displayName: string;
  coverImageUrl: string | null;
  specialty: string | null;
  city: string | null;
  tourModeEnabled: boolean;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

export default function Landing() {
  const { data: artists = [] } = useQuery<PublicArtist[]>({
    queryKey: ["/api/public/artists"],
  });

  const featuredArtists = artists.slice(0, 4);

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="badge-gold mb-6">
                <Star className="w-3 h-3 mr-1" />
                Premium Booking Platform
              </Badge>

              <h1 className="heading-1 text-[var(--text-on-dark)] mb-6">
                Professional Tattoo
                <span className="block text-[var(--brand-primary)]">Booking System</span>
              </h1>

              <p className="body-large text-[var(--text-on-dark-muted)] mb-8 max-w-lg">
                Streamline your tattoo studio operations with automated booking,
                secure payments, and professional client management. Built for artists who mean business.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/artists">
                  <Button className="btn-primary text-base px-8 py-6 h-auto">
                    Browse Artists
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="btn-outline-light text-base px-8 py-6 h-auto">
                    Artist Login
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 mt-10 pt-10 border-t border-[var(--border-dark)]">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--text-on-dark)]">500+</p>
                  <p className="text-sm text-[var(--text-on-dark-muted)]">Bookings</p>
                </div>
                <div className="w-px h-10 bg-[var(--border-dark)]" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--text-on-dark)]">50+</p>
                  <p className="text-sm text-[var(--text-on-dark-muted)]">Artists</p>
                </div>
                <div className="w-px h-10 bg-[var(--border-dark)]" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--signal-success)]">99%</p>
                  <p className="text-sm text-[var(--text-on-dark-muted)]">Satisfaction</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-[var(--brand-primary)]/20 to-[var(--signal-success)]/20 rounded-3xl blur-2xl" />
                <div className="relative card-dark p-8 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-white/10 rounded w-3/4" />
                    <div className="h-8 bg-white/10 rounded w-1/2" />
                    <div className="grid grid-cols-3 gap-3 mt-6">
                      <div className="h-20 bg-[var(--brand-primary)]/30 rounded-lg" />
                      <div className="h-20 bg-[var(--signal-success)]/30 rounded-lg" />
                      <div className="h-20 bg-[var(--brand-gold)]/30 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Light Cards */}
      <section className="py-24 bg-[var(--bg-dark)]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="badge-primary mb-4">Platform Features</Badge>
            <h2 className="heading-2 text-[var(--text-on-dark)] mb-4">
              Everything You Need to Scale
            </h2>
            <p className="body-large text-[var(--text-on-dark-muted)] max-w-2xl mx-auto">
              Professional tools designed for tattoo artists and studio owners
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description: "Automated booking system with intelligent time slot management and buffer times.",
                color: "var(--brand-primary)"
              },
              {
                icon: CreditCard,
                title: "Secure Payments",
                description: "Accept deposits via Stripe with automatic payment splits and refund handling.",
                color: "var(--signal-success)"
              },
              {
                icon: Globe,
                title: "Tour Management",
                description: "Manage guest spots and tour dates across multiple cities and countries.",
                color: "var(--brand-primary)"
              },
              {
                icon: Shield,
                title: "Client Protection",
                description: "Deposit system protects both artist and client with clear cancellation policies.",
                color: "var(--signal-success)"
              },
              {
                icon: TrendingUp,
                title: "Analytics Dashboard",
                description: "Track earnings, booking rates, and client retention with real-time insights.",
                color: "var(--brand-gold)"
              },
              {
                icon: Zap,
                title: "Instant Notifications",
                description: "Email and WhatsApp notifications for bookings, reminders, and updates.",
                color: "var(--signal-warning)"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="card-light h-full hover:border-[var(--brand-primary)]/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>
                    <h3 className="heading-4 text-[var(--text-primary)] mb-2">{feature.title}</h3>
                    <p className="body-base text-[var(--text-secondary)]">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Artists Section */}
      {featuredArtists.length > 0 && (
        <section className="py-24 bg-[var(--bg-app)]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <Badge className="badge-success mb-4">Featured Artists</Badge>
                <h2 className="heading-2 text-[var(--text-on-dark)]">
                  World-Class Talent
                </h2>
              </div>
              <Link href="/artists">
                <Button className="btn-outline-light hidden md:flex">
                  View All Artists
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredArtists.map((artist) => (
                <motion.div key={artist.id} variants={fadeInUp}>
                  <Link href={`/artist/${artist.subdomain}`}>
                    <Card className="card-dark overflow-hidden group cursor-pointer hover:border-[var(--brand-primary)]/50 transition-all duration-300">
                      <div className="aspect-square bg-[var(--bg-card-dark)] relative overflow-hidden">
                        {artist.coverImageUrl ? (
                          <img
                            src={artist.coverImageUrl}
                            alt={artist.displayName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center gradient-purple">
                            <span className="text-4xl font-bold text-white/80">
                              {artist.displayName.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {artist.tourModeEnabled && (
                          <Badge className="absolute top-3 right-3 badge-success">
                            <Globe className="w-3 h-3 mr-1" />
                            On Tour
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-[var(--text-on-dark)] group-hover:text-[var(--brand-primary)] transition-colors">
                          {artist.displayName}
                        </h3>
                        <p className="text-sm text-[var(--text-on-dark-muted)]">
                          {artist.specialty || "Tattoo Artist"}
                        </p>
                        {artist.city && (
                          <p className="text-xs text-[var(--text-on-dark-muted)] mt-1 opacity-60">
                            {artist.city}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-8 md:hidden">
              <Link href="/artists">
                <Button className="btn-outline-light">
                  View All Artists
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 gradient-purple">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Streamline Your Bookings?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join professional tattoo artists who trust Altus Ink for their booking management.
              Get started in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/artists">
                <Button className="btn-gold text-base px-8 py-6 h-auto">
                  Browse Artists
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button className="btn-outline-light text-base px-8 py-6 h-auto">
                  Artist Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--bg-dark)] border-t border-[var(--border-dark)] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/logo-altus-white.png" alt="Altus Ink" className="h-8 mb-4" />
              <p className="text-sm text-[var(--text-on-dark-muted)]">
                Professional tattoo booking platform for artists and studios worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-on-dark)] mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-[var(--text-on-dark-muted)]">
                <li><Link href="/artists" className="hover:text-[var(--brand-primary)] transition-colors">Artists</Link></li>
                <li><Link href="/login" className="hover:text-[var(--brand-primary)] transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-on-dark)] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--text-on-dark-muted)]">
                <li><Link href="/privacy" className="hover:text-[var(--brand-primary)] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--brand-primary)] transition-colors">Terms of Service</Link></li>
                <li><Link href="/cancellation" className="hover:text-[var(--brand-primary)] transition-colors">Cancellation Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-on-dark)] mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-[var(--text-on-dark-muted)]">
                <li>support@altusink.com</li>
                <li>Amsterdam, Netherlands</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--border-dark)] text-center text-sm text-[var(--text-on-dark-muted)] opacity-60">
            <p>&copy; {new Date().getFullYear()} Altus Ink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
