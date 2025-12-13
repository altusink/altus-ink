/**
 * ALTUS INK - ENTERPRISE MODULES HOOKS LIBRARY
 * The Frontend Logic Layer connecting React components to the Enterprise Backend Services.
 * 
 * Includes hooks for:
 * - Fintech & Payments (useFintech)
 * - Global Marketplace (useMarketplace)
 * - CMS & Page Builder (useCMS)
 * - Franchise Management (useFranchise)
 * - Workflow Engine (useWorkflow)
 * - Supply Chain, IoT, and more.
 * 
 * Powered by React Query for caching and state management.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
// In a real app, strict types would be shared from a common package.
// Here we define simplified interface mirrors for frontend usage.

// =============================================================================
// 1. FINTECH & PAYMENTS HOOKS
// =============================================================================

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    status: string;
    type: string;
    createdAt: string;
}

export function useFintech() {
    const queryClient = useQueryClient();

    // Fetch Wallet Balance
    const useWallet = (currency: string = "EUR") => useQuery({
        queryKey: ["fintech", "wallet", currency],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/fintech/wallet/${currency}`);
            return res.json();
        }
    });

    // Fetch Transactions
    const useTransactions = (params?: any) => useQuery({
        queryKey: ["fintech", "transactions", params],
        queryFn: async () => {
            const query = new URLSearchParams(params).toString();
            const res = await apiRequest("GET", `/api/fintech/transactions?${query}`);
            return res.json() as Promise<Transaction[]>;
        }
    });

    // Process Payment
    const processPayment = useMutation({
        mutationFn: async (data: { amount: number; currency: string; method: string }) => {
            const res = await apiRequest("POST", "/api/fintech/pay", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fintech"] });
        }
    });

    // Request Payout
    const requestPayout = useMutation({
        mutationFn: async (amount: number) => {
            const res = await apiRequest("POST", "/api/fintech/payout", { amount });
            return res.json();
        }
    });

    return {
        useWallet,
        useTransactions,
        processPayment,
        requestPayout
    };
}

// =============================================================================
// 2. GLOBAL MARKETPLACE HOOKS
// =============================================================================

export function useMarketplace() {
    const queryClient = useQueryClient();

    // LISTINGS
    const useGuestSpots = (filters: any) => useQuery({
        queryKey: ["marketplace", "guest-spots", filters],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/marketplace/guest-spots");
            return res.json();
        }
    });

    const useEquipment = (category: string) => useQuery({
        queryKey: ["marketplace", "equipment", category],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/marketplace/equipment/${category}`);
            return res.json();
        }
    });

    // ACTIONS
    const createListing = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/marketplace/listings", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["marketplace"] });
        }
    });

    const placeBid = useMutation({
        mutationFn: async (data: { auctionId: string; amount: number }) => {
            const res = await apiRequest("POST", `/api/marketplace/auctions/${data.auctionId}/bid`, { amount: data.amount });
            return res.json();
        }
    });

    return {
        useGuestSpots,
        useEquipment,
        createListing,
        placeBid
    };
}

// =============================================================================
// 3. CMS & PAGE BUILDER HOOKS
// =============================================================================

export function useCMS() {
    const queryClient = useQueryClient();

    const usePage = (slug: string, locale: string = "en") => useQuery({
        queryKey: ["cms", "page", slug, locale],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/cms/page?slug=${slug}&locale=${locale}`);
            return res.json();
        },
        staleTime: 60 * 1000 // 1 minute
    });

    const publishPage = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/cms/pages", data);
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["cms", "page", data.slug] });
        }
    });

    return {
        usePage,
        publishPage
    };
}

// =============================================================================
// 4. FRANCHISE MANAGEMENT HOOKS
// =============================================================================

export function useFranchise() {
    const useMyFranchise = () => useQuery({
        queryKey: ["franchise", "mine"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/franchise/me");
            return res.json();
        }
    });

    const useTerritoryMap = () => useQuery({
        queryKey: ["franchise", "territories"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/franchise/territories");
            return res.json();
        }
    });

    return {
        useMyFranchise,
        useTerritoryMap
    };
}

// =============================================================================
// 5. WORKFLOW ENGINE HOOKS
// =============================================================================

export function useWorkflow() {
    const queryClient = useQueryClient();

    const usePendingTasks = () => useQuery({
        queryKey: ["workflow", "tasks"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/workflow/tasks");
            return res.json();
        }
    });

    const completeTask = useMutation({
        mutationFn: async (data: { taskId: string; payload: any }) => {
            const res = await apiRequest("POST", `/api/workflow/tasks/${data.taskId}/complete`, data.payload);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflow", "tasks"] });
        }
    });

    const startProcess = useMutation({
        mutationFn: async (data: { processKey: string; initialData: any }) => {
            const res = await apiRequest("POST", "/api/workflow/start", data);
            return res.json();
        }
    });

    return {
        usePendingTasks,
        completeTask,
        startProcess
    };
}

// =============================================================================
// 6. SUPPLY CHAIN & LOGISTICS HOOKS
// =============================================================================

export function useSupplyChain() {
    const useInventory = () => useQuery({
        queryKey: ["supply-chain", "inventory"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/supply-chain/inventory");
            return res.json();
        }
    });

    const placeOrder = useMutation({
        mutationFn: async (items: any[]) => {
            const res = await apiRequest("POST", "/api/supply-chain/orders", { items });
            return res.json();
        }
    });

    return { useInventory, placeOrder };
}

// =============================================================================
// 7. IOT & HARDWARE HOOKS
// =============================================================================

export function useIoT() {
    const useDevices = () => useQuery({
        queryKey: ["iot", "devices"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/iot/devices");
            return res.json();
        },
        refetchInterval: 5000 // Live polling for device status
    });

    const sendCommand = useMutation({
        mutationFn: async (data: { deviceId: string; command: string; payload?: any }) => {
            const res = await apiRequest("POST", `/api/iot/devices/${data.deviceId}/command`, data);
            return res.json();
        }
    });

    return { useDevices, sendCommand };
}

// =============================================================================
// 8. SOCIAL MEDIA HOOKS
// =============================================================================

export function useSocialMedia() {
    const useScheduledPosts = () => useQuery({
        queryKey: ["social", "posts"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/social/posts");
            return res.json();
        }
    });

    const schedulePost = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/social/posts", data);
            return res.json();
        }
    });

    return { useScheduledPosts, schedulePost };
}

// =============================================================================
// 9. FLEET MANAGEMENT HOOKS
// =============================================================================

export function useFleet() {
    const useVehicles = () => useQuery({
        queryKey: ["fleet", "vehicles"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/fleet/vehicles");
            return res.json();
        }
    });

    const trackVehicle = (vehicleId: string) => useQuery({
        queryKey: ["fleet", "tracking", vehicleId],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/fleet/vehicles/${vehicleId}/tracking`);
            return res.json();
        },
        enabled: !!vehicleId,
        refetchInterval: 10000
    });

    return { useVehicles, trackVehicle };
}

// =============================================================================
// 10. REAL ESTATE HOOKS
// =============================================================================

export function useRealEstate() {
    const useProperties = () => useQuery({
        queryKey: ["real-estate", "properties"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/real-estate/properties");
            return res.json();
        }
    });

    return { useProperties };
}
