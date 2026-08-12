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
  ChevronRight, Search,
  Sparkles, Shield, Flame, Gift, Bot, Package, ArrowRight, Activity
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
    { icon: Plus, label: "Post Item", bg: "bg-green-100", text: "text-green-600", border: "border-green-200/50", path: "/post" },
    { icon: Star, label: "Post Wish", bg: "bg-yellow-100", text: "text-yellow-600", border: "border-yellow-200/50", path: "/swap-wishes" },
    { icon: MapPin, label: "Nearby", bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200/50", path: "/swipes", action: () => setFilters({ query: "", category: "", condition: "", swipesViewMode: "map" }) },
    { icon: Users, label: "Soko", bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200/50", path: "/communities" },
    { icon: Zap, label: "Urgent", bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200/50", path: "/swap-wishes", action: () => setFilters({ query: "", category: 'urgent' }) },
    { icon: Heart, label: "Free", bg: "bg-pink-100", text: "text-pink-600", border: "border-pink-200/50", path: "/swipes", action: () => setFilters({ query: "", condition: 'free', category: 'donations' }) },
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
      <div className="pb-24 bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* ── Floating Header ────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2 sticky top-0 z-40">
        <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[28px] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-3 pl-2">
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner overflow-hidden border border-gray-100 bg-white"
              whileTap={{ scale: 0.9 }}
            >
              <img src="/logo.jpg" className="w-full h-full object-cover scale-110" />
            </motion.div>
            <div className="flex flex-col">
              <h1 className="text-[17px] font-black text-slate-900 tracking-tight leading-none">Swapsoko</h1>
              <button onClick={() => setShowLocationSelector(true)} className="flex items-center gap-1 text-[11px] font-bold text-green-600 mt-0.5">
                <MapPin size={10} /> <span className="max-w-[90px] truncate">{currentCampus}</span> <ChevronRight size={10} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pr-1">
            <motion.button
              onClick={() => navigate("/notifications")}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={18} className="text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
              )}
            </motion.button>

            {isAuthenticated ? (
              <motion.button 
                onClick={() => navigate("/profile")}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shadow-inner border border-slate-200"
              >
                {(profileQuery.data?.avatarUrl && profileQuery.data.avatarUrl !== "null" && profileQuery.data.avatarUrl !== "undefined") ? (
                  <img src={profileQuery.data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-600 text-white font-bold text-sm">${(profileQuery.data?.name || user?.name || "U")[0]}</div>`; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-600 text-white font-bold text-sm">
                    {(profileQuery.data?.name || user?.name || "U")[0]}
                  </div>
                )}
              </motion.button>
            ) : (
              <button 
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-slate-900 text-white text-[13px] font-bold rounded-full shadow-md hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────────── */}
      <div className="px-5 mt-2">
        <div className="relative group cursor-pointer" onClick={() => navigate("/swipes")}>
           <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-[24px] blur-xl opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none" />
           <div className="relative bg-white/90 backdrop-blur-md border border-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex items-center px-4 py-3.5">
             <Search size={20} className="text-slate-400 shrink-0" />
             <input 
               type="text" 
               placeholder="Search items, skills or anything..." 
               className="w-full bg-transparent pl-3 pr-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none pointer-events-none"
               readOnly
             />
             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
               <ArrowRight size={14} className="text-slate-600" />
             </div>
           </div>
        </div>
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

      {/* ── Bento Box Hero ─────────────────────────────────────────── */}
      <div className="px-5 mt-6 grid grid-cols-2 gap-3">
        {/* Main Guru Card */}
        <motion.div
          className="col-span-2 relative overflow-hidden rounded-[32px] p-6 shadow-[0_12px_40px_rgba(34,197,94,0.15)] cursor-pointer"
          style={{ background: "linear-gradient(135deg, #111827 0%, #020617 100%)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/swap-guru")}
        >
          {/* Animated Glow Blobs */}
          <motion.div 
            className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-green-500/30 rounded-full blur-[40px] pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-blue-500/30 rounded-full blur-[40px] pointer-events-none"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-3 backdrop-blur-md shadow-inner">
                  <Sparkles size={12} className="text-green-400" />
                  <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">Swap Guru AI</span>
                </div>
                <h2 className="text-white font-black text-[28px] leading-tight tracking-tight">Trade<br/>Smarter.</h2>
              </div>
              <div className="w-16 h-16 rounded-[22px] bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-xl shadow-inner relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-green-400/20 to-blue-500/20 rounded-[22px]" />
                <Bot className="w-8 h-8 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)] relative z-10" />
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-md">
              <span className="text-gray-300 text-[13px] font-bold px-2">Ask Guru to value your items</span>
              <div className="w-9 h-9 rounded-[14px] bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 shrink-0">
                <ArrowRight size={16} className="text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Multi-Swap Card */}
        {cyclesQuery.data?.cycles && cyclesQuery.data.cycles.length > 0 && (
          <motion.div
            className="col-span-1 relative overflow-hidden rounded-[28px] bg-gradient-to-br from-orange-400 to-red-500 p-5 shadow-[0_12px_30px_rgba(249,115,22,0.25)] cursor-pointer"
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/swap-wishes?tab=cycles')}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-[20px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="w-11 h-11 rounded-[16px] bg-white/20 flex items-center justify-center mb-4 backdrop-blur-md border border-white/30 shadow-inner">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-black text-white text-[17px] leading-tight mb-1">Multi<br/>Swaps</h3>
            <p className="text-white/90 text-[12px] font-bold bg-black/10 inline-block px-2 py-0.5 rounded-md mt-1 backdrop-blur-sm">{cyclesQuery.data.cycles.length} Available</p>
          </motion.div>
        )}

        {/* Stats / Activity Card */}
        <motion.div
            className={`relative overflow-hidden rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.05)] border border-gray-100/60 cursor-pointer flex flex-col justify-between ${cyclesQuery.data?.cycles && cyclesQuery.data.cycles.length > 0 ? 'col-span-1' : 'col-span-2'}`}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/swipes')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-[20px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="w-11 h-11 rounded-[16px] bg-blue-50 flex items-center justify-center mb-4 border border-blue-100/50 shadow-inner">
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-[17px] leading-tight mb-1">{cyclesQuery.data?.cycles && cyclesQuery.data.cycles.length > 0 ? <>Live<br/>Feed</> : 'Live Activity'}</h3>
            <p className="text-blue-600 text-[12px] font-bold bg-blue-50 inline-block px-2 py-0.5 rounded-md mt-1 border border-blue-100/50">Trending now</p>
          </div>
        </motion.div>
      </div>

      {/* ── Action Dock ─────────────────────────────────────────────────── */}
      <div className="mt-6 px-5">
        <div className="bg-white rounded-[36px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-white">
          <div className="grid grid-cols-3 gap-y-6 gap-x-2">
             {quickActions.map((action, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    if (action.action) action.action();
                    navigate(action.path);
                  }}
                  className="flex flex-col items-center gap-2.5 group outline-none"
                >
                   <motion.div 
                     whileTap={{ scale: 0.9 }}
                     className={`w-16 h-16 rounded-[22px] ${action.bg} ${action.border} border flex items-center justify-center shadow-inner relative overflow-hidden`}
                   >
                     <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <action.icon size={26} className={action.text} strokeWidth={2.5} />
                   </motion.div>
                   <span className="text-[12px] font-bold text-slate-700 tracking-tight">{action.label}</span>
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* ── Immersive Live Swaps (Edge-to-Edge Cards) ──────────────────────────── */}
      <section className="mt-8">
        <div className="px-6 flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-black text-slate-900 tracking-tight">
            Fresh Swaps
          </h2>
          <button onClick={() => navigate("/swipes")} className="text-slate-500 text-[13px] font-bold flex items-center gap-0.5">
            See all <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto px-5 pb-8 scrollbar-hide snap-x pt-2">
          {(feedQuery.data?.items || []).filter((l: any) => l.userId?.toString() !== user?.id?.toString()).slice(0, 10).map((listing: any) => {
            let img = null;
            if (Array.isArray(listing.images) && listing.images.length > 0) {
              img = listing.images[0];
            }
            return (
            <motion.div
              key={listing.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/swipes?id=${listing.id}`)}
              className="snap-start shrink-0 w-[260px] h-[340px] rounded-[36px] overflow-hidden relative shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-gray-100 cursor-pointer group bg-gray-50 flex items-center justify-center"
            >
              {img ? (
                <img src={img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              ) : (
                <Package className="w-16 h-16 text-gray-300" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 pointer-events-none" />
              
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,1)]" />
                <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">Live</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 pt-10">
                 <h3 className="font-black text-white text-[20px] leading-tight line-clamp-2 mb-2 drop-shadow-md">{listing.title}</h3>
                 <div className="flex items-center gap-1.5 text-white/80">
                   <MapPin size={14} className="shrink-0" />
                   <span className="text-[12px] font-bold tracking-wider uppercase truncate">{listing.campus || "Nearby"}</span>
                 </div>
              </div>
            </motion.div>
          )})}
          {(feedQuery.data?.items || []).filter((l: any) => l.userId?.toString() !== user?.id?.toString()).length === 0 && (
            <div className="w-[85vw] shrink-0 bg-white border border-gray-100 rounded-[36px] p-8 flex flex-col items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.04)] text-center h-[340px]">
               <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                 <Package className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="font-bold text-slate-900 text-[18px] mb-1">It's quiet here</h3>
               <p className="text-[14px] text-gray-500 font-medium">No active swaps near you right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Vibrant Swishes (Typography Cards) ────────────────────────────────────── */}
      <section className="mt-2">
        <div className="px-6 flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-black text-slate-900 tracking-tight flex items-center gap-2">
            Swishes <Sparkles className="w-5 h-5 text-yellow-500" />
          </h2>
          <button onClick={() => navigate("/swap-wishes")} className="text-slate-500 text-[13px] font-bold flex items-center gap-0.5">
            See all <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto px-5 pb-8 scrollbar-hide snap-x pt-2">
          {(wishesQuery.data?.items || []).filter((w: any) => w.userId?.toString() !== user?.id?.toString()).slice(0, 10).map((wish: any, i: number) => {
            const gradients = [
              "from-amber-200 to-orange-400",
              "from-emerald-200 to-teal-400",
              "from-blue-200 to-indigo-400",
              "from-fuchsia-200 to-pink-400",
              "from-rose-200 to-red-400"
            ];
            const gradient = gradients[i % gradients.length];
            
            return (
            <motion.div
              key={wish.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/swap-wishes?id=${wish.id}`)}
              className={`snap-start shrink-0 w-[240px] h-[180px] rounded-[32px] bg-gradient-to-br ${gradient} p-5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] cursor-pointer relative overflow-hidden flex flex-col justify-between border border-white/40`}
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-[24px] pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-white/30 backdrop-blur-md text-slate-900 border border-white/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
                    {wish.urgency || "Normal"}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-sm">
                    <span className="text-[13px] font-black text-slate-900">{wish.responseCount || 0}</span>
                  </div>
                </div>
                <p className="font-extrabold text-slate-900 text-[17px] leading-tight line-clamp-2 drop-shadow-sm">{wish.title}</p>
              </div>
              <div className="flex items-center gap-1.5 text-slate-900/80 relative z-10">
                <MapPin size={14} className="shrink-0" />
                <span className="text-[11px] font-bold tracking-wider uppercase truncate">{wish.campus || "Nearby"}</span>
              </div>
            </motion.div>
          )})}
          {(wishesQuery.data?.items || []).filter((w: any) => w.userId?.toString() !== user?.id?.toString()).length === 0 && (
            <div className="w-[85vw] shrink-0 bg-white border border-gray-100 rounded-[32px] p-6 flex flex-col items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.04)] text-center h-[180px]">
               <h3 className="font-bold text-slate-900 text-[16px] mb-1">No active wishes</h3>
               <p className="text-[13px] text-gray-500 font-medium">Post what you're looking for!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Banners ─────────────────────────────────────────────────── */}
      <div className="px-5 mt-2 flex flex-col gap-4">
        {/* Safety First */}
        <motion.button 
          onClick={() => navigate("/safety")}
          whileTap={{ scale: 0.98 }}
          className="w-full p-5 rounded-[32px] text-left block relative overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-gray-100" 
        >
          <div className="absolute right-0 top-0 w-40 h-40 bg-green-500/10 rounded-full blur-[24px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
              <Shield size={26} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[17px] font-extrabold text-slate-900">Safety First</h3>
              <p className="text-[13px] font-medium text-gray-500 mt-0.5 leading-snug">Meet in public places. Verify items.</p>
            </div>
          </div>
        </motion.button>

        {/* Invite a Friend */}
        <motion.button 
          onClick={handleInvite}
          whileTap={{ scale: 0.98 }}
          className="w-full p-5 rounded-[32px] bg-white text-left block relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-gray-100" 
        >
          <div className="absolute right-0 bottom-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[24px] pointer-events-none translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[17px] font-extrabold text-slate-900">Invite a friend</h3>
              <p className="text-[13px] font-medium text-gray-500 mt-0.5">Share the SwapSoko experience!</p>
            </div>
          </div>
        </motion.button>
      </div>
      
    </div>
    </PullToRefresh>
  );
}
