import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/useLocale";
import {
  LogIn,
  Users,
  Sparkles,
  Shield,
  Calendar,
  Globe,
  ChevronDown,
  Star,
  Clock
} from "lucide-react";

// Language selector modal
const LanguageModal = ({ isOpen, onClose, onSelect }: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lang: string) => void;
}) => {
  const languages = [
    { code: "pt", label: "Português", flag: "🇧🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "es", label: "Español", flag: "🇪🇸" },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-center mb-2">E aí! 👋</h2>
        <p className="text-muted-foreground text-center mb-6">Escolhe seu idioma</p>

        <div className="space-y-3">
          {languages.map((lang) => (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSelect(lang.code);
                onClose();
              }}
              className="w-full p-4 rounded-2xl bg-muted hover:bg-primary/20 border border-border hover:border-primary/50 transition-all flex items-center gap-4"
            >
              <span className="text-3xl">{lang.flag}</span>
              <span className="text-lg font-medium">{lang.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Floating tattoo-themed decorations
const FloatingElement = ({
  children,
  delay = 0,
  duration = 4,
  x = 0,
  y = 0
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0.4, 0.7, 0.4],
        y: [0, -15, 0],
        rotate: [0, 3, -3, 0],
        scale: [1, 1.03, 1]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Tattoo machine icon
const TattooMachine = ({ color, size = 80 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" opacity="0.5">
    <rect x="35" y="20" width="30" height="50" rx="4" stroke={color} strokeWidth="2" fill="none" />
    <line x1="50" y1="70" x2="50" y2="90" stroke={color} strokeWidth="3" />
    <circle cx="50" cy="35" r="8" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

// Ink drop
const InkDrop = ({ color, size = 60 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path
      d="M50 10 C50 10 20 50 20 65 C20 85 35 95 50 95 C65 95 80 85 80 65 C80 50 50 10 50 10Z"
      fill={color}
      opacity="0.3"
    />
  </svg>
);

// Star burst
const StarBurst = ({ color, size = 50 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path
      d="M50 5 L58 40 L95 50 L58 60 L50 95 L42 60 L5 50 L42 40 Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
      opacity="0.5"
    />
  </svg>
);

export default function Landing() {
  const { t, setLocale } = useLocale();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Check if language was already selected
  useEffect(() => {
    const savedLang = localStorage.getItem("altus-locale");
    if (!savedLang) {
      // Show language modal on first visit
      setTimeout(() => setShowLanguageModal(true), 500);
    }
  }, []);

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleLanguageSelect = (lang: string) => {
    setLocale(lang as any);
    localStorage.setItem("altus-locale", lang);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Language Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <LanguageModal
            isOpen={showLanguageModal}
            onClose={() => setShowLanguageModal(false)}
            onSelect={handleLanguageSelect}
          />
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="min-h-screen relative flex flex-col">
        {/* Floating 3D Elements Background */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: "transform 0.3s ease-out"
          }}
        >
          <FloatingElement x={8} y={15} delay={0} duration={5}>
            <TattooMachine color="#00FF85" size={100} />
          </FloatingElement>
          <FloatingElement x={85} y={12} delay={1} duration={4}>
            <InkDrop color="#1E90FF" size={70} />
          </FloatingElement>
          <FloatingElement x={78} y={65} delay={2} duration={6}>
            <StarBurst color="#FFD700" size={60} />
          </FloatingElement>
          <FloatingElement x={12} y={70} delay={1.5} duration={5}>
            <InkDrop color="#FF0080" size={80} />
          </FloatingElement>
          <FloatingElement x={45} y={85} delay={0.5} duration={4}>
            <StarBurst color="#00FF85" size={40} />
          </FloatingElement>
          <FloatingElement x={25} y={8} delay={2.5} duration={5}>
            <InkDrop color="#A855F7" size={50} />
          </FloatingElement>
          <FloatingElement x={65} y={25} delay={3} duration={6}>
            <TattooMachine color="#1E90FF" size={70} />
          </FloatingElement>
        </div>

        {/* Nav */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-4">
          <Link href="/">
            <img src="/logo-altus.png" alt="ALTUS INK" className="h-10 w-auto" />
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          </Link>
        </nav>

        {/* Main Content - Centered */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <img
              src="/logo-altus.png"
              alt="ALTUS INK"
              className="h-20 md:h-28 w-auto drop-shadow-2xl"
            />
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 tracking-tight">
              E aí! 👋
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto">
              Sua próxima tattoo começa aqui.
              <br />
              <span className="text-primary font-semibold">Arte na pele, sem stress.</span>
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
          >
            <Link href="/artists" className="flex-1">
              <Button
                size="lg"
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 rounded-2xl shadow-lg hover:shadow-neon-green"
              >
                <Users className="w-5 h-5 mr-2" />
                Artistas
              </Button>
            </Link>

            <Link href="/artists" className="flex-1">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-lg font-bold border-2 border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 rounded-2xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Ver Portfólio
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center text-muted-foreground"
          >
            <span className="text-sm mb-2">Rola pra baixo</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que a ALTUS? 🔥
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A gente conecta você com os melhores tatuadores do mundo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Artistas Internacionais",
                description: "Talentos de Portugal, Brasil, Espanha e mais",
                color: "primary"
              },
              {
                icon: Shield,
                title: "Pagamento Seguro",
                description: "Depósito protegido até sua sessão",
                color: "gold"
              },
              {
                icon: Calendar,
                title: "Agenda Fácil",
                description: "Escolhe a cidade, data e hora em segundos",
                color: "secondary"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8 rounded-3xl bg-background/50 border border-border hover:border-primary/30 transition-colors"
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-${feature.color}/20 flex items-center justify-center`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50+", label: "Artistas", icon: Users },
              { value: "1000+", label: "Tattoos feitas", icon: Star },
              { value: "4.9", label: "Avaliação média", icon: Star },
              { value: "24h", label: "Resposta rápida", icon: Clock }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
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

      {/* CTA FINAL */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Bora marcar? 🚀
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Escolhe teu artista e agenda em minutos
            </p>
            <Link href="/artists">
              <Button
                size="lg"
                className="h-16 px-10 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg hover:shadow-neon-green"
              >
                <Users className="w-6 h-6 mr-3" />
                Ver Artistas
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-altus.png" alt="ALTUS INK" className="h-8 w-auto" />
            <span className="text-muted-foreground">© 2024 ALTUS INK</span>
          </div>

          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacidade
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Termos
            </Link>
            <Link href="/cancellation" className="text-muted-foreground hover:text-primary transition-colors">
              Cancelamento
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
