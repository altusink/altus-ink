import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/useLocale";
import {
  ArrowRight,
  Globe,
  Shield,
  Calendar,
  Users,
  Star,
  Clock,
  Check
} from "lucide-react";

// Language selector component
const LanguageSelector = ({ onSelect }: { onSelect: (lang: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = useLocale();

  const languages = [
    { code: "pt", label: "PT", full: "Português" },
    { code: "en", label: "EN", full: "English" },
    { code: "es", label: "ES", full: "Español" },
  ];

  const current = languages.find(l => l.code === locale) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Globe className="w-4 h-4" />
        {current.label}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelect(lang.code);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between gap-4"
            >
              <span>{lang.full}</span>
              {lang.code === locale && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Landing() {
  const { setLocale } = useLocale();

  const handleLanguageSelect = (lang: string) => {
    setLocale(lang as any);
    localStorage.setItem("altus-locale", lang);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/logo-altus.png" alt="ALTUS INK" className="h-8 w-auto" />
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/artists">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Artists
              </span>
            </Link>
            <LanguageSelector onSelect={handleLanguageSelect} />
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Premium Tattoo Booking Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6"
            >
              Connect with
              <br />
              <span className="text-primary">world-class</span> artists
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-10 max-w-xl"
            >
              Book sessions with international tattoo artists.
              Secure payments, seamless scheduling, exceptional art.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/artists">
                <Button size="lg" className="h-12 px-8 text-base font-semibold">
                  Explore Artists
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-16 px-6 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-muted-foreground text-center mb-8">
            Trusted by artists from
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-muted-foreground">
            {["Portugal", "Spain", "Germany", "France", "Netherlands", "Italy"].map((country) => (
              <span key={country} className="text-lg font-medium">
                {country}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Why choose ALTUS INK
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              The premium platform connecting clients with exceptional tattoo artists worldwide
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "International Artists",
                description: "Access talented artists from Portugal, Spain, Germany, and beyond. Book sessions during their tours."
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Protected deposits and transparent pricing. Your payment is secured until your session is complete."
              },
              {
                icon: Calendar,
                title: "Easy Scheduling",
                description: "Real-time availability. Select your preferred date, time, and location in seconds."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              How it works
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Browse Artists", description: "Explore portfolios and find the perfect artist for your vision" },
              { step: "02", title: "Book Your Session", description: "Select your preferred date, location, and pay a secure deposit" },
              { step: "03", title: "Get Your Art", description: "Meet your artist and bring your tattoo idea to life" }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <span className="text-5xl font-bold text-primary/30">{item.step}</span>
                <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { value: "50+", label: "Artists", icon: Users },
              { value: "1,000+", label: "Sessions Booked", icon: Calendar },
              { value: "4.9", label: "Average Rating", icon: Star },
              { value: "24h", label: "Response Time", icon: Clock }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-6"
          >
            Ready to book your next session?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground mb-10"
          >
            Join thousands of clients who trust ALTUS INK for their tattoo journey
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/artists">
              <Button size="lg" className="h-14 px-10 text-lg font-semibold">
                Explore Artists
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-altus.png" alt="ALTUS INK" className="h-6 w-auto opacity-60" />
            <span className="text-sm text-muted-foreground">© 2024 ALTUS INK. All rights reserved.</span>
          </div>

          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/cancellation" className="hover:text-foreground transition-colors">Cancellation Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
