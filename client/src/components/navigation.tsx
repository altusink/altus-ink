import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { LogoCompact } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function Navigation() {
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();
  const [location] = useLocation();

  const isBookingPage = location.startsWith("/book/");
  const isDashboard = location.startsWith("/dashboard");

  if (isBookingPage || isDashboard) return null;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
          <LogoCompact />
          <span className="text-xl font-bold text-white hidden sm:block">ALTUS INK</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-zinc-400 hover:text-white transition" data-testid="nav-home">
            {t.common.home}
          </Link>
          <Link href="/book/demo" className="text-zinc-400 hover:text-white transition" data-testid="nav-book">
            {t.common.bookNow}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <Link href="/dashboard/artist" className="text-zinc-400 hover:text-white hidden sm:inline" data-testid="nav-dashboard">
                {t.common.dashboard}
              </Link>
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                {t.common.logout}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-black"
                onClick={() => window.location.href = "/login"}
                data-testid="button-login"
              >
                {t.common.login}
              </Button>
              <Button
                className="bg-gold hover:bg-gold-light text-black font-bold px-6"
                onClick={() => {
                  const artistSection = document.getElementById("artists");
                  if (artistSection) {
                    artistSection.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = "/book/demo";
                  }
                }}
                data-testid="button-book-now"
              >
                {t.common.bookNow}
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
