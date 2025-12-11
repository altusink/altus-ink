import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  MapPin,
  Plus,
  Calendar,
  Lock,
  Unlock,
  Trash2,
  Globe,
} from "lucide-react";
import type { CitySchedule, Artist } from "@shared/schema";

const cityScheduleSchema = z.object({
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  fullAddress: z.string().min(5, "Full address is required"),
  venueName: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type CityScheduleFormData = z.infer<typeof cityScheduleSchema>;

export default function ArtistTour() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);

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

  const { data: artist } = useQuery<Artist>({
    queryKey: ["/api/artist/me"],
    enabled: isAuthenticated,
  });

  const { data: citySchedules, isLoading: schedulesLoading } = useQuery<CitySchedule[]>({
    queryKey: ["/api/artist/city-schedules"],
    enabled: isAuthenticated,
  });

  const form = useForm<CityScheduleFormData>({
    resolver: zodResolver(cityScheduleSchema),
    defaultValues: {
      city: "",
      country: "",
      fullAddress: "",
      venueName: "",
      startDate: "",
      endDate: "",
    },
  });

  const toggleTourModeMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest("PATCH", "/api/artist/me", { tourModeEnabled: enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artist/me"] });
      toast({ title: "Tour mode updated" });
    },
    onError: () => {
      toast({ title: "Failed to update tour mode", variant: "destructive" });
    },
  });

  const addScheduleMutation = useMutation({
    mutationFn: async (data: CityScheduleFormData) => {
      return apiRequest("POST", "/api/artist/city-schedules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artist/city-schedules"] });
      setShowAddDialog(false);
      form.reset();
      toast({ title: "City schedule added" });
    },
    onError: () => {
      toast({ title: "Failed to add schedule", variant: "destructive" });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/artist/city-schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artist/city-schedules"] });
      toast({ title: "Schedule removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove schedule", variant: "destructive" });
    },
  });

  const onSubmit = (data: CityScheduleFormData) => {
    addScheduleMutation.mutate(data);
  };

  if (authLoading || schedulesLoading) {
    return (
      <DashboardLayout title="Tour Mode">
        <Skeleton className="h-48 w-full" />
      </DashboardLayout>
    );
  }

  const upcomingSchedules = citySchedules?.filter(
    (s) => new Date(s.endDate) >= new Date()
  ) || [];

  const pastSchedules = citySchedules?.filter(
    (s) => new Date(s.endDate) < new Date()
  ) || [];

  return (
    <DashboardLayout title="Tour Mode" subtitle="Manage your travel schedule and guest spots">
      {/* Tour Mode Toggle */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Tour Mode</p>
                <p className="text-sm text-muted-foreground">
                  When enabled, clients will see city schedules instead of your home location.
                  Address is hidden until payment.
                </p>
              </div>
            </div>
            <Switch
              checked={artist?.tourModeEnabled ?? false}
              onCheckedChange={(checked) => toggleTourModeMutation.mutate(checked)}
              data-testid="switch-tour-mode"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Privacy Info */}
      <Card className="mb-6 border-chart-5/30 bg-chart-5/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-chart-5 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Address Privacy</p>
            <p className="text-xs text-muted-foreground">
              When Tour Mode is enabled, your venue address is hidden from clients until they complete payment.
              This protects your location while traveling.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* City Schedules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <CardTitle className="text-base">City Schedules</CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-city">
                <Plus className="w-4 h-4 mr-1" />
                Add City
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add City Schedule</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Berlin" {...field} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Germany" {...field} data-testid="input-country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="venueName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Tattoo Studio Berlin" {...field} data-testid="input-venue" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fullAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="123 Artist Street, 10115 Berlin, Germany"
                            {...field}
                            data-testid="input-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-start-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-end-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={addScheduleMutation.isPending}
                    data-testid="button-save-city"
                  >
                    {addScheduleMutation.isPending ? "Adding..." : "Add Schedule"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {upcomingSchedules.length > 0 ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming</h3>
                <div className="space-y-3">
                  {upcomingSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-4 rounded-lg border flex items-start justify-between gap-4"
                      data-testid={`schedule-item-${schedule.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {schedule.city}, {schedule.country}
                          </p>
                          {schedule.venueName && (
                            <p className="text-sm text-muted-foreground">{schedule.venueName}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(schedule.startDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                              {" - "}
                              {new Date(schedule.endDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                        data-testid={`button-delete-${schedule.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {pastSchedules.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Past</h3>
                  <div className="space-y-3 opacity-60">
                    {pastSchedules.slice(0, 3).map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-4 rounded-lg border flex items-start gap-3"
                      >
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {schedule.city}, {schedule.country}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(schedule.startDate).toLocaleDateString()} -{" "}
                            {new Date(schedule.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No city schedules yet. Add your travel plans to enable bookings while on tour.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(true)}
                data-testid="button-add-first-city"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Your First City
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
