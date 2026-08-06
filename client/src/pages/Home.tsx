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
    { icon: Plus, label: "Post Item", color: "bg-[#22C55E]", path: "/post" },
    { icon: Star, label: "Post Wish", color: "bg-yellow-500", path: "/swap-wishes" },
    { icon: MapPin, label: "Nearby Swaps", color: "bg-[#2563EB]", path: "/swipes", action: () => setFilters({ query: "", category: "", condition: "", swipesViewMode: "map" }) },
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

  return (
    <div className="pb-24 bg-[#F8FAFC]">
      {/* ── Sticky Header ────────────────────────────────────────────────── */}
      <div className="page-header px-4 py-3 z-40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-9 h-9 rounded-[24px] flex items-center justify-center shadow-sm overflow-hidden"
              whileTap={{ scale: 0.9 }}
            >
              <img src="/logo.jpg" className="w-full h-full object-cover" />
            </motion.div>
            <div>
              <h1 className="text-base font-black text-[#0F172A] leading-none">Swapsoko</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={20} className="text-[#0F172A]" />
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
                  <img src={profileQuery.data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-[#22C55E] text-white font-bold text-sm">${(profileQuery.data?.name || user?.name || "U")[0]}</div>`; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#22C55E] text-white font-bold text-sm">
                    {(profileQuery.data?.name || user?.name || "U")[0]}
                  </div>
                )}
              </motion.button>
            ) : (
              <button 
                onClick={() => navigate("/login")}
                className="px-4 py-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-full shadow-sm hover:bg-[#1D4ED8] transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Search + Location */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search 
              size={15} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[#22C55E] transition-colors" 
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
              className="w-full pl-9 pr-4 py-2.5 rounded-[24px] border border-gray-200 bg-white/70 backdrop-blur-md text-sm focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all shadow-sm"
            />
          </div>
          <motion.button
            onClick={() => setShowLocationSelector(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[24px] border border-gray-200 bg-white/70 backdrop-blur-md text-sm font-medium text-[#0F172A] whitespace-nowrap shadow-sm hover:border-[#22C55E]/50 transition-colors"
            whileTap={{ scale: 0.97 }}
          >
            <MapPin size={14} className="text-[#22C55E]" />
            <span className="text-xs max-w-[80px] truncate">{String(currentCampus || "").split(",")[0]}</span>
            <ChevronRight size={12} className="text-gray-400" />
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
              <h3 className="font-bold text-[#0F172A] text-xl mb-4 text-center">Select Your Campus</h3>
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
        className="mx-4 mt-6 rounded-[32px] relative overflow-hidden border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)]"
        style={{ background: "linear-gradient(145deg, #09090B 0%, #18181B 100%)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Sleek glow orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#22C55E]/15 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#6366F1]/15 rounded-full blur-[40px] pointer-events-none" />

        <div className="relative z-10 p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 mb-3 shadow-inner">
                <Sparkles size={10} className="text-[#22C55E]" />
                <span className="text-[9px] font-bold text-white tracking-widest uppercase">Introducing</span>
              </div>
              <h2 className="text-white font-extrabold text-[22px] leading-tight tracking-tight drop-shadow-md">
                Swap Guru
              </h2>
              <p className="text-gray-400 text-[13px] mt-1.5 leading-relaxed font-medium">
                Your AI assistant for smarter, faster, and better trades.
              </p>
              <motion.button
                onClick={() => navigate("/swap-guru")}
                className="mt-5 px-5 py-2.5 bg-white text-[#09090B] text-[13px] font-bold rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Chat with Guru <ArrowRight size={14} />
              </motion.button>
            </div>
            
            {/* Sleek Robot Icon */}
            <div className="w-20 h-20 flex items-center justify-center shrink-0 relative mt-2">
              <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-[#22C55E]/20 to-[#6366F1]/20 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-inner relative z-10">
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
                className="px-3 py-1.5 rounded-[20px] text-gray-300 text-[11px] font-semibold transition-colors flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white"
                whileTap={{ scale: 0.96 }}
              >
                <MessageCircle size={10} className="text-[#22C55E]" />
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Multi Swap Banner ────────────────────────────────────────────── */}
      {cyclesQuery.data?.cycles && cyclesQuery.data.cycles.length > 0 && (
        <motion.div
          className="mx-4 mt-4 rounded-[24px] bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 p-4 shadow-sm flex items-center justify-between cursor-pointer"
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
              <div className={`w-11 h-11 rounded-[16px] ${action.color} flex items-center justify-center shadow-md border border-white/20`}>
                <action.icon size={18} className="text-white drop-shadow-sm" strokeWidth={2.5} />
              </div>
              <span className="text-[9px] font-semibold text-[#0F172A] text-center leading-tight px-0.5">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Live Swaps Near You ───────────────────────────────────────────── */}
      <section className="mt-6">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-orange-500" /> {"Live Swaps Near You"}
          </h2>
          <button onClick={() => navigate("/swipes")} className="text-xs text-[#22C55E] font-semibold flex items-center gap-0.5 hover:underline">
            {"See all"} <ChevronRight size={12} />
          </button>
        </div>
        <div className="pl-4 pr-4 overflow-x-auto pb-4 hide-scrollbar flex gap-3">
          {(feedQuery.data?.items || []).filter((l: any) => l.userId?.toString() !== user?.id?.toString()).slice(0, 5).map((listing: any) => (
            <motion.div
              key={listing.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/swipes?id=${listing.id}`)}
              className="flex-shrink-0 w-44 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 overflow-hidden cursor-pointer group"
            >
              <div className="h-36 bg-gray-100 relative overflow-hidden">
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
              </div>
              <div className="p-3.5">
                <p className="font-extrabold text-[#0F172A] text-[15px] leading-tight truncate">{listing.title}</p>
                <div className="flex items-center gap-1 mt-1.5 text-gray-400">
                  <MapPin size={12} />
                  <span className="text-[11px] font-bold tracking-wide uppercase truncate">{listing.campus || "Nearby"}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {(feedQuery.data?.items || []).filter((l: any) => l.userId?.toString() !== user?.id?.toString()).length === 0 && (
            <div className="bg-white/70 backdrop-blur-md rounded-[24px] p-4 text-center border border-dashed border-gray-300 shadow-sm w-full">
               <p className="text-sm text-gray-500">No active swaps near you right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Swap Wishes ───────────────────────────────────────────────────── */}
      <section className="mt-6">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-1.5">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> {"Swishes"}
          </h2>
          <button onClick={() => navigate("/swap-wishes")} className="text-xs text-[#22C55E] font-semibold flex items-center gap-0.5 hover:underline">
            {"See all"} <ChevronRight size={12} />
          </button>
        </div>
        <div className="pl-4 pr-4 overflow-x-auto pb-4 hide-scrollbar flex gap-3">
          {(wishesQuery.data?.items || []).filter((w: any) => w.userId?.toString() !== user?.id?.toString()).slice(0, 5).map((wish: any) => (
            <motion.div
              key={wish.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/swap-wishes?id=${wish.id}`)}
              className="flex-shrink-0 w-52 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 overflow-hidden cursor-pointer p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-black px-2 py-1 rounded-[8px] uppercase tracking-wider ${wish.urgency === 'high' ? 'bg-red-50 text-red-500' : wish.urgency === 'medium' ? 'bg-orange-50 text-orange-500' : 'bg-[#F0FDF4] text-[#22C55E]'}`}>
                  {wish.urgency || "Normal"}
                </span>
                <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-[8px]">
                  {wish.responseCount || 0} offers
                </span>
              </div>
              <p className="font-extrabold text-[#0F172A] text-[15px] line-clamp-2 leading-snug mb-2">{wish.title}</p>
              <div className="flex items-center gap-1.5 text-gray-400">
                <MapPin size={12} />
                <span className="text-[11px] font-bold tracking-wide uppercase truncate">{wish.campus || "Nearby"}</span>
              </div>
            </motion.div>
          ))}
          {(wishesQuery.data?.items || []).filter((w: any) => w.userId?.toString() !== user?.id?.toString()).length === 0 && (
            <div className="bg-white/70 backdrop-blur-md rounded-[24px] p-4 text-center border border-dashed border-gray-300 shadow-sm w-full">
               <p className="text-sm text-gray-500">No active wishes right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Popular Communities ───────────────────────────────────────────── */}
      <section className="mt-6">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-1.5">
            <Users className="w-5 h-5 text-blue-500" /> {"Popular Soko"}
          </h2>
          <button onClick={() => navigate("/communities")} className="text-xs text-[#22C55E] font-semibold flex items-center gap-0.5 hover:underline">
            {"See all"} <ChevronRight size={12} />
          </button>
        </div>
        <div className="pl-4 pr-4 overflow-x-auto pb-4 hide-scrollbar flex gap-3">
          {(communitiesQuery.data?.items || []).slice(0, 5).map((community: any) => (
            <motion.div
              key={community.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/communities/${community.id}`)}
              className="flex-shrink-0 w-44 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 overflow-hidden cursor-pointer group"
            >
              <div className="h-24 bg-gray-100 relative overflow-hidden">
                {community.icon?.startsWith("data:image") || community.icon?.startsWith("http") ? (
                  <img src={community.icon} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] opacity-90 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <div className="px-4 pb-4 -mt-8 relative z-10 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-white rounded-[20px] shadow-[0_4px_10px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#22C55E] mb-2 border-[3px] border-white overflow-hidden">
                  {community.icon?.startsWith("data:image") || community.icon?.startsWith("http") ? (
                    <img src={community.icon} className="w-full h-full object-cover" />
                  ) : community.icon === "Users" ? (
                    <Users className="w-6 h-6" />
                  ) : (
                    <Handshake className="w-6 h-6" />
                  )}
                </div>
                <h3 className="font-extrabold text-[#0F172A] text-[15px] truncate w-full">{community.name}</h3>
                <p className="text-[11px] font-bold text-gray-400 mt-0.5">{community.memberCount || 0} members</p>
              </div>
            </motion.div>
          ))}
          {(!communitiesQuery.data?.items || communitiesQuery.data.items.length === 0) && (
            <div className="bg-white/70 backdrop-blur-md rounded-[24px] p-4 text-center border border-dashed border-gray-300 shadow-sm w-full">
               <p className="text-sm text-gray-500">No communities loaded yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Safety First ─────────────────────────────────────────────────── */}
      <motion.button 
        onClick={() => navigate("/safety")}
        whileTap={{ scale: 0.98 }}
        className="w-[calc(100%-2rem)] mx-4 mt-8 p-5 rounded-[32px] text-left block relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.02) 100%)", border: "1px solid rgba(34,197,94,0.15)", boxShadow: "0 8px 30px rgba(34,197,94,0.06)" }}
      >
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#22C55E]/10 rounded-full blur-[20px] pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-14 h-14 rounded-[20px] bg-white flex items-center justify-center shrink-0 shadow-[0_4px_15px_rgba(34,197,94,0.15)] border border-[#22C55E]/20">
            <Shield size={26} className="text-[#22C55E]" />
          </div>
          <div>
            <h3 className="text-[17px] font-extrabold text-[#0F172A]">Safety First</h3>
            <p className="text-[13px] font-medium text-gray-500 mt-1 leading-relaxed">Meet in public places. Verify items. Trust the community.</p>
            <div className="text-[12px] text-[#22C55E] font-extrabold mt-3 flex items-center gap-1.5 uppercase tracking-wide">
              Read Safety Guide <ChevronRight size={14} strokeWidth={3} />
            </div>
          </div>
        </div>
      </motion.button>

      {/* ── Invite a Friend ──────────────────────────────────────────────── */}
      <motion.button 
        onClick={handleInvite}
        whileTap={{ scale: 0.98 }}
        className="w-[calc(100%-2rem)] mx-4 mt-4 mb-8 p-5 rounded-[32px] bg-white text-left block relative overflow-hidden" 
        style={{ boxShadow: "0 8px 30px rgba(15,23,42,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-[20px] bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100/50">
            <Gift className="w-7 h-7 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-extrabold text-[#0F172A]">Invite a friend</h3>
            <p className="text-[13px] font-medium text-gray-500 mt-0.5">Share the SwapSoko experience!</p>
          </div>
          <div
            className="px-5 py-2.5 text-white text-[13px] font-extrabold rounded-[20px] shadow-[0_4px_15px_rgba(34,197,94,0.3)] transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)" }}
          >
            Invite Now
          </div>
        </div>
      </motion.button>
    </div>
  );
}
