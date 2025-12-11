import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
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
} from "lucide-react";
import { SiInstagram, SiTiktok } from "react-icons/si";

export default function Landing() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Ambient Light Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-[100px]" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
              border border-gold/30 bg-gold/5 mb-8"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gold text-sm font-medium">{t.hero.badge}</span>
          </motion.div>
          
          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            <span className="text-white">{t.hero.headline}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold">
              {t.hero.headlineHighlight}
            </span>
            <span className="text-white">{t.hero.headlineEnd}</span>
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
            {/* Primary CTA - Neon Gold */}
            <Link href="/book/demo">
              <Button 
                size="lg"
                className="group relative px-10 py-6 rounded-2xl font-bold text-lg
                  bg-gradient-to-r from-gold to-gold-light text-black
                  shadow-[0_0_30px_rgba(201,162,39,0.3)]
                  hover:shadow-[0_0_50px_rgba(201,162,39,0.5)]
                  transition-all duration-300 hover:-translate-y-1 h-auto"
                data-testid="button-hero-cta"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.hero.cta}
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
              <Shield className="w-4 h-4" />
              <span className="text-sm">{t.hero.securePayment}</span>
            </div>
            <div className="w-px h-4 bg-zinc-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-gold text-gold" />
              <span className="text-sm">{t.hero.reviews}</span>
            </div>
            <div className="w-px h-4 bg-zinc-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
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

      {/* Features Section */}
      <section className="py-24 px-6 bg-card/30 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-gold/5 to-transparent blur-3xl" />
        
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
              className="text-4xl md:text-5xl font-bold text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why Choose ALTUS INK
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Real-Time Booking",
                description: "See live availability and secure your preferred time slot instantly with our 10-minute lock system."
              },
              {
                icon: Shield,
                title: "Secure Deposits",
                description: "Non-refundable deposits protect both clients and artists. 90-day retention ensures commitment."
              },
              {
                icon: Globe,
                title: "Tour Mode",
                description: "Follow your favorite artists on tour. Book sessions in different cities as they travel."
              },
              {
                icon: CreditCard,
                title: "Easy Payments",
                description: "Pay securely with Stripe. Support for cards, Apple Pay, Google Pay, and PIX."
              },
              {
                icon: Users,
                title: "Elite Artists",
                description: "Hand-picked, internationally recognized tattoo artists from around the world."
              },
              {
                icon: Sparkles,
                title: "Portfolio Gallery",
                description: "Browse high-quality portfolios organized by style and category."
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50 hover:border-gold/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-gold" />
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
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Inked?
            </h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              Join thousands of satisfied clients who have transformed their vision into permanent art.
            </p>
            <Link href="/book/demo">
              <Button 
                size="lg"
                className="px-12 py-6 rounded-2xl font-bold text-lg
                  bg-gradient-to-r from-gold to-gold-light text-black
                  shadow-[0_0_30px_rgba(201,162,39,0.3)]
                  hover:shadow-[0_0_50px_rgba(201,162,39,0.5)]
                  transition-all duration-300 hover:-translate-y-1 h-auto"
                data-testid="button-cta-bottom"
              >
                {t.common.bookNow}
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
              <Logo size="lg" className="mb-6" />
              <p className="text-zinc-400 max-w-md mb-6 leading-relaxed">
                Connecting you with the best tattoo artists in Europe. 
                Premium body art with simplified booking and secure payments.
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
                <li><Link href="/book/demo" className="text-zinc-400 hover:text-gold transition-colors">{t.common.bookNow}</Link></li>
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
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800">
                    <CreditCard className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs text-zinc-400">Stripe</span>
                  </div>
                </div>
              </div>
              
              {/* Certifications */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-zinc-400">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800">
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
