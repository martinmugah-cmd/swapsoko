import { supabase } from "../lib/supabase";
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
    swipesViewMode: "swipe" | "map" | "feed";
  };
  setFilters: (filters: Partial<AppState['filters']>) => void;

  // Nearby radius state
  nearbyRadiusKm: number;
  setNearbyRadiusKm: (radius: number) => void;

  // Chat state
  activeChatRoomId: string | null;
  setActiveChatRoomId: (id: string | null) => void;

  coords: { lat: number; lng: number } | null;
  setCoords: (coords: { lat: number; lng: number } | null) => void;

  // Saved Items
  savedItemIds: string[];
  setSavedItemIds: (ids: string[]) => void;
  toggleSavedItem: (id: string) => void;

  savedWishIds: string[];
  setSavedWishIds: (ids: string[]) => void;
  toggleSavedWish: (id: string) => void;

  watchedCommunityIds: string[];
  toggleWatchedCommunity: (id: string) => void;

  savedSearches: { id: string; query: string; createdAt: string }[];
  saveSearch: (query: string) => void;
  removeSavedSearch: (id: string) => void;

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

      coords: null,
      setCoords: (coords) => set({ coords }),

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
      setSavedItemIds: (ids) => set({ savedItemIds: ids }),
      toggleSavedItem: async (id) => {
        set((state) => {
          const isSaving = !state.savedItemIds.includes(id);
          const next = isSaving 
            ? [...state.savedItemIds, id] 
            : state.savedItemIds.filter((itemId) => itemId !== id);
            
          // Sync with Supabase asynchronously (fire and forget)
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
              if (isSaving) {
                supabase.from('saved_items').insert({ user_id: session.user.id, listing_id: parseInt(id) }).then();
              } else {
                supabase.from('saved_items').delete().match({ user_id: session.user.id, listing_id: parseInt(id) }).then();
              }
            }
          });

          return { savedItemIds: next };
        });
      },

      savedWishIds: [],
      setSavedWishIds: (ids) => set({ savedWishIds: ids }),
      toggleSavedWish: async (id) => {
        set((state) => {
          const isSaving = !state.savedWishIds.includes(id);
          const next = isSaving
            ? [...state.savedWishIds, id]
            : state.savedWishIds.filter((x) => x !== id);

          // Sync with Supabase asynchronously
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
              if (isSaving) {
                supabase.from('saved_items').insert({ user_id: session.user.id, wish_id: parseInt(id) }).then();
              } else {
                supabase.from('saved_items').delete().match({ user_id: session.user.id, wish_id: parseInt(id) }).then();
              }
            }
          });

          return { savedWishIds: next };
        });
      },

      watchedCommunityIds: [],
      toggleWatchedCommunity: (id) =>
        set((state) => ({
          watchedCommunityIds: state.watchedCommunityIds.includes(id)
            ? state.watchedCommunityIds.filter((x) => x !== id)
            : [...state.watchedCommunityIds, id],
        })),

      savedSearches: [],
      saveSearch: (query) =>
        set((state) => ({
          savedSearches: state.savedSearches.some(s => s.query === query) 
            ? state.savedSearches 
            : [...state.savedSearches, { id: Date.now().toString(), query, createdAt: new Date().toISOString() }],
        })),
      removeSavedSearch: (id) =>
        set((state) => ({
          savedSearches: state.savedSearches.filter((s) => s.id !== id),
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
