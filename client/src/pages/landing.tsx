import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/useLocale";
import {
  ArrowRight,
  Globe,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  MapPin,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

// Enterprise Language Selector
const LanguageSelector = ({ onSelect }: { onSelect: (lang: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = useLocale();

  const languages = [
    { code: "en", label: "EN", full: "English (US)" },
    { code: "pt", label: "PT", full: "Português (BR)" },
    { code: "es", label: "ES", full: "Español" },
    { code: "fr", label: "FR", full: "Français" },
    { code: "de", label: "DE", full: "Deutsch" },
  ];

  const current = languages.find(l => l.code === locale) || languages[0];

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
      >
        <Globe className="w-3 h-3" />
        {current.label}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-48 bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelect(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-medium rounded-lg transition-colors flex items-center justify-between
                  ${lang.code === locale ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                <span>{lang.full}</span>
                {lang.code === locale && <CheckCircle2 className="w-3 h-3 text-[#00FF94]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Minimalist Tech Background
const TechBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#6366F1]/10 to-transparent blur-[100px] opacity-40" />
    <div className="absolute top-[20%] left-[20%] w-[600px] h-[300px] bg-gradient-to-r from-[#00FF94]/5 to-transparent blur-[80px] opacity-20" />

    {/* Grid Pattern */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
    <div className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
        backgroundSize: '120px 120px'
      }}
    />
  </div>
);

export default function Landing() {
  const { setLocale } = useLocale();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const handleLanguageSelect = (lang: string) => {
    setLocale(lang as any);
    localStorage.setItem("altus-locale", lang);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white selection:bg-[#00FF94] selection:text-black">
      <TechBackground />

      {/* Enterprise Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0C]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0A0A0C]/50">
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#00FF94]/50 transition-colors">
                <img src="/logo-altus.png" alt="A" className="h-4 w-auto opacity-80 group-hover:opacity-100" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white/90 group-hover:text-white">
                ALTUS<span className="text-[#00FF94]">INK</span>
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/artists">
              <span className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">
                Curated Artists
              </span>
            </Link>
            <Link href="/about">
              <span className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">
                Concierge
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector onSelect={handleLanguageSelect} />
            <div className="h-4 w-[1px] bg-white/10 mx-2" />
            <Link href="/login">
              <span className="text-sm font-medium text-white hover:text-[#00FF94] transition-colors cursor-pointer">
                Sign In
              </span>
            </Link>
            <Link href="/artists">
              <Button className="h-9 px-4 bg-white text-black hover:bg-gray-200 font-semibold text-sm rounded-lg transition-all shadow-lg shadow-white/5">
                Book Session
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Klu Style */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 mb-8 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#00FF94] animate-pulse rounded-full" />
            <span className="text-xs font-medium tracking-wide text-gray-300">
              GLOBAL ARTIST NETWORK ACTIVE
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-8 leading-[0.95]"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              The Standard for
            </span>
            <br />
            <span className="text-white">
              Global Tattoo Art.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Curated access to elite tattoo artists worldwide. Secure bookings,
            transparent pricing, and travel-ready scheduling for the discerning collector.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/artists">
              <Button className="h-14 px-8 bg-[#00FF94] text-black hover:bg-[#00FF94] hover:scale-105 font-bold text-lg rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(0,255,148,0.3)] w-full sm:w-auto">
                Explore Artists
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-14 px-8 border-white/10 hover:bg-white/5 hover:border-white/20 text-white font-medium text-lg rounded-xl transition-all w-full sm:w-auto">
                Artist Access
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Hero Abstract Graphic */}
        <motion.div
          style={{ y: y1, opacity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none"
        />
      </section>

      {/* Social Proof - Monochromatic */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold text-center text-gray-500 uppercase tracking-widest mb-8">
            TRUSTED STUDIOS IN GLOBAL HUBS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 hover:opacity-100 transition-opacity duration-500">
            {/* Text Logos for elegance */}
            {["LONDON", "BERLIN", "NEW YORK", "TOKYO", "LISBON", "AMSTERDAM"].map(city => (
              <span key={city} className="text-lg font-display font-medium tracking-widest text-white">
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Grid - Linear Style */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Borderles Access",
                desc: "Book artists in their home studio or capture them on tour. Real-time location tracking."
              },
              {
                icon: ShieldCheck,
                title: "Escrow Protection",
                desc: "Your deposit is held securely until the session is confirmed. Zero risk, 100% transparent."
              },
              {
                icon: CalendarDays,
                title: "Sync Scheduling",
                desc: "Direct integration with artists' calendars. Instant confirmation without the back-and-forth."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl bg-[#0F0F10] border border-[#1F1F1F] hover:border-[#3F3F46] transition-all duration-300 hover:shadow-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center mb-6 text-white group-hover:text-[#00FF94] group-hover:scale-110 transition-all">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase - Dark Glass */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto bg-gradient-to-b from-[#18181B] to-[#0F0F10] rounded-[40px] border border-white/5 p-12 md:p-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00FF94]/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                Concierge-level <br />
                <span className="text-[#00FF94]">Experience.</span>
              </h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                We handle the logistics so you can focus on the art. From consultation to aftercare, every step is managed with precision on our secure platform.
              </p>

              <div className="space-y-4">
                {[
                  "Verified Artist Portfolios",
                  "Multi-currency Payments",
                  "Automated Appointment Reminders"
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#00FF94]/10 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-[#00FF94]" />
                    </div>
                    <span className="text-gray-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/artists">
                <Button className="mt-10 h-12 px-6 bg-white text-black hover:bg-gray-200 font-semibold rounded-lg">
                  Browse Portfolio
                </Button>
              </Link>
            </div>

            {/* Abstract UI representation */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-[#0A0A0C] border border-white/10 shadow-2xl overflow-hidden relative group">
                {/* Mock UI Elements */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="h-2 w-20 bg-white/10 rounded-full" />
                </div>

                <div className="absolute top-24 left-6 w-32 h-32 rounded-xl bg-white/5 animate-pulse" />
                <div className="absolute top-24 left-44 right-6 space-y-3">
                  <div className="h-4 w-3/4 bg-white/20 rounded" />
                  <div className="h-3 w-1/2 bg-white/10 rounded" />
                  <div className="h-3 w-full bg-white/5 rounded" />
                  <div className="h-3 w-full bg-white/5 rounded" />
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex gap-4">
                  <div className="h-10 w-full bg-[#00FF94]/20 rounded-lg border border-[#00FF94]/30" />
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -right-6 bg-[#18181B] p-4 rounded-xl border border-white/10 shadow-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#00FF94]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Status</div>
                  <div className="text-sm font-bold text-white">Confirmed</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">
            Start your collection.
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join the platform transforming how high-end tattoo art is discovered and collected.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/artists">
              <Button className="h-14 px-10 bg-[#00FF94] text-black hover:bg-[#00FF94] hover:scale-105 font-bold text-lg rounded-xl shadow-lg shadow-[#00FF94]/20 transition-all">
                Find an Artist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-white/5 bg-[#050505] py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
            <img src="/logo-altus.png" alt="A" className="h-6 w-auto" />
            <span className="text-sm font-medium tracking-wide">ALTUS INK © 2025</span>
          </div>

          <div className="flex gap-8 text-sm text-gray-500 font-medium">
            <Link href="/privacy"><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></Link>
            <Link href="/terms"><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></Link>
            <Link href="/support"><span className="hover:text-white transition-colors cursor-pointer">Concierge Support</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
