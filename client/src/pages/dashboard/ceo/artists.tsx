import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Instagram,
  Calendar,
  DollarSign,
  Clock,
} from "lucide-react";
import type { Artist, User } from "@shared/schema";

interface ArtistWithUser extends Artist {
  user?: User;
}

export default function CEOArtists() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<ArtistWithUser | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role !== "ceo") {
      window.location.href = "/";
    }
  }, [user, isAuthenticated, authLoading]);

  const { data: artists, isLoading: artistsLoading } = useQuery<ArtistWithUser[]>({
    queryKey: ["/api/ceo/artists"],
    enabled: isAuthenticated && user?.role === "ceo",
  });

  const approveMutation = useMutation({
    mutationFn: async (artistId: string) => {
      return apiRequest("POST", `/api/ceo/artists/${artistId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ceo/artists"] });
      setSelectedArtist(null);
      toast({ title: "Artist approved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to approve artist", variant: "destructive" });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (artistId: string) => {
      return apiRequest("POST", `/api/ceo/artists/${artistId}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ceo/artists"] });
      setSelectedArtist(null);
      toast({ title: "Artist deactivated" });
    },
    onError: () => {
      toast({ title: "Failed to deactivate artist", variant: "destructive" });
    },
  });

  if (authLoading || artistsLoading) {
    return (
      <DashboardLayout title="Artists">
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  const filteredArtists = artists?.filter((artist) =>
    artist.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const pendingArtists = filteredArtists.filter((a) => !a.isApproved);
  const activeArtists = filteredArtists.filter((a) => a.isApproved && a.isActive);
  const inactiveArtists = filteredArtists.filter((a) => a.isApproved && !a.isActive);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const ArtistCard = ({ artist }: { artist: ArtistWithUser }) => (
    <Card
      className="hover-elevate cursor-pointer"
      onClick={() => setSelectedArtist(artist)}
      data-testid={`artist-card-${artist.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={artist.coverImageUrl || undefined} />
            <AvatarFallback>{getInitials(artist.displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold truncate">{artist.displayName}</p>
              {artist.isApproved ? (
                <CheckCircle2 className="w-4 h-4 text-chart-4 flex-shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-chart-5 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              @{artist.subdomain}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>€{artist.depositAmount}</span>
              <span>{artist.currency}</span>
              {artist.instagram && (
                <span className="flex items-center gap-1">
                  <Instagram className="w-3 h-3" />
                  {artist.instagram}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Manage Artists" subtitle="Review and manage your artist collective">
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-artists"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingArtists.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {pendingArtists.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Active ({activeArtists.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveArtists.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-chart-4 mx-auto mb-3" />
                <p className="font-medium">All Caught Up</p>
                <p className="text-sm text-muted-foreground">
                  No pending artist applications to review.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active">
          {activeArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No active artists</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inactive">
          {inactiveArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No inactive artists</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Artist Detail Dialog */}
      <Dialog open={!!selectedArtist} onOpenChange={() => setSelectedArtist(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Artist Details</DialogTitle>
          </DialogHeader>
          {selectedArtist && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedArtist.coverImageUrl || undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedArtist.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedArtist.displayName}</h3>
                  <p className="text-sm text-muted-foreground">@{selectedArtist.subdomain}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={selectedArtist.isApproved ? "default" : "secondary"}>
                      {selectedArtist.isApproved ? "Approved" : "Pending"}
                    </Badge>
                    {selectedArtist.isActive ? (
                      <Badge variant="outline">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>

              {selectedArtist.bio && (
                <div>
                  <p className="text-sm font-medium mb-1">Bio</p>
                  <p className="text-sm text-muted-foreground">{selectedArtist.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Deposit</p>
                  <p className="font-medium">
                    {selectedArtist.currency} {selectedArtist.depositAmount}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Timezone</p>
                  <p className="font-medium">{selectedArtist.timezone}</p>
                </div>
                {selectedArtist.instagram && (
                  <div>
                    <p className="text-muted-foreground">Instagram</p>
                    <p className="font-medium flex items-center gap-1">
                      <Instagram className="w-3 h-3" />
                      @{selectedArtist.instagram}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Tour Mode</p>
                  <p className="font-medium">
                    {selectedArtist.tourModeEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                {!selectedArtist.isApproved ? (
                  <Button
                    className="flex-1"
                    onClick={() => approveMutation.mutate(selectedArtist.id)}
                    disabled={approveMutation.isPending}
                    data-testid="button-approve-artist"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Artist
                  </Button>
                ) : selectedArtist.isActive ? (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => deactivateMutation.mutate(selectedArtist.id)}
                    disabled={deactivateMutation.isPending}
                    data-testid="button-deactivate-artist"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => approveMutation.mutate(selectedArtist.id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Reactivate
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <a href={`/book/${selectedArtist.subdomain}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Page
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
