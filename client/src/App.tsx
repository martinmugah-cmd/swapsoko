import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Home, MessageCircle, Plus, Copy, Package, User, Bell, Shield, Store } from "@/lib/icons";
import { Route, Switch, useLocation, Link } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";

import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { trpc } from "./lib/trpc";
import { useAuth } from "./_core/hooks/useAuth";
import { supabase } from "./lib/supabase";
import { useState, useEffect } from "react";
import HomePage from "./pages/Home";
import SwipesPage from "./pages/Swipes";
import PostPage from "./pages/Post";
import ChatPage from "./pages/Chat";
import ProfilePage from "./pages/Profile";
import CommunitiesPage from "./pages/Communities";
import SwapGuruPage from "./pages/SwapGuru";
import SwapWishesPage from "./pages/SwapWishes";
import NotificationsPage from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import CommunityDetailPage from "./pages/CommunityDetail";

// ─── Bottom Navigation ────────────────────────────────────────────────────────
function BottomNav() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const fetchUnread = async () => {
      const { data: rooms } = await supabase.from('chat_rooms').select('id').or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      if (rooms && rooms.length > 0) {
        const roomIds = rooms.map(r => r.id);
        const { count } = await supabase.from('messages').select('id', { count: 'exact', head: true }).in('room_id', roomIds).eq('is_read', false).neq('sender_id', user.id);
        setUnreadMessagesCount(count || 0);
      } else {
        setUnreadMessagesCount(0);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 3000);
    const handleUpdate = () => fetchUnread();
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });
  const isAdmin = profileQuery.data?.role === "admin" || profileQuery.data?.role === "super_admin" || profileQuery.data?.role === "moderator";

  const tabs: Array<{ path: string, icon: any, label: string, isCenter?: boolean, badge?: number }> = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/swipes", icon: Copy, label: "Swipes" },
    { path: "/post", icon: Store, label: "Post", isCenter: true },
    { path: "/chat", icon: MessageCircle, label: "Chat", badge: unreadMessagesCount },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  const hideNav = location === "/post" || location === "/edit-profile" || location === "/swap-guru" || location.startsWith('/communities/') || (location.startsWith("/profile/") && location.length > 9) || (location.startsWith("/chat/") && location.length > 6);
  if (hideNav) return null;

  return (
    <>
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[420px] h-[72px] z-[200]">
      <div 
        className="absolute inset-0 bg-white/95 backdrop-blur-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-[36px]"
        style={{
          maskImage: "radial-gradient(circle at 50% 0px, transparent 38px, black 39px)",
          WebkitMaskImage: "radial-gradient(circle at 50% 0px, transparent 38px, black 39px)"
        }}
      />
      <div className="flex items-center justify-around h-full relative px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          if (tab.isCenter) {
            return (
              <Link href={tab.path} key={tab.path}>
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center justify-center -mt-[34px] relative z-10 cursor-pointer w-[60px] h-[60px] rounded-full bg-gradient-to-b from-[#10B981] to-[#059669] shadow-[0_8px_16px_rgba(16,185,129,0.35)]"
                >
                  <tab.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>
              </Link>
            );
          }
          return (
            <Link href={tab.path} key={tab.path}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center gap-1 min-w-[56px] relative cursor-pointer pt-2 pb-1"
              >
                <div className="relative flex flex-col items-center justify-center">
                  <tab.icon
                    className={`w-[24px] h-[24px] transition-all duration-300 ${active ? "text-emerald-500 drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]" : "text-slate-400"}`}
                    strokeWidth={active ? 2.5 : 2.0}
                    color="currentColor"
                  />
                  {tab.badge && tab.badge > 0 ? (
                    <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-[2px] border-white shadow-sm leading-none">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </div>
                  ) : null}
                </div>
                <span className={`text-[10px] font-bold tracking-tight transition-colors duration-300 ${active ? "text-emerald-600" : "text-slate-500"}`}>
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
    
    {isAdmin && !new URLSearchParams(window.location.search).get('preview') && (
      <Link href="/admin">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-[110px] right-6 w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center shadow-xl cursor-pointer z-50 border-2 border-white/20"
        >
          <span className="text-white text-xs font-bold">Admin</span>
        </motion.div>
      </Link>
    )}
    </>
  );
}

// ─── Page Transition Wrapper ──────────────────────────────────────────────────
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.05 }}
      className="flex-1 overflow-y-auto"
    >
      {children}
    </motion.div>
  );
}

import SafetyPage from "./pages/Safety";

import AuthPage from "./pages/Auth";
import OnboardingPage from "./pages/Onboarding";
import EditProfilePage from "./pages/EditProfile";
import AdminPage from "./pages/Admin";
import AppealsPage from "./pages/Appeals";
import VerificationPage from "./pages/Verification";

import { useAppStore } from "./store";

function SavedItemsSyncer() {
  const { isAuthenticated, user } = useAuth();
  const { setSavedItemIds, setSavedWishIds } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    supabase.from('saved_items').select('listing_id, wish_id').eq('user_id', user.id).then(({ data }) => {
      if (data) {
        const itemIds = data.filter(d => d.listing_id).map(d => d.listing_id.toString());
        const wishIds = data.filter(d => d.wish_id).map(d => d.wish_id.toString());
        if (itemIds.length > 0) setSavedItemIds(itemIds);
        if (wishIds.length > 0) setSavedWishIds(wishIds);
      }
    });
  }, [isAuthenticated, user]);

  return null;
}

function LocationTracker() {
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated || !user || !("geolocation" in navigator)) return;
    
    // Only check once per session/hour to avoid spamming GPS
    const lastCheck = localStorage.getItem("lastLocCheck");
    if (lastCheck && Date.now() - parseInt(lastCheck) < 60 * 60 * 1000) return;
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      localStorage.setItem("lastLocCheck", Date.now().toString());
      try {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        
        let prevLat = 0; let prevLon = 0;
        if (user.metadata?.locationName) {
           try {
             const prev = JSON.parse(user.metadata.locationName);
             prevLat = prev.lat; prevLon = prev.lng;
           } catch(e) {}
        }
        
        const getDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
            return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
        };
        
        if (prevLat && prevLon) {
           const d = getDist(prevLat, prevLon, lat, lon);
           if (d < 0.5) return; // Moved less than 500m, do not update DB
        }
        
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await res.json();
        const address = data.address || {};
        const readableLoc = {
          lat,
          lng: lon,
          country: address.country || "",
          county: address.county || address.state || "",
          town: address.city || address.town || address.village || address.suburb || "Unknown",
        };
        
        await supabase.auth.updateUser({ data: { locationName: JSON.stringify(readableLoc) } });
      } catch(e) { console.error("Background Location Sync failed", e); }
    }, () => {});
  }, [isAuthenticated, user]);
  
  return null;
}

function Router() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, loading, user } = useAuth();
  const utils = trpc.useUtils();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const handleUpdate = () => {
      window.dispatchEvent(new Event('app_messages_updated'));
    };

    const sub = supabase.channel('global_app_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, handleUpdate)
      .subscribe();
      
    return () => { 
      supabase.removeChannel(sub); 
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user && location !== "/onboarding" && location !== "/login") {
      const isProfileMissing = profileQuery.isSuccess && !profileQuery.data?.userId;
      if (!user.isOnboarded) {
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, user, location, navigate, profileQuery.isSuccess, profileQuery.data]);

  useEffect(() => {
    const handler = () => {
      utils.chat.myRooms.invalidate();
      utils.chat.getMessages.invalidate();
    };
    window.addEventListener('app_messages_updated', handler);
    return () => window.removeEventListener('app_messages_updated', handler);
  }, [utils]);

  if (loading) return null;
  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
  const hideNav = isPreview || location === "/login" || location === "/onboarding" || location.startsWith('/communities/') || (location.startsWith("/profile/") && location !== `/profile/${user?.id}`);
  
  return (
    <div className="app-container">
      <SavedItemsSyncer />
      <LocationTracker />
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence>
          <Switch key={location}>
            <Route path="/admin">
              <PageTransition><AdminPage /></PageTransition>
            </Route>
            <Route path="/edit-profile">
              <PageTransition><EditProfilePage /></PageTransition>
            </Route>
            <Route path="/login">
              <PageTransition><AuthPage /></PageTransition>
            </Route>
            <Route path="/onboarding">
              <PageTransition><OnboardingPage /></PageTransition>
            </Route>
            <Route path="/">
              <PageTransition>{isAuthenticated ? <HomePage /> : <AuthPage />}</PageTransition>
            </Route>
            <Route path="/swipes">
              <PageTransition><SwipesPage /></PageTransition>
            </Route>
            <Route path="/post">
              <PageTransition><PostPage /></PageTransition>
            </Route>
            <Route path="/chat">
              <PageTransition><ChatPage /></PageTransition>
            </Route>
            <Route path="/chat/:id">
              <PageTransition><ChatPage /></PageTransition>
            </Route>
            <Route path="/profile">
              <PageTransition><ProfilePage /></PageTransition>
            </Route>
            <Route path="/profile/:id">
              <PageTransition><ProfilePage /></PageTransition>
            </Route>
            <Route path="/safety">
              <PageTransition><SafetyPage /></PageTransition>
            </Route>
            <Route path="/communities">
              <PageTransition><CommunitiesPage /></PageTransition>
            </Route>
            <Route path="/communities/:id">
              <PageTransition><CommunityDetailPage /></PageTransition>
            </Route>
            <Route path="/swap-guru">
              <PageTransition><SwapGuruPage /></PageTransition>
            </Route>
            <Route path="/swap-wishes">
              <PageTransition><SwapWishesPage /></PageTransition>
            </Route>
            <Route path="/notifications">
              <PageTransition><NotificationsPage /></PageTransition>
            </Route>
            <Route path="/verification">
              <PageTransition><VerificationPage /></PageTransition>
            </Route>
            <Route>
              <PageTransition><NotFound /></PageTransition>
            </Route>
          </Switch>
        </AnimatePresence>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>

        <LanguageProvider>
          <TooltipProvider>
            <NotificationProvider>
            <Toaster
              position="top-center"
            />
            <SavedItemsSyncer />
            <LocationTracker />
            <Router />
                      </NotificationProvider>
          </TooltipProvider>
        </LanguageProvider>

    </ErrorBoundary>
  );
}

export default App;
