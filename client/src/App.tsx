import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";

// Artist Dashboard Pages
import ArtistDashboard from "@/pages/dashboard/artist/index";
import ArtistCalendar from "@/pages/dashboard/artist/calendar";
import ArtistEarnings from "@/pages/dashboard/artist/earnings";
import ArtistTour from "@/pages/dashboard/artist/tour";
import ArtistPersonalize from "@/pages/dashboard/artist/personalize";
import ArtistSettings from "@/pages/dashboard/artist/settings";
import ArtistPortfolio from "@/pages/dashboard/artist/portfolio";

// CEO Dashboard Pages
import CEODashboard from "@/pages/dashboard/ceo/index";
import CEOArtists from "@/pages/dashboard/ceo/artists";
import CEOFinancial from "@/pages/dashboard/ceo/financial";
import CEOBookings from "@/pages/dashboard/ceo/bookings";
import CEOReports from "@/pages/dashboard/ceo/reports";
import CEOSettings from "@/pages/dashboard/ceo/settings";

// Public Pages
import BookingPage from "@/pages/book/index";
import LoginPage from "@/pages/login";

// Layout Components
import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import WhatsAppFloat from "@/components/whatsapp-float";
import { LanguageSelector } from "@/components/language-selector";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/api/login" />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Landing Page - Always the entry point */}
      <Route path="/" component={Landing} />
      
      {/* Login Page */}
      <Route path="/login" component={LoginPage} />
      
      {/* Public Booking Pages - Always accessible */}
      <Route path="/book/:subdomain" component={BookingPage} />
      
      {/* Protected Artist Dashboard Routes */}
      <Route path="/dashboard/artist">
        {() => <ProtectedRoute component={ArtistDashboard} />}
      </Route>
      <Route path="/dashboard/artist/calendar">
        {() => <ProtectedRoute component={ArtistCalendar} />}
      </Route>
      <Route path="/dashboard/artist/earnings">
        {() => <ProtectedRoute component={ArtistEarnings} />}
      </Route>
      <Route path="/dashboard/artist/tour">
        {() => <ProtectedRoute component={ArtistTour} />}
      </Route>
      <Route path="/dashboard/artist/personalize">
        {() => <ProtectedRoute component={ArtistPersonalize} />}
      </Route>
      <Route path="/dashboard/artist/settings">
        {() => <ProtectedRoute component={ArtistSettings} />}
      </Route>
      <Route path="/dashboard/artist/portfolio">
        {() => <ProtectedRoute component={ArtistPortfolio} />}
      </Route>
      
      {/* Protected CEO Dashboard Routes */}
      <Route path="/dashboard/ceo">
        {() => <ProtectedRoute component={CEODashboard} />}
      </Route>
      <Route path="/dashboard/ceo/artists">
        {() => <ProtectedRoute component={CEOArtists} />}
      </Route>
      <Route path="/dashboard/ceo/bookings">
        {() => <ProtectedRoute component={CEOBookings} />}
      </Route>
      <Route path="/dashboard/ceo/financial">
        {() => <ProtectedRoute component={CEOFinancial} />}
      </Route>
      <Route path="/dashboard/ceo/reports">
        {() => <ProtectedRoute component={CEOReports} />}
      </Route>
      <Route path="/dashboard/ceo/settings">
        {() => <ProtectedRoute component={CEOSettings} />}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <TooltipProvider>
          <LanguageSelector />
          <Navigation />
          <main className="pt-20 pb-20 md:pb-0">
            <Router />
          </main>
          <MobileNav />
          <WhatsAppFloat />
          <Toaster />
        </TooltipProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}

export default App;
