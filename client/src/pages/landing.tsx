import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Shield, 
  Sparkles, 
  Globe, 
  Users,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass bg-black/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                ALTUSINK<span className="text-primary">.IO</span>
              </span>
            </div>
            <Button 
              data-testid="button-login"
              onClick={() => window.location.href = "/api/login"}
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F59E0B' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Star className="w-3 h-3 mr-1" />
              Premium Tattoo Booking Platform
            </Badge>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Book World-Class{" "}
              <span className="text-primary">Tattoo Artists</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with elite tattoo artists from the Altus Ink collective. 
              Secure your appointment with real-time availability and instant booking.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                data-testid="button-get-started"
                onClick={() => window.location.href = "/api/login"}
                className="h-14 px-8 text-base font-semibold"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                data-testid="button-learn-more"
                className="h-14 px-8 text-base font-semibold"
              >
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Verified Artists</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>International Tours</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Why Choose ALTUSINK
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A premium booking experience designed for discerning clients and world-class artists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Real-Time Booking</h3>
                <p className="text-muted-foreground">
                  See live availability and secure your preferred time slot instantly with our 10-minute lock system.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Flexible Scheduling</h3>
                <p className="text-muted-foreground">
                  Artists set their own availability. Book sessions that fit your schedule across multiple time zones.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Tour Mode</h3>
                <p className="text-muted-foreground">
                  Follow your favorite artists on tour. Book sessions in cities worldwide with secure location reveal.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Secure Deposits</h3>
                <p className="text-muted-foreground">
                  Protected payments through Stripe. Non-refundable deposits ensure commitment from both parties.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Curated Artists</h3>
                <p className="text-muted-foreground">
                  Every artist is personally vetted and approved by the Altus Ink collective for quality assurance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Premium Experience</h3>
                <p className="text-muted-foreground">
                  From booking to aftercare, enjoy a seamless journey with email and WhatsApp notifications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 md:p-12 lg:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-card/50" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to Book Your Next Tattoo?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of clients who trust ALTUSINK.IO for their tattoo journey. 
                Sign in to explore our artist collective.
              </p>
              <Button 
                size="lg" 
                data-testid="button-cta-signin"
                onClick={() => window.location.href = "/api/login"}
                className="h-14 px-8 text-base font-semibold"
              >
                Sign In Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 safe-bottom">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-display text-sm font-semibold">
                ALTUSINK.IO
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              A premium private platform by Altus Ink
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
