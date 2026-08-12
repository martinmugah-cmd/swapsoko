import { useAuth } from "@/_core/hooks/useAuth";
import { LocationSelector } from "@/components/LocationSelector";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/store";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Plus, Star, MapPin, Users, Zap, Heart, Bell,
  ChevronRight, Search, MessageCircle,
  Sparkles, Shield, Flame, Gift, Bot, Package, ArrowRight
} from "lucide-react";

import { PullToRefresh } from "@/components/PullToRefresh";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  
  const { filters, setFilters } = useAppStore();
  
  useEffect(() => {
    // Clear search query when entering home page so it's fresh
    if (filters.query || filters.condition || filters.category) {
      setFilters({ query: "", condition: "", category: "" });
    }
    if (isAuthenticated && user && !user.isOnboarded) {
      navigate("/onboarding");
    }
  }, [isAuthenticated, user, navigate]);

  const notificationsQuery = trpc.notifications.list.useQuery({ userId: user?.id }, { enabled: !!user });
  const unreadCount = (notificationsQuery.data?.notifications || []).filter((n: any) => !n.isRead).length;
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const feedQuery = trpc.listings.feed.useQuery({ limit: 5 }, { enabled: !!user });
  const wishesQuery = trpc.wishes.feed.useQuery({ limit: 5 }, { enabled: !!user });
  const communitiesQuery = trpc.communities.list.useQuery(undefined, { enabled: !!user });
  const cyclesQuery = trpc.multiWay.findCycles.useQuery(undefined, { enabled: !!user });

  const quickActions = [
    { icon: Plus, label: "Post Item", bg: "bg-green-50", text: "text-green-600", border: "border-green-100", path: "/post" },
    { icon: Star, label: "Post Wish", bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-100", path: "/swap-wishes" },
    { icon: MapPin, label: "Nearby", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", path: "/swipes", action: () => setFilters({ query: "", category: "", condition: "", swipesViewMode: "map" }) },
    { icon: Users, label: "Soko", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", path: "/communities" },
    { icon: Zap, label: "Urgent", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", path: "/swap-wishes", action: () => setFilters({ query: "", category: 'urgent' }) },
    { icon: Heart, label: "Free Stuff", bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-100", path: "/swipes", action: () => setFilters({ query: "", condition: 'free', category: 'donations' }) },
  ];

  const currentCampus = typeof selectedLocation?.campus === 'object' ? selectedLocation.campus.name : (selectedLocation?.campus || filters.campus || "JKUAT Main Campus");

  const handleInvite = () => {
    const inviteLink = `${window.location.origin}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied!");
  };

  const handleRefresh = async () => {
    await Promise.all([
      feedQuery.refetch(),
      wishesQuery.refetch(),
      communitiesQuery.refetch(),
      cyclesQuery.refetch(),
      profileQuery.refetch(),
      notificationsQuery.refetch()
    ]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pb-24 bg-[#F8FAFC] min-h-screen">
      {/* ── Header & Search (HIG Style) ────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <motion.div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-gray-100"
              whileTap={{ scale: 0.9 }}
            >
              <img src="/logo.jpg" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">Swapsoko</h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={20} className="text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
              )}
            </motion.button>

            {isAuthenticated ? (
              <motion.button 
                onClick={() => navigate("/profile")}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shadow-sm border border-gray-200"
              >
                {(profileQuery.data?.avatarUrl && profileQuery.data.avatarUrl !== "null" && profileQuery.data.avatarUrl !== "undefined") ? (
                  <img src={profileQuery.data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-green-500 text-white font-bold text-sm">${(profileQuery.data?.name || user?.name || "U")[0]}</div>`; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-500 text-white font-bold text-sm">
                    {(profileQuery.data?.name || user?.name || "U")[0]}
                  </div>
                )}
              </motion.button>
            ) : (
              <button 
                onClick={() => navigate("/login")}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full shadow-sm hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group cursor-pointer" onClick={() => navigate("/swipes")}>
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-slate-900 transition-colors z-10" />
           <input 
             type="text" 
             placeholder="Search items, skills or anything..." 
             className="w-full pl-11 pr-4 py-3 bg-gray-100/70 hover:bg-gray-100 border border-transparent rounded-2xl text-[15px] font-medium text-slate-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all pointer-events-none"
             readOnly
           />
        </div>
        
        {/* Location Selector Pill */}
        <button onClick={() => setShowLocationSelector(true)} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[11px] font-bold w-fit uppercase tracking-wider border border-green-100/50">
          <MapPin size={12} /> <span className="max-w-[120px] truncate">{currentCampus}</span> <ChevronRight size={12} className="opacity-60" />
        </button>
      </div>

      {/* Location Selector Modal */}
      <AnimatePresence>
        {showLocationSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-end justify-center"
            style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowLocationSelector(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-[480px] rounded-t-[32px] p-6 pb-10 max-h-[85vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <h3 className="font-bold text-slate-900 text-xl mb-4 text-center">Select Your Campus</h3>
              <LocationSelector
                currentCampus={currentCampus}
                onLocationSelect={(loc) => {
                  setSelectedLocation(loc);
                  setFilters({ 
                    campus: typeof loc.campus === 'object' ? loc.campus.name : loc.campus, 
                    university: typeof loc.campus === 'object' ? loc.campus.university : null,
                    coords: loc.coords,
                    discoveryMode: loc.discoveryMode as any
                  });
                  setShowLocationSelector(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Swap Guru Banner (HIG Minimalist Light Mode) ─────────────────────────────────────────── */}
      <motion.div
        className="mx-5 mt-5 rounded-[28px] relative overflow-hidden bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-full blur-[40px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 p-5 flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0">
             <Bot className="w-7 h-7 text-white" />
           </div>
           <div className="flex-1">
             <h2 className="text-slate-900 font-bold text-[17px] tracking-tight flex items-center gap-1.5">Swap Guru AI <Sparkles size={14} className="text-green-500" /></h2>
             <p className="text-gray-500 text-[13px] mt-0.5 leading-snug font-medium">Your personal assistant for smarter trades.</p>
           </div>
        </div>
        <div className="px-5 pb-5 pt-0">
          <button onClick={() => navigate("/swap-guru")} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[14px] font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
            Ask Guru <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>

      {/* ── Multi Swap Banner ────────────────────────────────────────────── */}
      {cyclesQuery.data?.cycles && cyclesQuery.data.cycles.length > 0 && (
        <motion.div
          className="mx-5 mt-4 rounded-[20px] bg-orange-50 border border-orange-100/60 p-4 flex items-center justify-between cursor-pointer shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/swap-wishes?tab=cycles')}
        >
          <div>
            <h3 className="font-bold text-orange-600 text-[14px] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" /> Multi Swap Opportunities
            </h3>
            <p className="text-orange-500/80 text-[12px] font-medium mt-0.5">{cyclesQuery.data.cycles.length} found today. View cycles to complete.</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </div>
        </motion.div>
      )}

      {/* ── Quick Actions (Horizontal Scrolling Grid) ─────────────────────────────────────────────────── */}
      <div className="mt-8">
        <h2 className="px-5 text-[17px] font-extrabold text-slate-900 mb-3 tracking-tight">Quick Actions</h2>
        <div className="flex gap-3 overflow-x-auto px-5 pb-4 scrollbar-hide snap-x">
          {quickActions.map((action, i) => (
             <button 
               key={i} 
               onClick={() => {
                 if (action.action) action.action();
                 navigate(action.path);
               }}
               className="snap-start shrink-0 w-[100px] h-[100px] bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:border-gray-200 transition-all"
             >
                <div className={`w-11 h-11 rounded-[18px] ${action.bg} ${action.border} border flex items-center justify-center`}>
                  <action.icon size={20} className={action.text} strokeWidth={2.5} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{action.label}</span>
             </button>
          ))}
        </div>
      </div>

      {/* ── Live Swaps Near You (Horizontal Scroll) ──────────────────────────── */}
      <section className="mt-6">
        <div className="px-5 flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" /> Live Swaps
          </h2>
          <button onClick={() => navigate("/swipes")} className="text-green-600 text-[13px] font-bold bg-green-50 px-3 py-1 rounded-full">See all</button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto px-5 pb-6 scrollbar-hide snap-x">
          {(feedQuery.data?.items || []).filter((l: any) => l.userId?.toString() !== user?.id?.toString()).slice(0, 10).map((listing: any) => (
            <motion.div
              key={listing.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/swipes?id=${listing.id}`)}
              className="snap-start shrink-0 w-[240px] bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-[0_8px_24px_rgb(0,0,0,0.04)] cursor-pointer"
            >
              <div className="aspect-[4/3] bg-gray-100 relative p-1">
                <div className="w-full h-full rounded-[20px] overflow-hidden relative">
                  {(() => {
                    let img = null;
                    if (Array.isArray(listing.images) && listing.images.length > 0) {
                      img = listing.images[0];
                    }
                    return img ? (
                      <img src={img} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                        <Package className="w-8 h-8" />
                      </div>
                    );
                  })()}
                  {/* Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-900 shadow-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
                  </div>
                </div>
              </div>
              <div className="p-4 pt-3">
                 <h3 className="font-bold text-slate-900 text-[15px] leading-tight truncate mb-1">{listing.title}</h3>
                 <p className="text-gray-500 text-[11px] font-medium flex items-center gap-1"><MapPin size={10} className="shrink-0"/> <span className="truncate uppercase tracking-wider">{listing.campus || "Nearby"}</span></p>
              </div>
            </motion.div>
          ))}
          {(feedQuery.data?.items || []).filter((l: any) => l.userId?.toString() !== user?.id?.toString()).length === 0 && (
            <div className="w-[80vw] shrink-0 bg-white border border-gray-100 rounded-[24px] p-6 flex items-center justify-center shadow-[0_8px_24px_rgb(0,0,0,0.02)]">
               <p className="text-[13px] text-gray-500 font-medium">No active swaps near you right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Swap Wishes (Horizontal Scroll) ────────────────────────────────────── */}
      <section className="mt-2">
        <div className="px-5 flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Swishes
          </h2>
          <button onClick={() => navigate("/swap-wishes")} className="text-green-600 text-[13px] font-bold bg-green-50 px-3 py-1 rounded-full">See all</button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto px-5 pb-6 scrollbar-hide snap-x">
          {(wishesQuery.data?.items || []).filter((w: any) => w.userId?.toString() !== user?.id?.toString()).slice(0, 10).map((wish: any) => (
            <motion.div
              key={wish.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/swap-wishes?id=${wish.id}`)}
              className="snap-start shrink-0 w-[240px] bg-white border border-gray-100 rounded-[24px] p-4 shadow-[0_8px_24px_rgb(0,0,0,0.04)] cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  {wish.urgency === 'high' ? (
                    <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Urgent
                    </span>
                  ) : wish.urgency === 'medium' ? (
                    <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm">
                      Moderate
                    </span>
                  ) : (
                    <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm">
                      Normal
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    {wish.responseCount || 0} offers
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-[14px] leading-snug line-clamp-3 mb-4">{wish.title}</p>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin size={10} className="shrink-0" />
                <span className="text-[10px] font-bold tracking-wider uppercase truncate">{wish.campus || "Nearby"}</span>
              </div>
            </motion.div>
          ))}
          {(wishesQuery.data?.items || []).filter((w: any) => w.userId?.toString() !== user?.id?.toString()).length === 0 && (
            <div className="w-[80vw] shrink-0 bg-white border border-gray-100 rounded-[24px] p-6 flex items-center justify-center shadow-[0_8px_24px_rgb(0,0,0,0.02)]">
               <p className="text-[13px] text-gray-500 font-medium">No active wishes right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Popular Communities (Horizontal Scroll) ────────────────────────────── */}
      <section className="mt-2">
        <div className="px-5 flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-500" /> Popular Soko
          </h2>
          <button onClick={() => navigate("/communities")} className="text-green-600 text-[13px] font-bold bg-green-50 px-3 py-1 rounded-full">See all</button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto px-5 pb-6 scrollbar-hide snap-x">
          {(communitiesQuery.data?.items || []).slice(0, 6).map((community: any) => (
            <motion.div
              key={community.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/communities/${community.id}`)}
              className="snap-start shrink-0 w-[180px] bg-white border border-gray-100 rounded-[24px] p-1 overflow-hidden shadow-[0_8px_24px_rgb(0,0,0,0.04)] cursor-pointer"
            >
              <div className="bg-gray-100 rounded-[20px] relative overflow-hidden h-28">
                {community.icon?.startsWith("data:image") || community.icon?.startsWith("http") ? (
                  <img src={community.icon} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                  <Users size={10} /> {community.memberCount || 0}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-slate-900 text-[14px] leading-tight truncate">{community.name}</h3>
              </div>
            </motion.div>
          ))}
          {(!communitiesQuery.data?.items || communitiesQuery.data.items.length === 0) && (
            <div className="w-[80vw] shrink-0 bg-white border border-gray-100 rounded-[24px] p-6 flex items-center justify-center shadow-[0_8px_24px_rgb(0,0,0,0.02)]">
               <p className="text-[13px] text-gray-500 font-medium">No communities loaded yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Banners ─────────────────────────────────────────────────── */}
      <div className="px-5 mt-4 flex flex-col gap-4">
        {/* Safety First */}
        <motion.button 
          onClick={() => navigate("/safety")}
          whileTap={{ scale: 0.98 }}
          className="w-full p-5 rounded-[24px] text-left block relative overflow-hidden border border-green-100 bg-white shadow-[0_8px_24px_rgb(0,0,0,0.02)]" 
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/5 rounded-full blur-[20px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-[16px] bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
              <Shield size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-bold text-slate-900">Safety First</h3>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5 leading-snug">Meet in public places. Verify items.</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </motion.button>

        {/* Invite a Friend */}
        <motion.button 
          onClick={handleInvite}
          whileTap={{ scale: 0.98 }}
          className="w-full p-5 rounded-[24px] bg-white text-left block relative overflow-hidden border border-orange-100 shadow-[0_8px_24px_rgb(0,0,0,0.02)]" 
        >
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-orange-500/5 rounded-full blur-[20px] pointer-events-none translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-[16px] bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
              <Gift className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-bold text-slate-900">Invite a friend</h3>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">Share the SwapSoko experience!</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </motion.button>
      </div>
      
    </div>
    </PullToRefresh>
  );
}
