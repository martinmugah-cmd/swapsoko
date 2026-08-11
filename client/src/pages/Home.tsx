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
  ChevronRight, Search, ArrowRightLeft, MessageCircle,
  Sparkles, Trophy, Shield, Clock, TrendingUp, Flame, Gift, Bot, Package, Handshake, ArrowRight
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
    { icon: Plus, label: "Post Item", color: "bg-green-500", path: "/post" },
    { icon: Star, label: "Post Wish", color: "bg-yellow-500", path: "/swap-wishes" },
    { icon: MapPin, label: "Nearby Swaps", color: "bg-blue-600", path: "/swipes", action: () => setFilters({ query: "", category: "", condition: "", swipesViewMode: "map" }) },
    { icon: Users, label: "Soko", color: "bg-purple-500", path: "/communities" },
    { icon: Zap, label: "Emergency Needs", color: "bg-orange-500", path: "/swap-wishes", action: () => setFilters({ query: "", category: 'urgent' }) },
    { icon: Heart, label: "Free Stuff", color: "bg-pink-500", path: "/swipes", action: () => setFilters({ query: "", condition: 'free', category: 'donations' }) },
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
      <div className="pb-24 bg-background">
      {/* ── Sticky Header ────────────────────────────────────────────────── */}
      <div className="page-header px-4 py-3 z-40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden"
              whileTap={{ scale: 0.9 }}
            >
              <img src="/logo.jpg" className="w-full h-full object-cover" />
            </motion.div>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-none">Swapsoko</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={20} className="text-slate-900" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
              )}
            </motion.button>

            {isAuthenticated ? (
              <motion.button 
                onClick={() => navigate("/profile")}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shadow-sm"
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
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm hover:bg-[#1D4ED8] transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Search + Location (Phase 7: Floating Glass Pill) */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search 
              size={15} 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700/60 cursor-pointer hover:text-green-500 transition-colors z-10" 
              onClick={() => navigate("/swipes")}
            />
            <input
              type="text"
              placeholder={"Search items, skills or anything..."}
              value={filters.query}
              onChange={(e) => setFilters({ query: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate("/swipes");
                }
              }}
              className="w-full pl-10 pr-4 py-3 rounded-full apple-glass-thick text-[15px] font-medium text-slate-900 placeholder-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 transition-all shadow-inner border border-white/20"
            />
          </div>
          <motion.button
            onClick={() => setShowLocationSelector(true)}
            className="flex items-center gap-1.5 px-3.5 py-3 rounded-full apple-glass-thick text-sm font-bold text-slate-900 whitespace-nowrap shadow-sm hover:bg-white/40 transition-colors border border-white/20"
            whileTap={{ scale: 0.95 }}
          >
            <MapPin size={16} className="text-green-600" />
            <span className="text-[13px] max-w-[80px] truncate">{String(currentCampus || "").split(",")[0]}</span>
            <ChevronRight size={14} className="text-slate-700/50" />
          </motion.button>
        </div>
      </div>

      {/* Location Selector Modal */}
      <AnimatePresence>
        {showLocationSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-end justify-center"
            style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
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

      {/* ── Swap Guru Hero Banner ─────────────────────────────────────────── */}
      <motion.div
        className="mx-4 mt-6 rounded-3xl relative overflow-hidden border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)]"
        style={{ background: "linear-gradient(145deg, #09090B 0%, #18181B 100%)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Sleek glow orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-green-500/15 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#6366F1]/15 rounded-full blur-[40px] pointer-events-none" />

        <div className="relative z-10 p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 mb-3 shadow-inner">
                <Sparkles size={10} className="text-green-500" />
                <span className="text-[9px] font-bold text-white tracking-widest uppercase">Introducing</span>
              </div>
              <h2 className="text-white font-extrabold text-[22px] leading-tight tracking-tight drop-shadow-md">
                Swap Guru
              </h2>
              <p className="text-gray-400 text-sm mt-1.5 leading-relaxed font-medium">
                Your AI assistant for smarter, faster, and better trades.
              </p>
              <motion.button
                onClick={() => navigate("/swap-guru")}
                className="mt-5 px-5 py-2.5 bg-white text-[#09090B] text-sm font-bold rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Chat with Guru <ArrowRight size={14} />
              </motion.button>
            </div>
            
            {/* Sleek Robot Icon */}
            <div className="w-20 h-20 flex items-center justify-center shrink-0 relative mt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#22C55E]/20 to-[#6366F1]/20 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-inner relative z-10">
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Bot className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                </motion.div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-tr from-[#22C55E]/30 to-[#6366F1]/30 blur-xl rounded-full z-0"
              />
            </div>
          </div>

          {/* Sleek Prompt Chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            {["Analyze value", "Find electronics", "Trade ideas"].map((prompt, i) => (
              <motion.button
                key={i}
                onClick={() => navigate(`/swap-guru?q=${encodeURIComponent(prompt)}`)}
                className="px-3 py-1.5 rounded-2xl text-gray-300 text-[11px] font-semibold transition-colors flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white"
                whileTap={{ scale: 0.96 }}
              >
                <MessageCircle size={10} className="text-green-500" />
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Multi Swap Banner ────────────────────────────────────────────── */}
      {cyclesQuery.data?.cycles && cyclesQuery.data.cycles.length > 0 && (
        <motion.div
          className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 p-4 shadow-sm flex items-center justify-between cursor-pointer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/swap-wishes?tab=cycles')}
        >
          <div>
            <h3 className="font-bold text-orange-600 text-sm flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" /> Multi Swap Opportunities
            </h3>
            <p className="text-orange-500 text-xs mt-0.5">{cyclesQuery.data.cycles.length} found today. View cycles to complete.</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </div>
        </motion.div>
      )}

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-6 gap-1">
          {quickActions.map((action, i) => (
            <motion.button
              key={i}
              onClick={() => {
                if (action.action) action.action();
                navigate(action.path);
              }}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              whileTap={{ scale: 0.88 }}
            >
              <div className={`w-11 h-11 rounded-2xl ${action.color} flex items-center justify-center shadow-md border border-white/20`}>
                <action.icon size={18} className="text-white drop-shadow-sm" strokeWidth={2.5} />
              </div>
              <span className="text-[9px] font-semibold text-slate-900 text-center leading-tight px-0.5">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Live Swaps Near You (Masonry Feed) ──────────────────────────── */}
      <section className="mt-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 text-foreground flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-orange-500" /> {"Live Swaps Near You"}
          </h2>
          <button onClick={() => navigate("/swipes")} className="text-caption text-green-500 font-semibold flex items-center gap-0.5 hover:opacity-80 transition-opacity">
            {"See all"} <ChevronRight size={12} />
          </button>
        </div>
        
        <div className="columns-2 gap-4 space-y-4 pb-4">
          {(feedQuery.data?.items || []).filter((l: any) => l.userId?.toString() !== user?.id?.toString()).slice(0, 10).map((listing: any) => (
            <motion.div
              key={listing.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/swipes?id=${listing.id}`)}
              className="break-inside-avoid bg-white rounded-3xl card-shadow-sm overflow-hidden cursor-pointer group relative flex flex-col"
            >
              <div className="p-1">
                <div className="bg-gray-100 rounded-[22px] relative overflow-hidden aspect-[4/5]">
                  {(() => {
                    let img = null;
                    if (Array.isArray(listing.images) && listing.images.length > 0) {
                      img = listing.images[0];
                    }
                    return img ? (
                      <img src={img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package className="w-8 h-8" />
                      </div>
                    );
                  })()}
                  
                  {/* Vibrant Glass Badge */}
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full apple-glass text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Active
                  </div>
                </div>
              </div>
              <div className="px-3 pt-2 pb-4">
                <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{listing.title}</p>
                <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                  <MapPin size={12} />
                  <span className="text-[10px] font-bold tracking-wider uppercase truncate">{listing.campus || "Nearby"}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {(feedQuery.data?.items || []).filter((l: any) => l.userId?.toString() !== user?.id?.toString()).length === 0 && (
            <div className="col-span-2 bg-muted/50 backdrop-blur-md rounded-3xl p-6 text-center border border-dashed border-border shadow-sm w-full">
               <p className="text-sm text-muted-foreground font-medium">No active swaps near you right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Swap Wishes (Masonry Feed) ────────────────────────────────────── */}
      <section className="mt-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 text-foreground flex items-center gap-1.5">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> {"Swishes"}
          </h2>
          <button onClick={() => navigate("/swap-wishes")} className="text-caption text-green-500 font-semibold flex items-center gap-0.5 hover:opacity-80 transition-opacity">
            {"See all"} <ChevronRight size={12} />
          </button>
        </div>
        
        <div className="columns-2 gap-4 space-y-4 pb-4">
          {(wishesQuery.data?.items || []).filter((w: any) => w.userId?.toString() !== user?.id?.toString()).slice(0, 10).map((wish: any) => (
            <motion.div
              key={wish.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/swap-wishes?id=${wish.id}`)}
              className="break-inside-avoid bg-white rounded-3xl card-shadow-sm overflow-hidden cursor-pointer group relative p-4"
            >
              <div className="flex justify-between items-start mb-3">
                {wish.urgency === 'high' ? (
                  <span className="apple-glass-dark text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Urgent
                  </span>
                ) : wish.urgency === 'medium' ? (
                  <span className="apple-glass text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    Moderate
                  </span>
                ) : (
                  <span className="apple-glass text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    Normal
                  </span>
                )}
              </div>
              <p className="font-semibold text-foreground text-sm leading-snug line-clamp-3 mb-3">{wish.title}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin size={12} />
                  <span className="text-[10px] font-bold tracking-wider uppercase truncate">{wish.campus || "Nearby"}</span>
                </div>
                <span className="text-[10px] font-bold text-foreground bg-muted px-2.5 py-1 rounded-full">
                  {wish.responseCount || 0} offers
                </span>
              </div>
            </motion.div>
          ))}
          {(wishesQuery.data?.items || []).filter((w: any) => w.userId?.toString() !== user?.id?.toString()).length === 0 && (
            <div className="col-span-2 bg-muted/50 backdrop-blur-md rounded-3xl p-6 text-center border border-dashed border-border shadow-sm w-full">
               <p className="text-sm text-muted-foreground font-medium">No active wishes right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Popular Communities (Masonry Feed) ────────────────────────────── */}
      <section className="mt-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 text-foreground flex items-center gap-1.5">
            <Users className="w-5 h-5 text-blue-500" /> {"Popular Soko"}
          </h2>
          <button onClick={() => navigate("/communities")} className="text-caption text-green-500 font-semibold flex items-center gap-0.5 hover:opacity-80 transition-opacity">
            {"See all"} <ChevronRight size={12} />
          </button>
        </div>
        
        <div className="columns-2 gap-4 space-y-4 pb-4">
          {(communitiesQuery.data?.items || []).slice(0, 6).map((community: any) => (
            <motion.div
              key={community.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/communities/${community.id}`)}
              className="break-inside-avoid bg-white rounded-3xl card-shadow-sm overflow-hidden cursor-pointer group relative flex flex-col p-1"
            >
              <div className="bg-gray-100 rounded-[22px] relative overflow-hidden h-28">
                {community.icon?.startsWith("data:image") || community.icon?.startsWith("http") ? (
                  <img src={community.icon} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                
                {/* Floating Member Count */}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full apple-glass-thick text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                  <Users size={10} />
                  {community.memberCount || 0}
                </div>
              </div>
              
              <div className="px-3 pt-3 pb-3 flex flex-col">
                <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{community.name}</h3>
              </div>
            </motion.div>
          ))}
          {(!communitiesQuery.data?.items || communitiesQuery.data.items.length === 0) && (
            <div className="col-span-2 bg-muted/50 backdrop-blur-md rounded-3xl p-6 text-center border border-dashed border-border shadow-sm w-full">
               <p className="text-sm text-muted-foreground font-medium">No communities loaded yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Safety First ─────────────────────────────────────────────────── */}
      <motion.button 
        onClick={() => navigate("/safety")}
        whileTap={{ scale: 0.98 }}
        className="w-[calc(100%-2rem)] mx-4 mt-8 p-5 rounded-3xl text-left block relative overflow-hidden border border-green-500/10 card-shadow" 
        style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.05) 0%, rgba(34,197,94,0.01) 100%)" }}
      >
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/10 rounded-full blur-[20px] pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-14 h-14 rounded-[1.25rem] bg-background flex items-center justify-center shrink-0 shadow-sm border border-green-500/10">
            <Shield size={26} className="text-green-500" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-foreground">Safety First</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1 leading-relaxed">Meet in public places. Verify items. Trust the community.</p>
            <div className="text-caption text-green-500 font-bold mt-3 flex items-center gap-1 uppercase tracking-wide">
              Read Safety Guide <ChevronRight size={14} strokeWidth={3} />
            </div>
          </div>
        </div>
      </motion.button>

      {/* ── Invite a Friend ──────────────────────────────────────────────── */}
      <motion.button 
        onClick={handleInvite}
        whileTap={{ scale: 0.98 }}
        className="w-[calc(100%-2rem)] mx-4 mt-4 mb-8 p-5 rounded-3xl bg-background text-left block relative overflow-hidden card-shadow-sm border border-border" 
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-[1.25rem] bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
            <Gift className="w-7 h-7 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-bold text-foreground">Invite a friend</h3>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">Share the SwapSoko experience!</p>
          </div>
          <div
            className="px-5 py-2.5 text-white text-sm font-bold rounded-2xl shadow-sm transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)" }}
          >
            Invite Now
          </div>
        </div>
      </motion.button>
    </div>
    </PullToRefresh>
  );
}
