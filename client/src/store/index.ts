import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  campus?: string;
};

interface AppState {
  // Logged-in user state
  user: User | null;
  setUser: (user: User | null) => void;

  // Filters state
  filters: {
    query: string;
    category: string | null;
    categories: string[];
    wantedCategories: string[];
    condition: string | null;
    conditions: string[];
    cashTopUpAllowed: boolean | null;
    noCashNeeded: boolean | null;
    campus: string | null;
    university: string | null;
    discoveryMode: "campus" | "university" | "nearby" | "county" | "community" | "all";
    coords: { lat: number; lng: number } | null;
    maxDistanceKm: string | null;
    minEsv: number | null;
    maxEsv: number | null;
    minTrustRating: number | null;
    minCompletedSwaps: number | null;
    verifiedOnly: boolean;
    directSwapOnly: boolean;
    multiWayAvailable: boolean;
    communityId: string | null;
    swipesViewMode: "swipe" | "map";
  };
  setFilters: (filters: Partial<AppState['filters']>) => void;

  // Nearby radius state
  nearbyRadiusKm: number;
  setNearbyRadiusKm: (radius: number) => void;

  // Chat state
  activeChatRoomId: string | null;
  setActiveChatRoomId: (id: string | null) => void;

  // Saved Items
  savedItemIds: string[];
  toggleSavedItem: (id: string) => void;

  savedWishIds: string[];
  toggleSavedWish: (id: string) => void;

  watchedCommunityIds: string[];
  toggleWatchedCommunity: (id: string) => void;

  watchedUserIds: string[];
  toggleWatchedUser: (id: string) => void;

  watchedCategoryIds: string[];
  toggleWatchedCategory: (id: string) => void;

  // Communities
  activeCommunityId: string | null;
  setActiveCommunityId: (id: string | null) => void;

  requestedCommunityIds: string[];
  addRequestedCommunity: (id: string) => void;

  clearUserSpecificData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      filters: {
        query: "",
        category: null,
        categories: [],
        wantedCategories: [],
        condition: null,
        conditions: [],
        cashTopUpAllowed: null,
        noCashNeeded: null,
        campus: null,
        university: null,
        discoveryMode: "all",
        coords: null,
        maxDistanceKm: null,
        minEsv: null,
        maxEsv: null,
        minTrustRating: null,
        minCompletedSwaps: null,
        verifiedOnly: false,
        directSwapOnly: false,
        multiWayAvailable: false,
        communityId: null,
        swipesViewMode: "swipe",
      },
      setFilters: (newFilters) => 
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),

      nearbyRadiusKm: 10,
      setNearbyRadiusKm: (nearbyRadiusKm) => set({ nearbyRadiusKm }),

      activeChatRoomId: null,
      setActiveChatRoomId: (activeChatRoomId) => set({ activeChatRoomId }),

      savedItemIds: [],
      toggleSavedItem: (id) =>
        set((state) => ({
          savedItemIds: state.savedItemIds.includes(id)
            ? state.savedItemIds.filter((itemId) => itemId !== id)
            : [...state.savedItemIds, id],
        })),

      savedWishIds: [],
      toggleSavedWish: (id) =>
        set((state) => ({
          savedWishIds: state.savedWishIds.includes(id)
            ? state.savedWishIds.filter((x) => x !== id)
            : [...state.savedWishIds, id],
        })),

      watchedCommunityIds: [],
      toggleWatchedCommunity: (id) =>
        set((state) => ({
          watchedCommunityIds: state.watchedCommunityIds.includes(id)
            ? state.watchedCommunityIds.filter((x) => x !== id)
            : [...state.watchedCommunityIds, id],
        })),

      watchedUserIds: [],
      toggleWatchedUser: (id) =>
        set((state) => ({
          watchedUserIds: state.watchedUserIds.includes(id)
            ? state.watchedUserIds.filter((x) => x !== id)
            : [...state.watchedUserIds, id],
        })),

      watchedCategoryIds: [],
      toggleWatchedCategory: (id) =>
        set((state) => ({
          watchedCategoryIds: state.watchedCategoryIds.includes(id)
            ? state.watchedCategoryIds.filter((x) => x !== id)
            : [...state.watchedCategoryIds, id],
        })),

      activeCommunityId: null,
      setActiveCommunityId: (activeCommunityId) => set({ activeCommunityId }),

      requestedCommunityIds: [],
      addRequestedCommunity: (id) =>
        set((state) => ({
          requestedCommunityIds: state.requestedCommunityIds.includes(id)
            ? state.requestedCommunityIds
            : [...state.requestedCommunityIds, id],
        })),
        
      clearUserSpecificData: () =>
        set({
          savedItemIds: [],
          savedWishIds: [],
          watchedCommunityIds: [],
          watchedUserIds: [],
          watchedCategoryIds: [],
          requestedCommunityIds: [],
          activeChatRoomId: null,
        }),
    }),
    {
      name: 'barterbuddy-storage',
      // Only persist certain fields
      partialize: (state) => ({ 
        user: state.user, 
        nearbyRadiusKm: state.nearbyRadiusKm,
        savedItemIds: state.savedItemIds,
        savedWishIds: state.savedWishIds,
        watchedCommunityIds: state.watchedCommunityIds,
        watchedUserIds: state.watchedUserIds,
        watchedCategoryIds: state.watchedCategoryIds,
        filters: state.filters,
        requestedCommunityIds: state.requestedCommunityIds
      }),
    }
  )
);
