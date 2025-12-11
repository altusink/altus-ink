import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";

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

// Public Pages
import BookingPage from "@/pages/book/index";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Booking Pages - Always accessible */}
      <Route path="/book/:subdomain" component={BookingPage} />
      
      {/* Auth-dependent routes */}
      {!isAuthenticated ? (
        // Logged out routes
        <Route path="/" component={Landing} />
      ) : (
        // Logged in routes
        <>
          <Route path="/" component={Home} />
          
          {/* Artist Dashboard Routes */}
          <Route path="/dashboard/artist" component={ArtistDashboard} />
          <Route path="/dashboard/artist/calendar" component={ArtistCalendar} />
          <Route path="/dashboard/artist/earnings" component={ArtistEarnings} />
          <Route path="/dashboard/artist/tour" component={ArtistTour} />
          <Route path="/dashboard/artist/personalize" component={ArtistPersonalize} />
          <Route path="/dashboard/artist/settings" component={ArtistSettings} />
          <Route path="/dashboard/artist/portfolio" component={ArtistPortfolio} />
          
          {/* CEO Dashboard Routes */}
          <Route path="/dashboard/ceo" component={CEODashboard} />
          <Route path="/dashboard/ceo/artists" component={CEOArtists} />
          <Route path="/dashboard/ceo/bookings" component={CEODashboard} />
          <Route path="/dashboard/ceo/financial" component={CEOFinancial} />
          <Route path="/dashboard/ceo/reports" component={CEODashboard} />
          <Route path="/dashboard/ceo/settings" component={CEODashboard} />
        </>
      )}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
