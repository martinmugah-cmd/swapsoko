import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useAppStore } from "@/store";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options ?? {};
  
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Map supabase user to our standard user object
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "",
          avatarUrl: session.user.user_metadata?.avatar_url || "",
          isOnboarded: session.user.user_metadata?.isOnboarded || false,
          metadata: session.user.user_metadata || {},
        });
      }
      setIsLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "",
          avatarUrl: session.user.user_metadata?.avatar_url || "",
          isOnboarded: session.user.user_metadata?.isOnboarded || false,
          metadata: session.user.user_metadata || {},
        });
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (redirectOnUnauthenticated && !user) {
      navigate(redirectPath);
    }
  }, [redirectOnUnauthenticated, isLoaded, user, navigate, redirectPath]);

  return {
    user,
    loading: !isLoaded,
    error: null,
    isAuthenticated: !!user,
    refresh: async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || "",
          avatarUrl: data.user.user_metadata?.avatar_url || "",
          isOnboarded: data.user.user_metadata?.isOnboarded || false,
          metadata: data.user.user_metadata || {},
        });
      }
    },
    logout: async () => {
      try {
        await supabase.auth.signOut();
        useAppStore.getState().clearUserSpecificData();
      } catch (e) {
        console.warn('Signout error:', e);
      }
      window.location.href = redirectPath;
    },
  };
}
