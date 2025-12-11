import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Eye,
  Instagram,
  Link as LinkIcon,
  Check,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";
import type { Artist } from "@shared/schema";

const THEME_COLORS = [
  { name: "Amber", value: "#F59E0B" },
  { name: "Orange", value: "#F97316" },
  { name: "Red", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Emerald", value: "#10B981" },
];

const personalizeSchema = z.object({
  displayName: z.string().min(2, "Display name is required"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  instagram: z.string().optional(),
  themeColor: z.string(),
  subdomain: z.string().min(3, "Subdomain must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed"),
});

type PersonalizeFormData = z.infer<typeof personalizeSchema>;

export default function ArtistPersonalize() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: ["/api/artist/me"],
    enabled: isAuthenticated,
  });

  const form = useForm<PersonalizeFormData>({
    resolver: zodResolver(personalizeSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      instagram: "",
      themeColor: "#F59E0B",
      subdomain: "",
    },
  });

  useEffect(() => {
    if (artist) {
      form.reset({
        displayName: artist.displayName,
        bio: artist.bio || "",
        instagram: artist.instagram || "",
        themeColor: artist.themeColor || "#F59E0B",
        subdomain: artist.subdomain,
      });
    }
  }, [artist, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: PersonalizeFormData) => {
      return apiRequest("PATCH", "/api/artist/me", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artist/me"] });
      toast({ title: "Profile updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const onSubmit = (data: PersonalizeFormData) => {
    updateMutation.mutate(data);
  };

  if (authLoading || artistLoading) {
    return (
      <DashboardLayout title="Personalize">
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  const selectedColor = form.watch("themeColor");

  return (
    <DashboardLayout title="Personalize" subtitle="Customize your booking page appearance">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Artist Name" {...field} data-testid="input-display-name" />
                        </FormControl>
                        <FormDescription>
                          This is how clients will see your name on your booking page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subdomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking Page URL</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="yourname"
                              {...field}
                              data-testid="input-subdomain"
                              className="flex-1"
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              .altusink.io
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Your unique booking page URL. Only lowercase letters, numbers, and hyphens.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell clients about your style, experience, and what makes your work unique..."
                            rows={4}
                            {...field}
                            data-testid="input-bio"
                          />
                        </FormControl>
                        <FormDescription>
                          {(field.value?.length || 0)}/500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram Handle</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="yourusername"
                              {...field}
                              data-testid="input-instagram"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Without the @ symbol. This will be shown on your booking page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="themeColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme Color</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                            {THEME_COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => field.onChange(color.value)}
                                className={`
                                  w-full aspect-square rounded-lg border-2 transition-all
                                  ${field.value === color.value
                                    ? "border-foreground scale-110"
                                    : "border-transparent hover:scale-105"
                                  }
                                `}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                                data-testid={`color-${color.name.toLowerCase()}`}
                              >
                                {field.value === color.value && (
                                  <Check className="w-4 h-4 text-white mx-auto" />
                                )}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          This color will be used as the accent on your booking page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    {artist?.isApproved && (
                      <Button variant="outline" asChild>
                        <Link href={`/book/${artist.subdomain}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Page
                        </Link>
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: selectedColor + "40" }}
              >
                {/* Mini Preview Header */}
                <div
                  className="h-16 relative"
                  style={{ backgroundColor: selectedColor + "20" }}
                >
                  <div
                    className="absolute bottom-0 left-4 transform translate-y-1/2"
                  >
                    <div
                      className="w-12 h-12 rounded-full border-2 bg-muted"
                      style={{ borderColor: selectedColor }}
                    />
                  </div>
                </div>

                <div className="pt-8 pb-4 px-4">
                  <p className="font-semibold text-sm">
                    {form.watch("displayName") || "Your Name"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {form.watch("subdomain") || "yourname"}.altusink.io
                  </p>

                  {form.watch("bio") && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {form.watch("bio")}
                    </p>
                  )}

                  <Button
                    size="sm"
                    className="w-full mt-4 text-xs"
                    style={{ backgroundColor: selectedColor }}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Your Booking Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-muted text-sm font-mono break-all">
                {form.watch("subdomain") || "yourname"}.altusink.io
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this link with clients to accept bookings.
              </p>
              {artist?.isApproved && (
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <a
                    href={`/book/${artist.subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Booking Page
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
