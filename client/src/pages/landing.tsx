import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/useLocale";
import { LogIn, Users, Sparkles } from "lucide-react";

// Floating 3D elements - tattoo-related SVG shapes
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1]
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

// Tattoo-themed floating decorations
const TattooDecoration = ({ type, color, size = 60 }: { type: string; color: string; size?: number }) => {
  const shapes: Record<string, React.ReactNode> = {
    ink: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" fill={`url(#gradient-${color})`} opacity="0.6" />
        <defs>
          <radialGradient id={`gradient-${color}`}>
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>
    ),
    needle: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <line x1="20" y1="80" x2="80" y2="20" stroke={color} strokeWidth="3" opacity="0.5" />
        <circle cx="80" cy="20" r="5" fill={color} opacity="0.7" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path
          d="M50 10 L61 40 L95 40 L68 60 L79 90 L50 72 L21 90 L32 60 L5 40 L39 40 Z"
          fill={color}
          opacity="0.4"
        />
      </svg>
    ),
    diamond: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path
          d="M50 5 L95 50 L50 95 L5 50 Z"
          stroke={color}
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
      </svg>
    ),
    circle: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="35" stroke={color} strokeWidth="2" fill="none" opacity="0.4" />
        <circle cx="50" cy="50" r="20" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
      </svg>
    )
  };

  return shapes[type] || null;
};

export default function Landing() {
  const { t } = useLocale();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Floating 3D Elements Background */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: "transform 0.3s ease-out"
        }}
      >
        <FloatingElement x={10} y={20} delay={0} duration={5}>
          <TattooDecoration type="ink" color="#00D4FF" size={80} />
        </FloatingElement>
        <FloatingElement x={85} y={15} delay={1} duration={4}>
          <TattooDecoration type="star" color="#FFD700" size={60} />
        </FloatingElement>
        <FloatingElement x={75} y={70} delay={2} duration={6}>
          <TattooDecoration type="diamond" color="#7B2FFF" size={70} />
        </FloatingElement>
        <FloatingElement x={15} y={65} delay={1.5} duration={5}>
          <TattooDecoration type="needle" color="#00FF88" size={90} />
        </FloatingElement>
        <FloatingElement x={50} y={80} delay={0.5} duration={4}>
          <TattooDecoration type="circle" color="#FF3366" size={50} />
        </FloatingElement>
        <FloatingElement x={30} y={10} delay={2.5} duration={5}>
          <TattooDecoration type="ink" color="#7B2FFF" size={40} />
        </FloatingElement>
        <FloatingElement x={60} y={30} delay={3} duration={6}>
          <TattooDecoration type="star" color="#00D4FF" size={45} />
        </FloatingElement>
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <img
            src="/logo-altus.png"
            alt="ALTUS INK"
            className="h-24 md:h-32 w-auto drop-shadow-2xl"
          />
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 tracking-tight">
            E aí! 👋
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto">
            Sua próxima tattoo começa aqui.
            <br />
            <span className="text-primary">Arte na pele, sem stress.</span>
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
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-neon-cyan"
            >
              <Users className="w-5 h-5 mr-2" />
              Artistas
            </Button>
          </Link>

          <Link href="/artists" className="flex-1">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-14 text-lg font-bold border-2 border-gold text-gold hover:bg-gold hover:text-foreground transition-all duration-300 rounded-2xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Ver Portfólio
            </Button>
          </Link>
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8"
        >
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Subtle Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
