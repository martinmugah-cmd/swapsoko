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
  Sparkles, Shield, Flame, Gift, Bot, Package, ArrowRight, Activity, Clock
} from "lucide-react";

import { PullToRefresh } from "@/components/PullToRefresh";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  
  const { filters, setFilters } = useAppStore();
  
  useEffect(() => {
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pb-32 min-h-screen font-sans relative overflow-hidden">
        
        {/* ── Immersive Animated Background ─────────────────────────────────────────── */}
        <div className="fixed inset-0 z-[-1] bg-[#F4F4F9] overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-20%] w-[70vw] h-[70vw] rounded-full bg-green-300/40 blur-[80px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-blue-300/30 blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[30%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-300/30 blur-[80px]" 
          />
        </div>
      
        {/* ── Ultra-Premium Floating Header ────────────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-2 sticky top-0 z-50">
          <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center justify-between">
            <div className="flex items-center gap-3 pl-1">
              <motion.div
                className="w-11 h-11 rounded-[20px] flex items-center justify-center shadow-lg shadow-black/5 overflow-hidden border border-white bg-white"
                whileTap={{ scale: 0.9 }}
              >
                <img src="/logo.jpg" className="w-full h-full object-cover scale-110" />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="text-[18px] font-black text-slate-900 tracking-tight leading-none drop-shadow-sm">Swapsoko</h1>
                <button onClick={() => setShowLocationSelector(true)} className="flex items-center gap-1 text-[11px] font-extrabold text-slate-600 mt-1 bg-white/50 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/50 w-fit">
                  <MapPin size={10} className="text-green-600" /> <span className="max-w-[90px] truncate">{currentCampus}</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 pr-1">
              <motion.button
                onClick={() => navigate("/notifications")}
                className="relative w-11 h-11 flex items-center justify-center rounded-[20px] bg-white/50 backdrop-blur-md hover:bg-white/80 transition-colors border border-white/60 shadow-sm"
                whileTap={{ scale: 0.9 }}
              >
                <Bell size={20} className="text-slate-800" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full shadow-sm" />
                )}
              </motion.button>

              {isAuthenticated ? (
                <motion.button 
                  onClick={() => navigate("/profile")}
                  whileTap={{ scale: 0.9 }}
                  className="w-11 h-11 rounded-[20px] bg-slate-100 overflow-hidden shadow-sm border border-white/60 relative"
                >
                  {(profileQuery.data?.avatarUrl && profileQuery.data.avatarUrl !== "null" && profileQuery.data.avatarUrl !== "undefined") ? (
                    <img src={profileQuery.data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-600 text-white font-bold text-sm">${(profileQuery.data?.name || user?.name || "U")[0]}</div>`; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-600 text-white font-black text-[15px]">
                      {(profileQuery.data?.name || user?.name || "U")[0]}
                    </div>
                  )}
                </motion.button>
              ) : (
                <button 
                  onClick={() => navigate("/login")}
                  className="px-5 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded-[20px] shadow-lg hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </button>
              )}
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
              className="fixed inset-0 z-[600] flex items-end justify-center"
              style={{ background: "rgba(15,23,42,0.3)", backdropFilter: "blur(12px)" }}
              onClick={() => setShowLocationSelector(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white/90 backdrop-blur-2xl border-t border-white/50 w-full max-w-[480px] rounded-t-[40px] p-6 pb-12 max-h-[85vh] overflow-y-auto shadow-[0_-20px_60px_rgba(0,0,0,0.15)]"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-6" />
                <h3 className="font-black text-slate-900 text-2xl mb-4 text-center">Select Campus</h3>
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

        {/* ── Greeting & Search Command Center ─────────────────────────────────────────────────── */}
        <div className="px-6 mt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-[1.1] drop-shadow-sm">
              {getGreeting()},<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-400 to-blue-500">
                {user?.name?.split(' ')[0] || "Swapper"}
              </span>
            </h2>
          </motion.div>
          
          <motion.div 
            className="mt-6 relative group cursor-pointer" 
            onClick={() => navigate("/swipes")}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
             <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-[28px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />
             <div className="relative bg-white/60 backdrop-blur-2xl border border-white rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden flex items-center px-5 py-4 transition-transform group-hover:scale-[1.02] duration-300">
               <Search size={22} className="text-slate-500 shrink-0" />
               <input 
                 type="text" 
                 placeholder="What are you looking for?" 
                 className="w-full bg-transparent pl-3 pr-4 text-[16px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none pointer-events-none"
                 readOnly
               />
               <div className="w-10 h-10 rounded-[18px] bg-slate-900 flex items-center justify-center shrink-0 shadow-md">
                 <ArrowRight size={18} className="text-white" />
               </div>
             </div>
          </motion.div>
        </div>

        {/* ── The Master Bento Grid ─────────────────────────────────────────── */}
        <div className="px-6 mt-8 grid grid-cols-2 gap-4">
          
          {/* Main AI Guru Card (Span 2) */}
          <motion.div
            className="col-span-2 relative overflow-hidden rounded-[36px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.15)] cursor-pointer bg-[#0A0A0A] border border-white/10"
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/swap-guru")}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <motion.div 
              className="absolute top-[-30%] right-[-10%] w-64 h-64 bg-green-500/40 rounded-full blur-[60px] pointer-events-none"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-[-30%] left-[-10%] w-64 h-64 bg-blue-500/40 rounded-full blur-[60px] pointer-events-none"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-3 backdrop-blur-xl shadow-inner">
                    <Sparkles size={12} className="text-green-300" />
                    <span className="text-[10px] font-black text-white tracking-widest uppercase drop-shadow-sm">Swap Guru AI</span>
                  </div>
                  <h2 className="text-white font-black text-[32px] leading-[1.1] tracking-tight drop-shadow-md">Trade<br/>Smarter.</h2>
                </div>
                <div className="w-16 h-16 rounded-[22px] bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] relative">
                  <Bot className="w-8 h-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-10" />
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-[24px] p-2 backdrop-blur-xl shadow-lg">
                <span className="text-white/90 text-[14px] font-bold px-3">Evaluate items instantly</span>
                <div className="w-10 h-10 rounded-[18px] bg-white text-slate-900 flex items-center justify-center shadow-lg shrink-0">
                  <ArrowRight size={18} className="font-black" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Post Item Card (Span 1, Square) */}
          <motion.div
            className="col-span-1 aspect-square relative overflow-hidden rounded-[32px] bg-gradient-to-br from-green-400 to-emerald-600 p-5 shadow-[0_12px_30px_rgba(34,197,94,0.3)] cursor-pointer flex flex-col justify-between border border-white/20"
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/post")}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-[20px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="w-12 h-12 rounded-[20px] bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
              <Plus className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <div>
              <h3 className="font-black text-white text-[20px] leading-tight mb-1 drop-shadow-sm">Post<br/>Item</h3>
              <p className="text-white/90 text-[12px] font-bold">List what you have</p>
            </div>
          </motion.div>

          {/* Post Wish Card (Span 1, Square) */}
          <motion.div
            className="col-span-1 aspect-square relative overflow-hidden rounded-[32px] bg-gradient-to-br from-yellow-400 to-orange-500 p-5 shadow-[0_12px_30px_rgba(245,158,11,0.3)] cursor-pointer flex flex-col justify-between border border-white/20"
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/swap-wishes")}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-[24px] pointer-events-none translate-y-1/3 translate-x-1/3" />
            <div className="w-12 h-12 rounded-[20px] bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h3 className="font-black text-white text-[20px] leading-tight mb-1 drop-shadow-sm">Post<br/>Wish</h3>
              <p className="text-white/90 text-[12px] font-bold">Request items</p>
            </div>
          </motion.div>

        </div>

        {/* ── Premium Scrollable Dock (Communities / Shortcuts) ─────────────────────────────────────────────────── */}
        <div className="mt-8">
          <h2 className="px-6 text-[18px] font-black text-slate-900 mb-4 tracking-tight drop-shadow-sm">Explore</h2>
          <div className="flex justify-between px-6 pb-6 w-full">
            
            <motion.button onClick={() => navigate("/communities")} className="flex flex-col items-center gap-2 group outline-none w-[72px]" whileTap={{ scale: 0.9 }}>
               <div className="w-16 h-16 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.04)] flex items-center justify-center group-hover:bg-white transition-colors relative overflow-hidden">
                 <Users size={26} className="text-blue-500" strokeWidth={2.5} />
               </div>
               <span className="text-[12px] font-extrabold text-slate-700">Soko</span>
            </motion.button>
            
            <motion.button onClick={() => navigate('/swap-wishes?tab=cycles')} className="flex flex-col items-center gap-2 group outline-none w-[72px]" whileTap={{ scale: 0.9 }}>
               <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-orange-400 to-red-500 border border-white/40 shadow-[0_8px_20px_rgba(249,115,22,0.3)] flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <Flame size={26} className="text-white" strokeWidth={2.5} />
               </div>
               <span className="text-[12px] font-extrabold text-slate-700 whitespace-nowrap">Multi Cycle</span>
            </motion.button>

            <motion.button onClick={() => { setFilters({ query: "", category: 'urgent' }); navigate("/swap-wishes"); }} className="flex flex-col items-center gap-2 group outline-none w-[72px]" whileTap={{ scale: 0.9 }}>
               <div className="w-16 h-16 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.04)] flex items-center justify-center group-hover:bg-white transition-colors relative overflow-hidden">
                 <Zap size={26} className="text-red-500" strokeWidth={2.5} />
               </div>
               <span className="text-[12px] font-extrabold text-slate-700">Urgent</span>
            </motion.button>

            <motion.button onClick={() => { setFilters({ query: "", condition: 'free', category: 'donations' }); navigate("/swipes"); }} className="flex flex-col items-center gap-2 group outline-none w-[72px]" whileTap={{ scale: 0.9 }}>
               <div className="w-16 h-16 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.04)] flex items-center justify-center group-hover:bg-white transition-colors relative overflow-hidden">
                 <Heart size={26} className="text-pink-500" strokeWidth={2.5} />
               </div>
               <span className="text-[12px] font-extrabold text-slate-700">Donations</span>
            </motion.button>

          </div>
        </div>

        {/* ── Immersive Glass Cards (Fresh Swaps) ──────────────────────────── */}
        <section className="mt-4">
          <div className="px-6 flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-black text-slate-900 tracking-tight drop-shadow-sm">
              Fresh Drops
            </h2>
            <button onClick={() => navigate("/swipes")} className="bg-white/50 backdrop-blur-md border border-white/60 px-3 py-1.5 rounded-full text-slate-700 text-[12px] font-bold shadow-sm">
              View all
            </button>
          </div>
          
          <div className="flex gap-5 overflow-x-auto px-6 pb-8 scrollbar-hide snap-x pt-2">
            {(feedQuery.data?.items || []).filter((l: any) => l.userId?.toString() !== user?.id?.toString()).slice(0, 10).map((listing: any) => {
              let img = null;
              if (Array.isArray(listing.images) && listing.images.length > 0) {
                img = listing.images[0];
              }
              return (
              <motion.div
                key={listing.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/swipes?id=${listing.id}`)}
                className="snap-start shrink-0 w-[280px] h-[360px] rounded-[40px] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[4px] border-white/80 cursor-pointer group bg-white/40 backdrop-blur-2xl flex items-center justify-center"
              >
                {img ? (
                  <img src={img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <Package className="w-16 h-16 text-gray-400 opacity-50" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                
                <div className="absolute top-5 left-5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center gap-1.5 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,1)]" />
                  <span className="text-[10px] font-black text-white tracking-widest uppercase">Live</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 pt-10">
                   <h3 className="font-black text-white text-[22px] leading-tight line-clamp-2 mb-2.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{listing.title}</h3>
                   <div className="flex items-center gap-1.5 text-white/90">
                     <MapPin size={14} className="shrink-0" />
                     <span className="text-[12px] font-extrabold tracking-wider uppercase truncate">{listing.campus || "Nearby"}</span>
                   </div>
                </div>
              </motion.div>
            )})}
            {(feedQuery.data?.items || []).filter((l: any) => l.userId?.toString() !== user?.id?.toString()).length === 0 && (
              <div className="w-[85vw] shrink-0 bg-white/60 backdrop-blur-xl border border-white/80 rounded-[40px] p-8 flex flex-col items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.04)] text-center h-[360px]">
                 <div className="w-16 h-16 rounded-full bg-white/50 border border-white/60 flex items-center justify-center mb-4 shadow-inner">
                   <Clock className="w-8 h-8 text-slate-400" />
                 </div>
                 <h3 className="font-black text-slate-900 text-[20px] mb-1">Check back soon</h3>
                 <p className="text-[14px] text-slate-500 font-medium max-w-[200px]">No active swaps near you right now.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Banners ─────────────────────────────────────────────────── */}
        <div className="px-6 mt-4 flex flex-col gap-4">
          <motion.button 
            onClick={() => navigate("/safety")}
            whileTap={{ scale: 0.97 }}
            className="w-full p-5 rounded-[32px] text-left block relative overflow-hidden bg-white/60 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-white/80" 
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-[0_8px_20px_rgba(52,211,153,0.3)] border border-white/20">
                <Shield size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-black text-slate-900">Safety First</h3>
                <p className="text-[13px] font-bold text-slate-500 mt-0.5 leading-snug">Meet in public places. Verify items.</p>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </div>
          </motion.button>
        </div>
        
      </div>
    </PullToRefresh>
  );
}
