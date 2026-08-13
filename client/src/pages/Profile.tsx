import { trpc } from "@/lib/trpc";
import { useAppStore } from "@/store";
import { useAuth } from "@/_core/hooks/useAuth";
import { ReportModal } from "@/components/ReportModal";
import { Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Lock,
  Package, Star, User, Users, Bell, Settings, LogOut, Heart, MapPin, 
  Shield, ShieldAlert, Activity, CheckCircle, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Plus, Search, HelpCircle, Globe, XCircle, Handshake, RefreshCw, UserPlus, CheckCircle2,
  MessageCircle, Clock, Scale, Repeat2, TrendingUp, Award, X, Camera, Trash2, Edit, Calendar, GraduationCap, AlertCircle, QrCode
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

import { useLocation, useRoute } from "wouter";

// ─── Match Suggestions Modal ───────────────────────────────────────────────────
function MatchSuggestionsModal({ listing, onClose }: { listing: any, onClose: () => void }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const feedQuery = trpc.listings.feed.useQuery({ limit: 200 });
  const items = feedQuery.data?.items || [];
  
  const matches = items.map((target: any) => {
    if (target.id === listing.id || target.userId === user?.id) return null;
    let score = 0;
    const reasons: string[] = [];
    
    if (target.category === listing.category) { score += 20; reasons.push("Same Category"); }
    
    const tWords = (target.title + " " + target.description).toLowerCase();
    const wantWords = (Array.isArray(listing.wantItems) ? listing.wantItems.join(" ") : listing.wantItems || "").toLowerCase();
    let matchedKeyword = false;
    wantWords.split(" ").forEach((w: string) => {
      if (w.length > 3 && tWords.includes(w)) {
        score += 25;
        matchedKeyword = true;
      }
    });
    if (matchedKeyword) reasons.push("Has what you want!");
    
    if (target.campus === listing.campus) { score += 15; reasons.push("Same Campus"); }
    if (listing.cashTopUpAllowed && target.cashTopUpAllowed) { score += 10; reasons.push("Cash-Bridge Compatible"); }
    if (target.trustScore && target.trustScore > 80) { score += 5; reasons.push("High Trust User"); }

    return { target, score, reasons };
  }).filter(Boolean) as { target: any, score: number, reasons: string[] }[];
  
  const topMatches = matches.filter(m => m.score > 0).sort((a,b) => b.score - a.score).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-[480px] mx-auto rounded-t-[32px] p-5 pb-28 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Search className="w-5 h-5 text-green-500" /> Best Exchange Paths</h3>
        <p className="text-gray-400 text-sm mt-1">Suggested matches for your <span className="font-semibold text-slate-900">{listing.title}</span></p>

        {feedQuery.isLoading ? (
           <div className="mt-4 space-y-4">
             {[1, 2, 3].map(i => (
               <div key={`sk-match-${i}`} className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl p-3 animate-pulse">
                 <div className="flex gap-3">
                   <div className="w-20 h-20 bg-gray-100 rounded-2xl"></div>
                   <div className="flex-1 min-w-0 py-1">
                     <div className="flex justify-between items-start mb-2">
                       <div className="h-4 bg-gray-100 rounded-full w-24"></div>
                       <div className="h-6 w-12 bg-gray-100 rounded-full"></div>
                     </div>
                     <div className="h-3 bg-gray-100 rounded-full w-3/4 mb-2"></div>
                     <div className="h-3 bg-gray-100 rounded-full w-1/2"></div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        ) : topMatches.length === 0 ? (
           <div className="py-8 text-center text-gray-500">No strong matches found right now.</div>
        ) : (
          <div className="mt-4 space-y-4">
            {topMatches.map((m, i) => (
              <motion.div 
                 key={i} 
                 whileTap={{ scale: 0.98 }}
                 onClick={() => navigate(`/swipes?item=${m.target.id}`)}
                 className="bg-white/70 backdrop-blur-md border border-gray-100 card-shadow rounded-2xl p-3 cursor-pointer hover:border-green-500/50 transition-colors"
              >
                <div className="flex gap-3">
                  <img src={(m.target.images && m.target.images[0]) || "/logo.jpg"} className="w-16 h-16 rounded-2xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{m.target.title}</h4>
                    <p className="text-xs text-gray-400">{m.target.campus}</p>
                    <div className="flex items-center gap-1 mt-1">
                       <span className="bg-[#F0FDF4] text-green-500 text-xs font-bold px-2 py-0.5 rounded-full">{m.score}% Match</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 bg-gray-50 rounded-2xl p-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Match Reasons</p>
                  <div className="flex flex-wrap gap-1">
                    {m.reasons.map(r => (
                       <span key={r} className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500"/> {r}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}



// Modal removed as per user request


// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-3xl p-3 card-shadow text-center">
      <div className={`w-8 h-8 rounded-2xl mx-auto mb-2 flex items-center justify-center`} style={{ backgroundColor: color + "20" }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <p className="font-bold text-slate-900 text-lg leading-none">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Public Profile View ────────────────────────────────────────────────────────
function PublicProfileView({ 
  profile, targetUserId, onBack, listingsQuery, wishesQuery, 
  membershipsQuery, myMembershipsQuery, watchedUserIds, toggleWatchedUser, user 
}: any) {
  const [, navigate] = useLocation();
  const filters = useAppStore(s => s.filters);
  const [showGrid, setShowGrid] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const newRoomMut = trpc.chat.newRoom.useMutation();

  const handleMessage = async () => {
    if (!user) return navigate("/login");
    toast.loading("Opening chat...", { id: "chat" });
    try {
      const res = await newRoomMut.mutateAsync({ userId: user.id, toUserId: targetUserId });
      toast.dismiss("chat");
      if (res && res.id) navigate(`/chat/${res.id}`);
      else navigate(`/chat/${targetUserId}`);
    } catch(e) {
      toast.error("Failed to open chat", { id: "chat" });
    }
  };

  const completedSwaps = profile?.completedSwaps ?? 0;
  
  const acceptanceRate = profile?.acceptanceRate ?? 0;
  const avgResponseMinutes = profile?.avgResponseTimeMinutes ?? 0;
  const avgResponseTime = avgResponseMinutes < 60 ? `< ${Math.max(avgResponseMinutes, 1)} min` : `< ${Math.ceil(avgResponseMinutes / 60)} hr`;
  const memberSince = new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  let targetProfileData = profile?.university !== undefined ? profile : (listingsQuery.data?.items?.[0]?.profiles || wishesQuery.data?.items?.[0]?.profiles || {});
  let desc: any = {};
  let uni: any = {};
  try { desc = JSON.parse(targetProfileData?.description || "{}"); } catch(e) {}
  try { uni = JSON.parse(targetProfileData?.university || "{}"); } catch(e) {}
  
  let username = desc.username || uni.username || targetProfileData?.user_metadata?.username || targetProfileData?.name?.toLowerCase().replace(/\s+/g, '') || "user";
  let avatarUrl = targetProfileData?.avatarUrl;
  let name = targetProfileData?.name || targetProfileData?.user_metadata?.full_name || "User";
  let uniVal = targetProfileData?.campus || "University";
  let isStudentVerified = targetProfileData?.isStudentVerified;
  let bio = "";
  let targetLat: number | null = null;
  let targetLng: number | null = null;
  let privacyVisibility = "Public";
  let showDistance = true;
  let showLastActive = true;

  try {
    const desc = JSON.parse(targetProfileData?.university || "{}");
    const dDesc = JSON.parse(targetProfileData?.description || "{}");
    if (desc.isStudentVerified || dDesc.isStudentVerified || targetProfileData?.isStudentVerified) isStudentVerified = true;
    if (desc.username || dDesc.username) username = desc.username || dDesc.username;
    if (desc.avatarUrl) avatarUrl = desc.avatarUrl;
    if (desc.val) uniVal = desc.val;
    if (desc.name) name = desc.name;
    if (desc.bio) bio = desc.bio;
    if (desc.lat && desc.lng) { targetLat = desc.lat; targetLng = desc.lng; }
    if (desc.privacy) {
       privacyVisibility = desc.privacy.visibility || "Public";
       if (desc.privacy.showDistance !== undefined) showDistance = desc.privacy.showDistance;
       if (desc.privacy.showLastActive !== undefined) showLastActive = desc.privacy.showLastActive;
    }
  } catch(e) {
    if (targetProfileData?.university && !targetProfileData.university.startsWith('{')) {
      uniVal = targetProfileData.university;
    }
  }

  if (privacyVisibility === "SwapSoko Users" && !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
           <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"><ChevronLeft size={24} className="text-slate-900"/></button>
        </div>
        <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
           <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
             <Lock className="w-8 h-8 text-gray-400" />
           </div>
           <h2 className="text-xl font-bold text-gray-800 mb-2">Profile is Protected</h2>
           <p className="text-sm text-gray-500 mb-8 max-w-[260px]">This user only shares their profile and listings with signed-in SwapSoko users.</p>
           <button onClick={() => navigate("/login")} className="gradient-green text-white font-bold py-3 px-8 rounded-full shadow-lg">Sign In to View</button>
        </div>
      </div>
    );
  }

  
  if (!targetLat && listingsQuery.data?.items?.[0]?.latitude) {
    targetLat = listingsQuery.data.items[0].latitude;
    targetLng = listingsQuery.data.items[0].longitude;
  }
  let distanceText = "";
  if (showDistance) {
    if (targetLat && targetLng && filters.coords) {
      const R = 6371; // km
      const dLat = (targetLat - filters.coords.lat) * Math.PI / 180;
      const dLon = (targetLng - filters.coords.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(filters.coords.lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distanceText = dist < 1 ? `About ${(dist*1000).toFixed(0)}m away` : `About ${dist.toFixed(1)}km away`;
    } else {
      distanceText = "Location hidden";
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pb-48">


      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-[#F8FAFC] px-4 pt-12 pb-10 relative">
        <button onClick={onBack || (() => window.history.back())} className="absolute top-6 left-4 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform z-10">
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </button>
        {user?.id !== targetUserId && (
          <button onClick={() => setIsReporting(true)} className="absolute top-6 right-4 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform z-10">
            <Flag className="w-5 h-5 text-red-500" />
          </button>
        )}

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden shadow-md border-4 border-white mb-4 relative">
            {avatarUrl ? (
              <img src={avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl font-black text-gray-400">${(name || "U")[0]}</div>`; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-400">{(name || "U")[0]}</div>
            )}
            {isStudentVerified && (
              <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                <CheckCircle2 className="w-5 h-5 fill-[#22C55E] text-white" />
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{name}</h1>
          <div className="flex items-center gap-1 mt-0.5 justify-center">
            <p className="text-gray-500 font-medium">@{username}</p>
            {isStudentVerified && <GraduationCap className="w-4 h-4 text-blue-500" />}
          </div>
          
          <div className="flex flex-col items-center mt-3 space-y-1.5">
            {uniVal === "Other / Not a student" ? (
              <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-500 text-sm font-semibold shadow-sm border border-gray-200 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Not a student
              </span>
            ) : isStudentVerified ? (
              <span className="bg-green-50 px-3 py-1 rounded-full text-green-700 text-sm font-semibold shadow-sm border border-green-100 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" /> Verified Student {uniVal !== "University" ? `• ${uniVal}` : ""}
              </span>
            ) : (
              <span className="bg-orange-50 px-3 py-1 rounded-full text-orange-600 text-sm font-semibold shadow-sm border border-orange-100 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Student Not Verified
              </span>
            )}
            {distanceText && (
              <p className="text-gray-400 text-xs flex items-center justify-center flex-wrap gap-1 font-medium mt-2">
                 <MapPin className="w-3.5 h-3.5" />
                 {targetProfileData?.location_name ? (
                   <span>{targetProfileData.location_name} • {distanceText}</span>
                 ) : (
                   <span>{distanceText}</span>
                 )}
              </p>
            )}
            {showLastActive && (
              <p className="text-gray-400 text-xs flex items-center gap-1 font-medium mt-1">
                 <div className="w-2 h-2 rounded-full bg-green-500" /> Active recently
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4 relative z-20">
        {/* Bio */}
        {bio && (
          <div className="bg-white p-5 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
            <h3 className="font-extrabold text-gray-900 text-lg mb-2 tracking-tight">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
          </div>
        )}

        {/* Active Listings Carousel */}
        <div className="bg-white py-5 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-5 flex items-center justify-between mb-4">
             <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">Active Listings</h3>
             <span onClick={() => setShowGrid(true)} className="text-blue-600 text-xs font-bold cursor-pointer hover:underline">See All</span>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar px-5 pb-2 gap-3">
            {listingsQuery.isLoading ? (
               <div className="flex gap-3">
                 {[1, 2, 3].map((i) => (
                   <div key={`sk-${i}`} className="min-w-[140px] w-[140px] h-36 bg-gray-100 rounded-2xl animate-pulse"></div>
                 ))}
               </div>
            ) : listingsQuery.data?.items?.length === 0 ? (
               <div className="text-xs text-gray-400 font-medium">No active listings</div>
            ) : (
               (listingsQuery.data?.items || []).filter((l: any) => l.status !== 'hidden' || targetUserId === user?.id).map((l: any) => (
                 <div key={l.id} className="min-w-[140px] w-[140px] bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 cursor-pointer relative" onClick={() => setShowGrid(true)}>
                   <div className="h-28 bg-gray-200 relative">
                      {l.status === 'finalized' && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">Swapped</div>}
                      {l.status === 'hidden' && targetUserId === user?.id && <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">Hidden</div>}
                      {l.images && l.images[0] ? (
                        <img src={l.images[0]} className={`w-full h-full object-cover ${l.status !== 'active' ? 'opacity-50 grayscale' : ''}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Package className="w-8 h-8" /></div>
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <p className={`font-bold text-gray-900 text-xs truncate ${l.status !== 'active' ? 'opacity-50' : ''}`}>{l.title}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Swap Wishes */}
        <div className="bg-white p-5 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
          <h3 className="font-extrabold text-gray-900 text-lg mb-3 tracking-tight">Swishes</h3>
          {wishesQuery.isLoading ? (
             <div className="space-y-3">
               {[1, 2].map((i) => (
                 <div key={`sk-w-${i}`} className="h-[44px] w-full bg-gray-100 rounded-2xl animate-pulse"></div>
               ))}
             </div>
          ) : wishesQuery.data?.items?.length === 0 ? (
             <div className="text-xs text-gray-400 font-medium">Nothing specific right now.</div>
          ) : (
            <ul className="space-y-3">
              {(wishesQuery.data?.items || []).map((w: any) => (
                <li key={w.id} className="flex items-center gap-3 text-sm text-gray-700 font-medium bg-gray-50 px-4 py-3 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> {w.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Communities */}
        <div className="bg-white p-5 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
          <h3 className="font-extrabold text-gray-900 text-lg mb-3 tracking-tight">Communities</h3>
          {membershipsQuery.isLoading ? (
             <div className="space-y-3">
               {[1, 2].map((i) => (
                 <div key={`sk-m-${i}`} className="h-[44px] w-full bg-gray-100 rounded-2xl animate-pulse"></div>
               ))}
             </div>
          ) : (() => {
            if (!myMembershipsQuery || !myMembershipsQuery.data?.items) return <div className="text-xs text-gray-400 font-medium">No mutual communities</div>;
            const myCommIds = new Set(myMembershipsQuery.data.items.map((m: any) => m.communityId));
            const mutualComms = (membershipsQuery.data?.items || []).filter((m: any) => myCommIds.has(m.communityId));
            if (mutualComms.length === 0) return <div className="text-xs text-gray-400 font-medium">No mutual communities</div>;
            return (
              <div className="space-y-2 mt-2">
                {mutualComms.map((m: any) => (
                  <div key={`mutual-${m.id}`} className="flex items-center gap-3 text-sm font-bold text-gray-800 bg-blue-50 p-3 rounded-2xl">
                    <Users className="w-5 h-5 text-blue-600" /> {m.communities?.name || "Community"}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Safety Card */}
        <div className="bg-white p-5 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] mb-8">
          <h3 className="font-extrabold text-gray-900 text-lg mb-4 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" /> Safety
          </h3>
          <div className="space-y-3">
             {uniVal === "Other / Not a student" ? null : isStudentVerified ? (
               <p className="flex items-center gap-3 text-sm font-medium px-4 py-2.5 rounded-2xl text-gray-700 bg-green-50/50 border border-green-100/50">
                 <CheckCircle className="w-5 h-5 text-green-500" /> Verified Student
               </p>
             ) : (
               <p className="flex items-center gap-3 text-sm font-medium px-4 py-2.5 rounded-2xl text-orange-700 bg-orange-50/50 border border-orange-100/50">
                 <AlertCircle className="w-5 h-5 text-orange-500" /> Student Not Verified
               </p>
             )}
             <p className="flex items-center gap-3 text-sm font-medium text-gray-700 bg-green-50/50 border border-green-100/50 px-4 py-2.5 rounded-2xl">
               <CheckCircle className="w-5 h-5 text-green-500" /> Email Verified
             </p>
             <p className="flex items-center gap-3 text-sm font-medium text-gray-700 bg-green-50/50 border border-green-100/50 px-4 py-2.5 rounded-2xl">
               <CheckCircle className="w-5 h-5 text-green-500" /> Clean Record
             </p>
          </div>
        </div>
      </div>

      {/* Grid Modal */}
      <AnimatePresence>
        {showGrid && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed left-1/2 -translate-x-1/2 w-full max-w-md bottom-0 top-[10%] bg-white rounded-t-[32px] z-[300] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-5 flex items-center justify-between border-b border-gray-100 z-10">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{name}'s Listings</h2>
              <button onClick={() => setShowGrid(false)} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-600" /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 pb-32">
              {(listingsQuery.data?.items || []).filter((l: any) => l.status !== 'hidden' || targetUserId === user?.id).map((l: any) => (
                <div key={l.id} className="bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 cursor-pointer flex flex-col relative" onClick={() => { setShowGrid(false); navigate("/swipes?item=" + l.id); }}>
                   <div className="aspect-square bg-gray-100 relative">
                     {l.status === 'finalized' && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">Swapped</div>}
                     {l.status === 'hidden' && targetUserId === user?.id && <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">Hidden</div>}
                     {l.images && l.images[0] ? <img src={l.images[0]} className={`absolute inset-0 w-full h-full object-cover ${l.status !== 'active' ? 'opacity-50 grayscale' : ''}`} /> : <div className="absolute inset-0 flex items-center justify-center text-gray-300"><Package className="w-8 h-8" /></div>}
                   </div>
                   <div className="p-4">
                     <p className={`font-bold text-gray-900 text-sm truncate ${l.status !== 'active' ? 'opacity-50' : ''}`}>{l.title}</p>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Floating Actions */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[400px] bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-2 flex justify-between z-50 border border-gray-100">
         <motion.button 
           onClick={handleMessage}
           whileTap={{ scale: 0.95 }} 
           className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-white bg-green-500 rounded-2xl shadow-sm hover:opacity-90"
         >
           <MessageCircle className="w-5 h-5" />
           <span className="text-xs font-bold tracking-wide">Message</span>
         </motion.button>
         
         <motion.button 
           onClick={() => setShowGrid(true)}
           whileTap={{ scale: 0.95 }} 
           className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-gray-700 rounded-2xl hover:bg-gray-50"
         >
           <Package className="w-5 h-5" />
           <span className="text-xs font-bold tracking-wide">View Items</span>
         </motion.button>
         
         <motion.button 
           onClick={() => targetUserId && toggleWatchedUser(targetUserId.toString())}
           whileTap={{ scale: 0.95 }} 
           className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl hover:bg-gray-50 ${targetUserId && watchedUserIds.includes(targetUserId.toString()) ? 'text-red-500' : 'text-gray-700'}`}
         >
           <Heart className={`w-5 h-5 ${targetUserId && watchedUserIds.includes(targetUserId.toString()) ? 'fill-current' : ''}`} />
           <span className="text-xs font-bold tracking-wide">Save Trader</span>
         </motion.button>
      </div>
      <ReportModal isOpen={isReporting} onClose={() => setIsReporting(false)} targetType="user" targetId={targetUserId} />
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export default function ProfilePage({ uid, onBack }: { uid?: string, onBack?: () => void } = {}) {
    const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
    const [showMatchesForListing, setShowMatchesForListing] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"listings" | "swaps" | "saved">("listings");
  const [swapsTab, setSwapsTab] = useState<"pending" | "accepted" | "completed" | "cancelled">("pending");
  const [editingListing, setEditingListing] = useState<any>(null);
  const [matchId, paramsId] = useRoute("/profile/:id");
  const targetUserId = uid || ((matchId && paramsId?.id) ? paramsId.id : user?.id);
  const isMe = targetUserId === user?.id;

  const profileQuery = trpc.profile.get.useQuery({ id: targetUserId }, { enabled: !!targetUserId });
  const profileData = profileQuery.data as any;
  const profile = profileData?.items?.[0] || (Array.isArray(profileData) ? profileData[0] : profileData);
  console.log("PROFILE QUERY DEBUG:", { targetUserId, isLoading: profileQuery.isLoading, data: profileQuery.data, profile });
  let username = "User";
  try {
     const uni = JSON.parse(profile?.university || "{}");
     const desc = JSON.parse(profile?.description || "{}");
     if (uni.username) username = uni.username;
     else if (desc.username) username = desc.username;
     else if (isMe && user?.metadata?.username) username = user.metadata.username;
  } catch(e) {}
  if (username === "User") {
     const n = isMe ? (user?.metadata?.name || profile?.name) : profile?.name;
     if (n && n !== "SwapSoko User" && n !== "User") username = n.split(" ").join("").toLowerCase();
  }
  const displayName = "@" + username;
  let isStudentVerified = false;
  let uniVal = "University";
  let extractedAvatar = "";
  try {
     const u = JSON.parse(profile?.university || "{}");
     const d = JSON.parse(profile?.description || "{}");
     isStudentVerified = (isMe ? user?.metadata?.isStudentVerified : false) || profile?.isStudentVerified || u.isStudentVerified || d.isStudentVerified;
     uniVal = u.val || profile?.campus || "University";
     extractedAvatar = u.avatarUrl || d.avatarUrl || "";
  } catch(e) {}
  
  let tempAvatar = isMe ? (user?.avatarUrl || profile?.avatarUrl || extractedAvatar) : (profile?.avatarUrl || extractedAvatar);
  const displayAvatar = (tempAvatar && tempAvatar !== "null" && tempAvatar !== "undefined") ? tempAvatar : "";
  const listingsQuery = trpc.listings.myListings.useQuery({ userId: targetUserId }, { enabled: !!targetUserId });
  const wishesQuery = trpc.wishes.myWishes.useQuery({ userId: targetUserId }, { enabled: !!targetUserId });
  const proposalsQuery = trpc.proposals.myProposals.useQuery({ userId: targetUserId }, { enabled: isMe && activeTab === "swaps" && !!targetUserId });
    const membershipsQuery = trpc.communities.myMemberships.useQuery({ userId: targetUserId }, { enabled: !isMe && !!targetUserId });
    const myMembershipsQuery = trpc.communities.myMemberships.useQuery({ userId: user?.id }, { enabled: isAuthenticated && !isMe && !!user?.id });
  
  const { savedItemIds, savedWishIds, watchedCommunityIds, watchedUserIds, watchedCategoryIds, toggleWatchedUser, toggleWatchedCategory } = useAppStore();
  const feedQuery = trpc.listings.list.useQuery({ idIn: savedItemIds.length > 0 ? savedItemIds.map(Number) : [-1] } as any, { enabled: isAuthenticated && activeTab === "saved" });
  const savedItems = (feedQuery.data?.items || []).filter((l: any) => (savedItemIds || []).includes(l.id?.toString()));

  const wishesFeedQuery = trpc.wishes.list.useQuery({ idIn: savedWishIds.length > 0 ? savedWishIds.map(Number) : [-1] } as any, { enabled: isAuthenticated && activeTab === "saved" });
  const savedWishes = (wishesFeedQuery.data?.items || []).filter((w: any) => (savedWishIds || []).includes(w.id?.toString()));

  const { data: createdCommunitiesData } = trpc.communities.list.useQuery({ creatorId: targetUserId }, { enabled: !!targetUserId });
  const createdCommunities = createdCommunitiesData?.items || [];

  const communitiesQuery = trpc.communities.list.useQuery({ idIn: watchedCommunityIds.length > 0 ? watchedCommunityIds.map(Number) : [-1] } as any, { enabled: isAuthenticated && activeTab === "saved" });
  const watchedCommunities = (communitiesQuery.data?.items || []).filter((c: any) => (watchedCommunityIds || []).includes(c.id?.toString()));

  const deleteListingMutation = trpc.listings.delete.useMutation();
  const deleteWishMutation = trpc.wishes.delete.useMutation();
  const deleteAccountMutation = trpc.profile.deleteAccount.useMutation();
  const updateMutation = trpc.listings.update.useMutation({
    onSuccess: () => { listingsQuery.refetch(); }
  });
  const updateProposalMutation = trpc.proposals.update.useMutation({
    onSuccess: () => {
      proposalsQuery.refetch();
      toast.success("Offer updated");
    }
  });
  
  const updateProposalStatus = (id: number, status: string) => {
    updateProposalMutation.mutate({ id, status });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-8 text-center bg-[#F8FAFC]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-swap-green/20 blur-[32px] rounded-full scale-[2]"></div>
            <div className="relative w-24 h-24 bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-[2rem] flex items-center justify-center rotate-3 transform-gpu">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-inner bg-white flex items-center justify-center -rotate-3">
                 <img src="/logo.jpg" alt="SwapSoko" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          
          <h2 className="font-bold text-slate-900 text-[26px] tracking-tight mb-3">Access Profile</h2>
          <p className="text-slate-500 text-[15px] max-w-[280px] leading-relaxed mb-10 font-medium">
            Sign in to view your profile, manage your listings, and track your swaps.
          </p>
          
          <motion.button
            onClick={() => navigate("/login")}
            whileTap={{ scale: 0.96 }}
            className="bg-slate-900 text-white font-semibold py-3.5 px-10 rounded-full shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_8px_25px_rgba(15,23,42,0.2)] hover:-translate-y-0.5 transition-all w-full max-w-[280px] text-[15px]"
          >
            Sign In to Continue
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!isMe && profileQuery.isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#F8FAFC] pb-24">
        {/* Cover Skeleton */}
        <div className="h-48 bg-gray-200 animate-pulse w-full"></div>
        {/* Profile Info Skeleton */}
        <div className="px-5 -mt-12 relative z-10 animate-pulse">
          <div className="w-[100px] h-[100px] rounded-3xl bg-gray-100 border-[4px] border-[#F8FAFC] shadow-sm mb-4"></div>
          <div className="flex items-center justify-between">
            <div>
              <div className="w-32 h-6 bg-gray-200 rounded-full mb-2"></div>
              <div className="w-24 h-4 bg-gray-200 rounded-full"></div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
          <div className="mt-6 space-y-3">
             <div className="w-full h-[40px] bg-gray-200 rounded-full"></div>
             <div className="w-full h-16 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isMe) {
     return (
       <PublicProfileView 
         user={user}
         profile={profile || { name: "User", id: targetUserId, user_id: targetUserId }}
         targetUserId={targetUserId}
         onBack={onBack}
         listingsQuery={listingsQuery}
         wishesQuery={wishesQuery}
         membershipsQuery={membershipsQuery}
         myMembershipsQuery={myMembershipsQuery}
         watchedUserIds={watchedUserIds}
         toggleWatchedUser={toggleWatchedUser}
       />
     );
  }
  const completedSwaps = profile?.completedSwaps ?? 0;
  let trustScore = 75;
  if (isStudentVerified) trustScore += 10;
  if (completedSwaps > 0) trustScore += 5;
  if (profile?.avatarUrl) trustScore += 5;
  
  const acceptanceRate = profile?.acceptanceRate ?? 0;
  const avgResponseMinutes = profile?.avgResponseTimeMinutes ?? 0;
  const avgResponseTime = avgResponseMinutes < 60 ? `< ${Math.max(avgResponseMinutes, 1)} min` : `< ${Math.ceil(avgResponseMinutes / 60)} hr`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8FAFC] bottom-nav-safe"
    >
      {/* Header Profile Section */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white rounded-[32px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[#5B21B6] flex items-center justify-center overflow-hidden shadow-sm">
                  {(displayAvatar && displayAvatar !== "null" && displayAvatar !== "undefined") ? (
                    <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<span class="text-white text-2xl font-bold">${(displayName || "U")[0]}</span>`; }} />
                  ) : (
                    <span className="text-white text-2xl font-bold">{(displayName || "U")[0]}</span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-[2.5px] border-white flex items-center justify-center">
                  <CheckCircle className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">
                  {displayName}
                </h2>
                <p className="text-slate-500 text-[13px] font-medium mb-1">
                  @{displayName.toLowerCase().replace(/\s+/g, '')}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {uniVal === "Other / Not a student" ? (
                    <span className="py-0.5 px-2.5 text-[10px] bg-slate-100 text-slate-500 border border-slate-200/60 rounded-full font-bold uppercase tracking-wider">
                      Not a student
                    </span>
                  ) : isStudentVerified ? (
                    <span className="py-0.5 px-2.5 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1 rounded-full font-bold uppercase tracking-wider">
                      <CheckCircle className="w-2.5 h-2.5" /> Verified Student
                    </span>
                  ) : (
                    <span className="py-0.5 px-2.5 text-[10px] bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1 rounded-full font-bold uppercase tracking-wider">
                      <AlertCircle className="w-2.5 h-2.5" /> Student Not Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <motion.button 
                whileTap={{ scale: 0.95 }} 
                onClick={() => navigate("/edit-profile")}
                className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 border border-slate-100 transition-colors shadow-sm"
              >
                <Settings className="w-5 h-5 text-slate-600" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/edit-profile")}
                className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
              >
                Edit Profile
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {isMe && (
        <div className="px-4 mt-2">
          {(() => {
            let currentBio = "";
            let currentCampus = profile?.campus;
            let currentUniversity = "";
            try {
              const safeParse = (data: any) => {
                if (!data) return {};
                if (typeof data === 'object') return data;
                if (typeof data === 'string') {
                  try {
                    const parsed = JSON.parse(data);
                    if (typeof parsed === 'string') return JSON.parse(parsed);
                    return parsed;
                  } catch(e) { return {}; }
                }
                return {};
              };
              const uniJson = safeParse(profile?.university);
              currentBio = uniJson.bio || "";
              currentUniversity = uniJson.val || "";
              if (!currentCampus) currentCampus = uniJson.val;
            } catch(e) {}
            
            const completionItems = [
              { label: "Add profile photo", done: !!displayAvatar, action: () => navigate("/edit-profile") },
              { label: "Add a bio", done: !!currentBio, action: () => navigate("/edit-profile") },
              { label: "Set your campus", done: !!currentCampus, action: () => navigate("/edit-profile") }
            ];
            
            const completedCount = completionItems.filter(i => i.done).length;
            const completionPercentage = Math.round((completedCount / completionItems.length) * 100);

            if (completionPercentage === 100) return null;

            return (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 card-shadow border border-gray-100 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5"><Award className="w-4 h-4 text-blue-500" /> Profile Completion</h3>
                  <span className="font-black text-blue-600 text-sm">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${completionPercentage}%` }}
                     transition={{ duration: 1 }}
                     className="h-full bg-blue-500 rounded-full"
                   />
                </div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Missing:</p>
                <ul className="space-y-2">
                  {completionItems.filter(i => !i.done).map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center"></div>
                        {item.label}
                      </div>
                      <button onClick={item.action} className="text-blue-600 font-bold">Add</button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-2">
        <StatCard icon={<Repeat2 className="w-4 h-4" />} label={"Completed Swaps"} value={completedSwaps} color="#22C55E" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label={"Acceptance Rate"} value={`${acceptanceRate}%`} color="#2563EB" />
        <StatCard icon={<Clock className="w-4 h-4" />} label={"Response Time"} value={avgResponseTime} color="#F59E0B" />
      </div>

      {/* Tabs */}
      {/* Tabs (Segmented Control) */}
      <div className="px-4 mt-6">
        <div className="flex bg-muted/80 p-1 rounded-xl items-center relative">
          {[
            { id: "listings", label: "Listings", icon: <Package className="w-4 h-4" /> },
            { id: "swaps", label: "Swaps", icon: <Repeat2 className="w-4 h-4" /> },
            { id: "saved", label: "Saved", icon: <Heart className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 z-10 ${
                activeTab === tab.id 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5"
              }`}
            >
              <span className="hidden sm:inline">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 mt-4 space-y-3 pb-6">
        <AnimatePresence mode="wait">
          {activeTab === "listings" && (
            <motion.div key="listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {(listingsQuery.data?.items || []).map((listing: any) => (
                <div key={listing.id} className="bg-white rounded-3xl overflow-hidden card-shadow border border-gray-100 flex flex-col">
                  <div className="flex p-3 gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                      {(() => {
                        let img = null;
                        if (Array.isArray(listing.images) && listing.images.length > 0) {
                          img = listing.images[0];
                        }
                        return img ? (
                          <img src={img} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="w-6 h-6" />
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-extrabold text-slate-900 text-base truncate pr-2">{listing.title}</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                          listing.status === "active" ? "bg-[#F0FDF4] text-green-500" : 
                          listing.status === "reserved" ? "bg-orange-50 text-orange-500" :
                          listing.status === "swapped" ? "bg-blue-50 text-blue-600" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {listing.status || "active"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
                        {listing.category && <span className="bg-gray-50 px-2 py-0.5 rounded-md text-gray-600">{listing.category}</span>}
                        {listing.condition && <span className="bg-gray-50 px-2 py-0.5 rounded-md text-gray-600">{listing.condition}</span>}
                        {listing.estimatedValue && <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded-md">KES {listing.estimatedValue.toLocaleString()}</span>}
                      </div>

                    </div>
                  </div>
                  {isMe && (
                    <div className="bg-gray-50/50 p-2.5 border-t border-gray-50 flex items-center justify-between gap-2 px-4">
                       <div className="flex items-center gap-2">
                         <div className={`text-xs border rounded-full px-2.5 py-1 font-extrabold flex items-center gap-1 uppercase tracking-wider ${listing.status === 'active' || !listing.status ? 'bg-[#F0FDF4] border-green-500/20 text-green-500' : listing.status === 'finalized' ? 'bg-green-50 border-green-500/20 text-green-600' : 'bg-gray-100 border-gray-500/20 text-gray-500'}`}>
                           {listing.status === 'active' || !listing.status ? <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> : null}
                           {listing.status === 'finalized' ? 'Swapped' : listing.status || 'Active'}
                         </div>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <button 
                           onClick={() => setEditingListing(listing)}
                           className="text-xs font-bold px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                         ><Edit className="w-3 h-3"/> Edit</button>
                         <button 
                           onClick={() => setShowMatchesForListing(listing)}
                           className="text-xs font-bold px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                         ><Search className="w-3 h-3"/> Matches</button>
                         <button 
                           onClick={() => {
                             toast("Delete listing?", { action: { label: "Yes, Delete", onClick: () => deleteListingMutation.mutate({ id: listing.id }, { onSuccess: () => toast.success("Listing deleted") }) } });
                           }}
                           className="text-xs font-bold px-2 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                         ><Trash2 className="w-4 h-4"/></button>
                       </div>
                    </div>
                  )}
                </div>
              ))}
              
              {(wishesQuery.data?.items || []).map((wish: any) => (
                <div key={`wish-${wish.id}`} className="bg-white rounded-3xl p-3 card-shadow flex items-center gap-3 border border-yellow-200">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">Wish: {wish.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">Offering: {Array.isArray(wish.offerItems) ? wish.offerItems.join(", ") : wish.offerItems}</p>
                      {wish.communityId && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                          Soko Post
                        </span>
                      )}
                    </div>
                    {isMe && (
                      <div className="flex items-center justify-end mt-1">
                        <button 
                          onClick={() => {
                            toast("Delete this wish?", {
                              action: {
                                label: "Delete",
                                onClick: () => {
                                  deleteWishMutation.mutate({ id: wish.id }, {
                                    onSuccess: () => toast.success("Wish deleted")
                                  });
                                }
                              }
                            });
                          }}
                          title="Delete"
                          className="p-1.5 text-red-500 bg-red-50 rounded-full hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {((listingsQuery.data?.items || []).length === 0 && (wishesQuery.data?.items || []).length === 0) && (
                <div className="text-center py-8">
                  <Package className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No listings or wishes yet</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "swaps" && (
            <motion.div key="swaps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              
              {/* Real proposals from backend */}
              {proposalsQuery.isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={`sk-swap-${i}`} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl"></div>
                        <div className="space-y-2">
                          <div className="w-24 h-4 bg-gray-100 rounded-full"></div>
                          <div className="w-16 h-3 bg-gray-100 rounded-full"></div>
                        </div>
                      </div>
                      <div className="w-20 h-6 bg-gray-100 rounded-full"></div>
                    </div>
                  ))}
                </div>
              )}
              
              {!proposalsQuery.isLoading && (
                <div className="space-y-3">
                  {(() => {
                    const allProposals = [...(proposalsQuery.data?.received || []), ...(proposalsQuery.data?.sent || [])];
                    // Remove duplicates just in case
                    const uniqueMap = new Map();
                    allProposals.forEach(p => uniqueMap.set(p.id, p));
                    const filtered = Array.from(uniqueMap.values());
                    
                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 bg-white rounded-3xl card-shadow border border-gray-100">
                           <Repeat2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                           <p className="text-gray-400 text-sm font-medium">No swaps found</p>
                        </div>
                      );
                    }
                    
                    return filtered.map((p: any) => {
                      const isSender = p.proposerId === user?.id;
                      const otherUser = isSender ? p.receiverProfiles : p.profiles;
                      const otherUsername = (() => {
                        try { 
                          const d = JSON.parse(otherUser?.description || "{}");
                          const u = JSON.parse(otherUser?.university || "{}");
                          return d.username || u.username || otherUser?.name?.toLowerCase().replace(/\s+/g, '') || "user"; 
                        }
                        catch (e) { return "user"; }
                      })();
                      const listingTitle = p.listings?.title || p.wishes?.title || `Item #${p.listingId || p.targetListingId || p.id}`;
                      
                      const tintClass = p.status === 'rejected' || p.status === 'cancelled' ? 'bg-red-50/50 border-red-100' :
                                        p.status === 'accepted' || p.status === 'completed' ? 'bg-green-50/50 border-green-100' :
                                        p.status === 'countered' ? 'bg-blue-50/50 border-blue-100' :
                                        'bg-white border-gray-100';

                      return (
                        <div key={p.id} className={`rounded-3xl p-4 card-shadow border ${tintClass}`}>
                          <div className="flex justify-between items-start mb-3 border-b border-gray-50/50 pb-3">
                            <div>
                              <p className="font-bold text-slate-900 text-sm truncate max-w-[200px]">{listingTitle}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  p.status === "completed" ? "bg-[#F0FDF4] text-green-500" :
                                  p.status === "accepted" ? "bg-[#EFF6FF] text-blue-600" :
                                  (p.status === "rejected" || p.status === "cancelled") ? "bg-red-50 text-red-500" :
                                  "bg-gray-100 text-gray-500"
                                }`}>
                                  {p.status}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">
                                  {new Date(p.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{isSender ? "To" : "From"}</p>
                                <p className="font-semibold text-xs text-slate-900">@{otherUsername}</p>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                {otherUser?.avatarUrl ? <img src={otherUser.avatarUrl} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-gray-400" />}
                              </div>
                            </div>
                          </div>
                          
                          {(p.cashTopUp > 0 || p.message) && (
                            <div className="bg-gray-50 rounded-2xl p-3 mb-3">
                              {p.cashTopUp > 0 && <p className="text-xs font-bold text-green-500 mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> + KES {p.cashTopUp.toLocaleString()}</p>}
                              {p.message && <p className="text-xs text-gray-600 line-clamp-2">"{p.message}"</p>}
                            </div>
                          )}
                          
                          {swapsTab === "pending" && !isSender && (
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => updateProposalStatus(p.id, 'rejected')} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors">Decline</button>
                              <button onClick={() => updateProposalStatus(p.id, 'accepted')} className="flex-1 py-2 bg-green-500 hover:bg-[#16A34A] text-white font-bold text-xs rounded-xl transition-colors">Accept Offer</button>
                            </div>
                          )}
                          
                          {swapsTab === "accepted" && (
                            <div className="flex flex-col gap-2">
                              <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100 flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-blue-500 mt-0.5" />
                                <div>
                                  <p className="text-xs font-bold text-slate-900">Meeting Scheduled</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Please finalize the meetup details in chat.</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => navigate(`/chat/${p.proposerId === user?.id ? p.receiverId : p.proposerId}`)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-slate-900 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> Chat</button>
                                <button onClick={() => navigate(`/verify?id=${p.id}`)} className="flex-1 py-2 bg-slate-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"><QrCode className="w-3.5 h-3.5" /> Verify In-Person</button>
                              </div>
                            </div>
                          )}
                          
                          {swapsTab === "completed" && (
                             <div className="bg-[#F0FDF4] p-3 rounded-2xl border border-[#BBF7D0] flex items-center gap-2">
                               <CheckCircle2 className="w-4 h-4 text-green-500" />
                               <p className="text-xs font-bold text-[#16A34A]">Swap Completed Successfully</p>
                             </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "saved" && (
            <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {savedItems.map((item: any) => (
                <div key={item.id} className="bg-white rounded-3xl p-3 card-shadow flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {(() => {
                      const imgs = item.images as unknown as string[];
                      const img = imgs?.[0] && !imgs[0].startsWith('blob:') ? imgs[0] : null;
                      return img ? (
                        <img src={img} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="w-6 h-6" />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.campus?.split(",")[0]}</p>
                  </div>
                  <Heart className="w-5 h-5 text-red-400 fill-red-400 flex-shrink-0" />
                </div>
              ))}
              {savedWishes.map((wish: any) => (
                <div key={`wish-${wish.id}`} className="bg-white rounded-3xl p-3 card-shadow flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">Wish: {wish.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{wish.campus?.split(",")[0]}</p>
                  </div>
                  <Heart className="w-5 h-5 text-red-400 fill-red-400 flex-shrink-0" />
                </div>
              ))}
              
              {watchedCommunities.map((comm: any) => (
                <div key={`comm-${comm.id}`} className="bg-white rounded-3xl p-3 card-shadow flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">Soko: {comm.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{comm.memberCount || 1} Members</p>
                  </div>
                  <Heart className="w-5 h-5 text-red-400 fill-red-400 flex-shrink-0" />
                </div>
              ))}

              {useAppStore.getState().savedSearches.map((search) => (
                <div key={`search-${search.id}`} className="bg-white rounded-3xl p-3 card-shadow flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Search className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">Search: "{search.query}"</p>
                    <p className="text-xs text-gray-400 mt-0.5">Saved {new Date(search.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => useAppStore.getState().removeSavedSearch(search.id)}>
                    <Heart className="w-5 h-5 text-red-400 fill-red-400 flex-shrink-0" />
                  </button>
                </div>
              ))}

              {watchedUserIds.map((userId: string) => (
                <div key={`user-${userId}`} className="bg-white rounded-3xl p-3 card-shadow flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">Watched User</p>
                    <p className="text-xs text-gray-400 mt-0.5">Watched Profile</p>
                  </div>
                  <button onClick={() => toggleWatchedUser(userId)}>
                     <Heart className="w-5 h-5 text-red-400 fill-red-400 flex-shrink-0" />
                  </button>
                </div>
              ))}

              {watchedCategoryIds.map((cat: string) => (
                <div key={`cat-${cat}`} className="bg-white rounded-3xl p-3 card-shadow flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate capitalize">Category: {cat}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Watching for new items</p>
                  </div>
                  <button onClick={() => toggleWatchedCategory(cat)}>
                     <Heart className="w-5 h-5 text-red-400 fill-red-400 flex-shrink-0" />
                  </button>
                </div>
              ))}

              {savedItems.length === 0 && savedWishes.length === 0 && watchedCommunities.length === 0 && watchedUserIds.length === 0 && watchedCategoryIds.length === 0 && (
                <div className="text-center py-8">
                  <Heart className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Your watchlist is empty</p>
                </div>
              )}
            </motion.div>
          )}
          {!isMe && (activeTab === "swaps" || activeTab === "saved") && (
              <div className="py-10 text-center">
                <Shield className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Private Activity</p>
                <p className="text-xs text-gray-400 mt-1">Only {displayName} can view this tab.</p>
              </div>
          )}
          
        </AnimatePresence>
      </div>

      {/* Settings list */}
      <div className="px-4 pb-28 space-y-2">
        {isMe && (
          <div className="inset-grouped-list">
            {[
              { icon: <UserPlus className="w-4 h-4 text-white" />, label: "Invite Friends", color: "#34C759", action: () => {
                const inviteLink = `${window.location.origin}`;
                navigator.clipboard.writeText(inviteLink);
                toast.success("Invite link copied!");
              }},
              { icon: <Bell className="w-4 h-4 text-white" />, label: "Notifications", color: "#007AFF", action: () => navigate("/notifications") },
              { icon: <ShieldAlert className="w-4 h-4 text-white" />, label: "Appeals & Support", color: "#AF52DE", action: () => navigate("/appeals") },
              { icon: <HelpCircle className="w-4 h-4 text-white" />, label: "Help & Safety", color: "#FF9500", action: () => navigate("/safety") },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="inset-grouped-list-item w-full"
              >
                <div className="flex items-center gap-3">
                  <div className="inset-grouped-list-item-icon" style={{ backgroundColor: item.color }}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-900">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        )}

        {isMe && (
          <div className="flex flex-col gap-3 mt-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => logout()}
              className="w-full bg-red-50 text-red-500 font-bold py-3.5 rounded-3xl text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> {"Log Out"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                toast("Permanently delete your account?", {
                  id: "delete-account",
                  action: {
                    label: "Delete",
                    onClick: async () => {
                      if (user?.id) {
                        toast.loading("Deleting account...", { id: "del" });
                        try {
                           await supabase.from('listings').delete().eq('user_id', user.id);
                           await supabase.from('wishes').delete().eq('user_id', user.id);
                           await supabase.from('profiles').delete().eq('user_id', user.id);
                           toast.success("Account deleted.", { id: "del" });
                           logout();
                        } catch(e: any) {
                           toast.error(e.message || "Failed to delete account", { id: "del" });
                        }
                      }
                    }
                  }
                });
              }}
              className="w-full bg-gray-100 text-gray-500 font-bold py-3.5 rounded-3xl text-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> {"Delete Account"}
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        
        {editingListing && (
          <EditListingModal
            listing={editingListing}
            onClose={() => setEditingListing(null)}
          />
        )}
        {showMatchesForListing && (
          <MatchSuggestionsModal
            listing={showMatchesForListing}
            onClose={() => setShowMatchesForListing(null)}
          />
        )}

      </AnimatePresence>
    </motion.div>
  );
}

// ─── Edit Listing Modal ───────────────────────────────────────────────────────
function EditListingModal({ listing, onClose }: { listing: any; onClose: () => void }) {
  const [title, setTitle] = useState(listing.title);
  const [valueEngineStr, setValueEngineStr] = useState("");
  const [description, setDescription] = useState(() => {
    let text = listing.description || "";
    const match = text.match(/<!--value_engine:.*?-->/);
    if (match) {
      setValueEngineStr(match[0]);
      return text.replace(match[0], '').trim();
    }
    return text;
  });
  const [category, setCategory] = useState(listing.category || "Electronics");
  const [condition, setCondition] = useState(listing.condition || "Used - Good");
  const [preferredItems, setPreferredItems] = useState(listing.preferredItems?.join(", ") || (listing.wantItems && Array.isArray(listing.wantItems) ? listing.wantItems.join(", ") : ""));
  const [images, setImages] = useState<string[]>(() => {
    try {
      return typeof listing.images === 'string' ? JSON.parse(listing.images) : (listing.images || []);
    } catch(e) { return []; }
  });
  const [activeDropdown, setActiveDropdown] = useState<"category" | "condition" | null>(null);

  const utils = trpc.useUtils();
  const updateMutation = trpc.listings.update.useMutation({
    onSuccess: () => {
      utils.listings.myListings.invalidate();
      toast.success("Listing updated successfully!");
      onClose();
    }
  });

  const handleUpdate = () => {
    const finalDesc = valueEngineStr ? `${description}\n\n${valueEngineStr}` : description;
    updateMutation.mutate({
      id: listing.id,
      title,
      description: finalDesc,
      category,
      condition,
      preferredItems: preferredItems.split(",").map((i: string) => i.trim()).filter(Boolean),
      images
    });
  };

  const categories = ["Electronics", "Textbooks", "Furniture", "Clothing", "Services"];
  const conditions = ["New / Like New", "Used - Good", "Used - Fair"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center sm:px-4"
      style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(12px)" }}
      onClick={() => { onClose(); setActiveDropdown(null); }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white/95 backdrop-blur-xl w-full sm:max-w-md mx-auto sm:rounded-3xl rounded-t-[32px] p-6 card-shadow h-[85vh] sm:h-auto max-h-[90vh] flex flex-col"
        onClick={e => { e.stopPropagation(); setActiveDropdown(null); }}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
             <h3 className="font-extrabold text-slate-900 text-xl">Edit Listing</h3>
             <p className="text-xs text-gray-500 font-medium mt-1">Refine your swap offer</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 scrollbar-hide flex-1 pb-20 sm:pb-4">
          {/* Images Section */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Photos</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img: string, i: number) => (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 group shadow-sm">
                  <img src={img} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImages(images.filter((_: any, idx: number) => idx !== i))}
                    className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
              {images.length < 4 && (
                <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 flex-shrink-0 hover:border-green-500 hover:text-green-500 hover:bg-green-500/5 transition-all cursor-pointer">
                  <input 
                    type="file" accept="image/*" className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setImages([...images, URL.createObjectURL(file)]);
                    }} 
                  />
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-xs font-bold">Add</span>
                </label>
              )}
            </div>
          </div>

          {/* Core Info */}
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Listing Title</label>
              <input
                value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-2xl px-4 py-3.5 text-[15px] font-medium outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-[#22C55E]/10 transition-all"
                placeholder="What are you offering?"
              />
            </div>
            
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Description</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-2xl px-4 py-3.5 text-[15px] font-medium outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-[#22C55E]/10 transition-all resize-none"
                placeholder="Add more details about your item..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {/* Custom Category Dropdown */}
               <div className="relative">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Category</label>
                  <div 
                     onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === "category" ? null : "category"); }}
                     className="w-full bg-gray-50/50 border border-gray-200/60 rounded-2xl px-4 py-3.5 text-[15px] font-medium cursor-pointer flex justify-between items-center hover:bg-gray-100/50 transition-colors"
                  >
                     <span className={category ? "text-slate-900" : "text-gray-400"}>{category || "Select..."}</span>
                     <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${activeDropdown === "category" ? "rotate-90" : ""}`} />
                  </div>
                  <AnimatePresence>
                     {activeDropdown === "category" && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-2xl card-shadow z-50 overflow-hidden"
                        >
                           {categories.map(c => (
                              <div 
                                key={c} 
                                onClick={(e) => { e.stopPropagation(); setCategory(c); setActiveDropdown(null); }}
                                className={`px-4 py-3 text-[14px] font-semibold cursor-pointer transition-colors ${category === c ? "bg-green-500/10 text-green-500" : "text-gray-600 hover:bg-gray-50"}`}
                              >
                                {c}
                              </div>
                           ))}
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>

               {/* Custom Condition Dropdown */}
               <div className="relative">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Condition</label>
                  <div 
                     onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === "condition" ? null : "condition"); }}
                     className="w-full bg-gray-50/50 border border-gray-200/60 rounded-2xl px-4 py-3.5 text-[15px] font-medium cursor-pointer flex justify-between items-center hover:bg-gray-100/50 transition-colors"
                  >
                     <span className={condition ? "text-slate-900" : "text-gray-400"}>{condition || "Select..."}</span>
                     <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${activeDropdown === "condition" ? "rotate-90" : ""}`} />
                  </div>
                  <AnimatePresence>
                     {activeDropdown === "condition" && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-2xl card-shadow z-50 overflow-hidden"
                        >
                           {conditions.map(c => (
                              <div 
                                key={c} 
                                onClick={(e) => { e.stopPropagation(); setCondition(c); setActiveDropdown(null); }}
                                className={`px-4 py-3 text-[14px] font-semibold cursor-pointer transition-colors ${condition === c ? "bg-green-500/10 text-green-500" : "text-gray-600 hover:bg-gray-50"}`}
                              >
                                {c}
                              </div>
                           ))}
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>

            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Looking For (Comma Separated)</label>
              <input
                value={preferredItems} onChange={e => setPreferredItems(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200/60 rounded-2xl px-4 py-3.5 text-[15px] font-medium outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-[#22C55E]/10 transition-all"
                placeholder="e.g. iPhone, Guitar, Cash"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-4 shrink-0 bg-white sm:bg-transparent relative z-0">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="w-full bg-slate-900 hover:bg-[#1E293B] text-white font-bold py-4 rounded-2xl text-[15px] shadow-lg shadow-[#0F172A]/20 transition-all flex justify-center items-center gap-2"
            >
              {updateMutation.isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : "Save Changes"}
            </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
