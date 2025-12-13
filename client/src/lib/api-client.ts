/**
 * ALTUS INK - API CLIENT
 * Complete type-safe API client with React Query hooks
 * 
 * Features:
 * - Type-safe API calls
 * - React Query integration
 * - Error handling
 * - Request/response interceptors
 * - Automatic retry
 * - Optimistic updates
 * - Cache management
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import type {
    Artist,
    Booking,
    User,
    Payment,
    Payout,
    ArtistStats,
    PlatformStats,
    EarningsSummary,
    TimeSlotAvailability,
    DayAvailability,
    TattooSize,
    CancellationPolicy,
    Currency,
    BookingStatus,
    PaymentStatus,
    WorkingHours
} from "@shared/types";

// =============================================================================
// API CONFIGURATION
// =============================================================================

const API_BASE_URL = "/api";

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
    meta?: {
        page?: number;
        perPage?: number;
        total?: number;
        hasMore?: boolean;
    };
}

interface PaginatedResponse<T> {
    items: T[];
    meta: {
        page: number;
        perPage: number;
        total: number;
        hasMore: boolean;
    };
}

// =============================================================================
// HTTP CLIENT
// =============================================================================

class HttpClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            credentials: "include",
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    message: `HTTP error ${response.status}`,
                }));
                throw new Error(error.message || `HTTP error ${response.status}`);
            }

            // Handle empty responses
            const text = await response.text();
            if (!text) return {} as T;

            return JSON.parse(text);
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const queryString = params
            ? "?" + new URLSearchParams(
                Object.entries(params)
                    .filter(([_, v]) => v !== undefined && v !== null)
                    .map(([k, v]) => [k, String(v)])
            ).toString()
            : "";
        return this.request<T>(`${endpoint}${queryString}`, { method: "GET" });
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }

    async upload<T>(endpoint: string, formData: FormData): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: `HTTP error ${response.status}`,
            }));
            throw new Error(error.message);
        }

        return response.json();
    }
}

export const api = new HttpClient(API_BASE_URL);

// =============================================================================
// QUERY KEYS
// =============================================================================

export const queryKeys = {
    // Auth
    auth: {
        user: ["auth", "user"] as const,
        session: ["auth", "session"] as const,
    },

    // Public
    public: {
        artists: (params?: ArtistListParams) => ["public", "artists", params] as const,
        artist: (username: string) => ["public", "artists", username] as const,
        availability: (artistId: string, date?: string) => ["public", "artists", artistId, "availability", date] as const,
    },

    // Bookings
    bookings: {
        all: ["bookings"] as const,
        list: (params?: BookingListParams) => ["bookings", "list", params] as const,
        detail: (id: string) => ["bookings", id] as const,
    },

    // Artist Dashboard
    artist: {
        profile: ["artist", "profile"] as const,
        stats: ["artist", "stats"] as const,
        bookings: (params?: BookingListParams) => ["artist", "bookings", params] as const,
        earnings: (period?: string) => ["artist", "earnings", period] as const,
        portfolio: ["artist", "portfolio"] as const,
        availability: ["artist", "availability"] as const,
        settings: ["artist", "settings"] as const,
    },

    // CEO Dashboard
    ceo: {
        stats: ["ceo", "stats"] as const,
        artists: (params?: ArtistListParams) => ["ceo", "artists", params] as const,
        bookings: (params?: BookingListParams) => ["ceo", "bookings", params] as const,
        financial: (period?: string) => ["ceo", "financial", period] as const,
        payouts: (params?: PayoutListParams) => ["ceo", "payouts", params] as const,
        reports: (type?: string) => ["ceo", "reports", type] as const,
    },

    // Balance
    balance: ["balance"] as const,
} as const;

// =============================================================================
// PARAMETER TYPES
// =============================================================================

export interface ArtistListParams {
    city?: string;
    style?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "rating" | "bookings" | "createdAt";
    sortOrder?: "asc" | "desc";
}

export interface BookingListParams {
    status?: BookingStatus | "all";
    artistId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: "date" | "createdAt" | "status";
    sortOrder?: "asc" | "desc";
}

export interface PayoutListParams {
    artistId?: string;
    status?: "pending" | "completed" | "failed";
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface CreateBookingInput {
    artistId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    slotDatetime: string;
    durationMinutes: number;
    notes?: string;
    referenceImages?: string[];
    tattooSize?: TattooSize;
    tattooPlacement?: string;
    locale?: string;
}

export interface UpdateArtistProfileInput {
    displayName?: string;
    bio?: string;
    specialty?: string;
    styles?: string[];
    city?: string;
    country?: string;
    instagram?: string;
    website?: string;
}

export interface UpdateArtistSettingsInput {
    timezone?: string;
    workingHours?: WorkingHours;
    bufferMinutes?: number;
    minAdvanceBookingHours?: number;
    maxAdvanceBookingDays?: number;
    cancellationPolicy?: CancellationPolicy;
    depositType?: "fixed" | "percentage";
    depositValue?: number;
    preferredCurrency?: Currency;
    languages?: string[];
}

// =============================================================================
// AUTH HOOKS
// =============================================================================

export function useCurrentUser(options?: Omit<UseQueryOptions<User | null>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.auth.user,
        queryFn: async () => {
            try {
                return await api.get<User>("/auth/user");
            } catch {
                return null;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => api.post("/auth/logout"),
        onSuccess: () => {
            queryClient.clear();
            window.location.href = "/";
        },
    });
}

// =============================================================================
// PUBLIC HOOKS
// =============================================================================

export function usePublicArtists(params?: ArtistListParams, options?: Omit<UseQueryOptions<Artist[]>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.public.artists(params),
        queryFn: () => api.get<Artist[]>("/public/artists", params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
}

export function usePublicArtist(username: string, options?: Omit<UseQueryOptions<Artist>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.public.artist(username),
        queryFn: () => api.get<Artist>(`/public/artists/${username}`),
        enabled: !!username,
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

export function useArtistAvailability(
    artistId: string,
    startDate?: string,
    endDate?: string,
    options?: Omit<UseQueryOptions<DayAvailability[]>, "queryKey" | "queryFn">
) {
    return useQuery({
        queryKey: queryKeys.public.availability(artistId, startDate),
        queryFn: () => api.get<DayAvailability[]>(`/public/artists/${artistId}/availability`, { startDate, endDate }),
        enabled: !!artistId,
        staleTime: 30 * 1000, // 30 seconds - availability changes frequently
        ...options,
    });
}

// =============================================================================
// BOOKING HOOKS
// =============================================================================

export function useCreateBooking(options?: UseMutationOptions<{ booking: Booking; checkoutUrl?: string }, Error, CreateBookingInput>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBookingInput) =>
            api.post<{ booking: Booking; checkoutUrl?: string }>("/bookings", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            queryClient.invalidateQueries({ queryKey: ["public", "artists"] });
        },
        ...options,
    });
}

export function useBooking(id: string, options?: Omit<UseQueryOptions<Booking>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.bookings.detail(id),
        queryFn: () => api.get<Booking>(`/bookings/${id}`),
        enabled: !!id,
        ...options,
    });
}

export function useCancelBooking(options?: UseMutationOptions<{ booking: Booking; refundAmount?: number }, Error, { id: string; reason?: string }>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }) =>
            api.post<{ booking: Booking; refundAmount?: number }>(`/bookings/${id}/cancel`, { reason }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
        ...options,
    });
}

export function useRescheduleBooking(options?: UseMutationOptions<Booking, Error, { id: string; newDatetime: string }>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, newDatetime }) =>
            api.post<Booking>(`/bookings/${id}/reschedule`, { newDatetime }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
        ...options,
    });
}

// =============================================================================
// ARTIST DASHBOARD HOOKS
// =============================================================================

export function useArtistProfile(options?: Omit<UseQueryOptions<Artist>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.artist.profile,
        queryFn: () => api.get<Artist>("/artist/profile"),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

export function useUpdateArtistProfile(options?: UseMutationOptions<Artist, Error, UpdateArtistProfileInput>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateArtistProfileInput) =>
            api.put<Artist>("/artist/profile", data),
        onSuccess: (data) => {
            queryClient.setQueryData(queryKeys.artist.profile, data);
        },
        ...options,
    });
}

export function useArtistStats(options?: Omit<UseQueryOptions<ArtistStats>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.artist.stats,
        queryFn: () => api.get<ArtistStats>("/artist/stats"),
        staleTime: 2 * 60 * 1000,
        ...options,
    });
}

export function useArtistBookings(params?: BookingListParams, options?: Omit<UseQueryOptions<Booking[]>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.artist.bookings(params),
        queryFn: () => api.get<Booking[]>("/artist/bookings", params),
        staleTime: 30 * 1000,
        ...options,
    });
}

export function useUpdateBookingStatus(options?: UseMutationOptions<Booking, Error, { id: string; status: BookingStatus }>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) =>
            api.put<Booking>(`/artist/bookings/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.artist.bookings() });
        },
        ...options,
    });
}

export function useArtistEarnings(period?: string, options?: Omit<UseQueryOptions<EarningsSummary>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.artist.earnings(period),
        queryFn: () => api.get<EarningsSummary>("/artist/earnings", { period }),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

export function useArtistPortfolio(options?: Omit<UseQueryOptions<any[]>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.artist.portfolio,
        queryFn: () => api.get<any[]>("/artist/portfolio"),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

export function useUploadPortfolioImage(options?: UseMutationOptions<any, Error, FormData>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) =>
            api.upload<any>("/artist/portfolio", formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.artist.portfolio });
        },
        ...options,
    });
}

export function useDeletePortfolioImage(options?: UseMutationOptions<void, Error, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (imageId: string) =>
            api.delete<void>(`/artist/portfolio/${imageId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.artist.portfolio });
        },
        ...options,
    });
}

export function useArtistSettings(options?: Omit<UseQueryOptions<UpdateArtistSettingsInput>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.artist.settings,
        queryFn: () => api.get<UpdateArtistSettingsInput>("/artist/settings"),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

export function useUpdateArtistSettings(options?: UseMutationOptions<UpdateArtistSettingsInput, Error, UpdateArtistSettingsInput>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateArtistSettingsInput) =>
            api.put<UpdateArtistSettingsInput>("/artist/settings", data),
        onSuccess: (data) => {
            queryClient.setQueryData(queryKeys.artist.settings, data);
        },
        ...options,
    });
}

export function useRequestPayout(options?: UseMutationOptions<{ payoutId: string; status: string }, Error, { amount: number; accountId: string }>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) =>
            api.post<{ payoutId: string; status: string }>("/artist/payouts/request", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.balance });
            queryClient.invalidateQueries({ queryKey: queryKeys.artist.earnings() });
        },
        ...options,
    });
}

// =============================================================================
// CEO DASHBOARD HOOKS
// =============================================================================

export function useCeoStats(options?: Omit<UseQueryOptions<PlatformStats>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.ceo.stats,
        queryFn: () => api.get<PlatformStats>("/ceo/stats"),
        staleTime: 2 * 60 * 1000,
        ...options,
    });
}

export function useCeoArtists(params?: ArtistListParams, options?: Omit<UseQueryOptions<Artist[]>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.ceo.artists(params),
        queryFn: () => api.get<Artist[]>("/ceo/artists", params),
        staleTime: 2 * 60 * 1000,
        ...options,
    });
}

export function useCreateArtist(options?: UseMutationOptions<Artist, Error, Partial<Artist>>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Artist>) =>
            api.post<Artist>("/ceo/artists", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ceo.artists() });
        },
        ...options,
    });
}

export function useUpdateCeoArtist(options?: UseMutationOptions<Artist, Error, { id: string; data: Partial<Artist> }>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) =>
            api.put<Artist>(`/ceo/artists/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ceo.artists() });
        },
        ...options,
    });
}

export function useDeleteArtist(options?: UseMutationOptions<void, Error, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            api.delete<void>(`/ceo/artists/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ceo.artists() });
        },
        ...options,
    });
}

export function useCeoBookings(params?: BookingListParams, options?: Omit<UseQueryOptions<Booking[]>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.ceo.bookings(params),
        queryFn: () => api.get<Booking[]>("/ceo/bookings", params),
        staleTime: 30 * 1000,
        ...options,
    });
}

export function useCeoFinancial(period?: string, options?: Omit<UseQueryOptions<any>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.ceo.financial(period),
        queryFn: () => api.get<any>("/ceo/financial", { period }),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

export function useCeoPayouts(params?: PayoutListParams, options?: Omit<UseQueryOptions<Payout[]>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.ceo.payouts(params),
        queryFn: () => api.get<Payout[]>("/ceo/payouts", params),
        staleTime: 2 * 60 * 1000,
        ...options,
    });
}

export function useProcessPayout(options?: UseMutationOptions<Payout, Error, { payoutId: string; approve: boolean }>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ payoutId, approve }) =>
            api.post<Payout>(`/ceo/payouts/${payoutId}/process`, { approve }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ceo.payouts() });
        },
        ...options,
    });
}

export function useCeoReports(type?: string, options?: Omit<UseQueryOptions<any>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.ceo.reports(type),
        queryFn: () => api.get<any>("/ceo/reports", { type }),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

// =============================================================================
// BALANCE HOOKS
// =============================================================================

export function useBalance(options?: Omit<UseQueryOptions<{ available: number; pending: number; currency: Currency }>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: queryKeys.balance,
        queryFn: () => api.get<{ available: number; pending: number; currency: Currency }>("/balance"),
        staleTime: 30 * 1000,
        ...options,
    });
}

// =============================================================================
// NOTIFICATION HOOKS
// =============================================================================

export function useNotifications(options?: Omit<UseQueryOptions<any[]>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: () => api.get<any[]>("/notifications"),
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000, // Poll every minute
        ...options,
    });
}

export function useMarkNotificationRead(options?: UseMutationOptions<void, Error, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            api.post<void>(`/notifications/${id}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        ...options,
    });
}

export function useMarkAllNotificationsRead(options?: UseMutationOptions<void, Error, void>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            api.post<void>("/notifications/read-all"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        ...options,
    });
}

// =============================================================================
// STRIPE CONNECT HOOKS
// =============================================================================

export function useStripeAccountStatus(options?: Omit<UseQueryOptions<{ status: string; detailsSubmitted: boolean; payoutsEnabled: boolean }>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: ["stripe", "account"],
        queryFn: () => api.get<{ status: string; detailsSubmitted: boolean; payoutsEnabled: boolean }>("/artist/stripe/status"),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

export function useCreateStripeOnboarding(options?: UseMutationOptions<{ url: string }, Error, void>) {
    return useMutation({
        mutationFn: () =>
            api.post<{ url: string }>("/artist/stripe/onboarding"),
        ...options,
    });
}

export function useCreateStripeDashboardLink(options?: UseMutationOptions<{ url: string }, Error, void>) {
    return useMutation({
        mutationFn: () =>
            api.post<{ url: string }>("/artist/stripe/dashboard"),
        ...options,
    });
}

// =============================================================================
// CONNECTED ACCOUNTS HOOKS
// =============================================================================

export function useConnectedAccounts(options?: Omit<UseQueryOptions<any[]>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: ["connected-accounts"],
        queryFn: () => api.get<any[]>("/artist/connected-accounts"),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

export function useAddConnectedAccount(options?: UseMutationOptions<any, Error, { type: string; details: Record<string, string> }>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) =>
            api.post<any>("/artist/connected-accounts", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connected-accounts"] });
        },
        ...options,
    });
}

export function useRemoveConnectedAccount(options?: UseMutationOptions<void, Error, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            api.delete<void>(`/artist/connected-accounts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connected-accounts"] });
        },
        ...options,
    });
}

// =============================================================================
// FILE UPLOAD HOOKS
// =============================================================================

export function useUploadImage(endpoint: string = "/upload/image") {
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            return api.upload<{ url: string; publicId: string }>(endpoint, formData);
        },
    });
}

export function useUploadMultipleImages(endpoint: string = "/upload/images") {
    return useMutation({
        mutationFn: async (files: File[]) => {
            const formData = new FormData();
            files.forEach((file, i) => formData.append(`file${i}`, file));
            return api.upload<{ urls: string[] }>(endpoint, formData);
        },
    });
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

export function usePrefetchArtist(username: string) {
    const queryClient = useQueryClient();

    return () => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.public.artist(username),
            queryFn: () => api.get<Artist>(`/public/artists/${username}`),
        });
    };
}

export function useInvalidateAll() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries();
    };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { api, HttpClient };
export type {
    ApiResponse,
    PaginatedResponse,
    ArtistListParams,
    BookingListParams,
    PayoutListParams,
    CreateBookingInput,
    UpdateArtistProfileInput,
    UpdateArtistSettingsInput
};
