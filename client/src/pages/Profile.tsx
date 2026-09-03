import { trpc } from "@/lib/trpc";
import { useAppStore } from "@/store";
import { useAuth } from "@/_core/hooks/useAuth";
import { ReportModal } from "@/components/ReportModal";
import { Flag } from "@/lib/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Lock,
  Package, Star, User, Users, Bell, Settings, LogOut, Heart, MapPin, 
  Shield, ShieldAlert, Activity, CheckCircle, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Plus, Search, HelpCircle, Globe, XCircle, Handshake, RefreshCw, UserPlus, CheckCircle2, Check,
  MessageCircle, Clock, Scale, Repeat2, TrendingUp, Award, X, Camera, Trash2, Edit, Calendar, GraduationCap, AlertCircle, QrCode
} from "@/lib/icons";
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
    <div className="bg-white/60 backdrop-blur-3xl rounded-[24px] p-4 shadow-[0_8px_32px_rgba(15,23,42,0.04)] border border-white/80 text-center relative overflow-hidden group hover:bg-white transition-all hover:scale-[1.02] active:scale-[0.98]">
      <div className="absolute inset-0 rounded-[24px] border border-white pointer-events-none mix-blend-overlay"></div>
      <div className={`w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-inner`} style={{ backgroundColor: color + "15" }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <p className="font-black text-slate-900 text-2xl leading-none mb-1 tracking-tight drop-shadow-sm">{value}</p>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
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
  
  // Safely extract profile data
  let targetProfileData = profile;
  if (!targetProfileData || (!targetProfileData.university && !targetProfileData.description)) {
      targetProfileData = listingsQuery.data?.items?.[0]?.profiles || wishesQuery.data?.items?.[0]?.profiles || profile || {};
  }
  
  let desc: any = {};
  let uni: any = {};
  try { desc = JSON.parse(targetProfileData?.description || "{}"); } catch(e) {}
  try { uni = JSON.parse(targetProfileData?.university || "{}"); } catch(e) {}
  
  let username = desc.username || uni.username || targetProfileData?.user_metadata?.username || targetProfileData?.name?.toLowerCase().replace(/\s+/g, '') || "user";
  let avatarUrl = targetProfileData?.avatarUrl || desc.avatarUrl;
  let name = desc.name || targetProfileData?.name || targetProfileData?.user_metadata?.full_name || "User";
  let uniVal = desc.val || targetProfileData?.campus || "University";
  let isStudentVerified = desc.isStudentVerified || targetProfileData?.isStudentVerified || false;
  let institutionName = "";
  if (targetProfileData?.university) {
      if (targetProfileData.university.startsWith("{")) {
          institutionName = uni.institution || "";
          uniVal = uni.val || targetProfileData.campus || "University";
          isStudentVerified = isStudentVerified || uni.isStudentVerified;
      } else {
          institutionName = targetProfileData.university;
          uniVal = targetProfileData.campus || "University";
      }
  } else if (targetProfileData?.campus) {
      uniVal = targetProfileData.campus;
  }
  if (uniVal.includes("lng\":") || uniVal.startsWith("-1.") || uniVal.startsWith("{")) uniVal = "University";
  if (institutionName.includes("lng\":") || institutionName.startsWith("-1.") || institutionName.startsWith("{")) institutionName = "";
  if (institutionName.includes("lng\":") || institutionName.startsWith("-1.") || institutionName.startsWith("{")) institutionName = "";

  let bio = uni.bio || desc.bio || targetProfileData?.bio || "";
  let targetLat: number | null = desc.lat || null;
  let targetLng: number | null = desc.lng || null;
  let privacyVisibility = desc.privacy?.visibility || "Public";
  let showDistance = desc.privacy?.showDistance !== false;
  let showLastActive = desc.privacy?.showLastActive !== false;

  if (privacyVisibility === "SwapSoko Users" && !user) {
    return (
      <div className="min-h-screen relative overflow-y-auto bg-[#F8FAFC] pb-24">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/40">
           <button onClick={onBack || (() => window.history.back())} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/60 hover:bg-white transition-colors shadow-sm"><ChevronLeft size={24} className="text-slate-900"/></button>
        </div>
        <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
           <div className="w-20 h-20 bg-white/60 backdrop-blur-3xl rounded-full flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80">
             <Lock className="w-8 h-8 text-slate-400" />
           </div>
           <h2 className="text-xl font-extrabold text-slate-900 mb-2">Profile is Protected</h2>
           <p className="text-sm text-slate-500 mb-8 max-w-[260px] font-medium">This user only shares their profile and listings with signed-in SwapSoko users.</p>
           <button onClick={() => navigate("/login")} className="bg-emerald-500 text-white font-bold py-3.5 px-8 rounded-full shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 transition-transform">Sign In to View</button>
        </div>
      </div>
    );
  }
  
  if (!targetLat && listingsQuery.data?.items?.[0]?.latitude) {
    targetLat = listingsQuery.data.items[0].latitude;
    targetLng = listingsQuery.data.items[0].longitude;
  }
  let distanceText = "";
  if (showDistance && targetLat && targetLng && filters.coords) {
      const R = 6371; // km
      const dLat = (targetLat - filters.coords.lat) * Math.PI / 180;
      const dLon = (targetLng - filters.coords.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(filters.coords.lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distanceText = dist < 1 ? `About ${(dist*1000).toFixed(0)}m away` : `About ${dist.toFixed(1)}km away`;
  } else if (showDistance) {
      distanceText = "Location hidden";
  }

  // Consistent pastel avatar colors based on name
  const colors = ["bg-[#5B21B6]", "bg-[#10B981]", "bg-[#F59E0B]", "bg-[#EC4899]", "bg-[#3B82F6]"];
  const avatarBg = colors[name.length % colors.length];

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pb-48 relative overflow-hidden">
      {/* Animated Background Blobs for Glassmorphism */}
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden pointer-events-none">
      </div>

      {/* Hero Section */}
      <div className="relative pt-12 pb-6 px-4 z-10">
        <button onClick={onBack || (() => window.history.back())} className="absolute top-6 left-4 w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80 hover:scale-105 transition-transform z-20">
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </button>
        {user?.id !== targetUserId && (
          <button onClick={() => setIsReporting(true)} className="absolute top-6 right-4 w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80 hover:scale-105 transition-transform z-20">
            <Flag className="w-5 h-5 text-red-500" />
          </button>
        )}

        <div className="flex flex-col items-center text-center mt-4">
          <div className={`w-32 h-32 rounded-[40px] ${avatarBg} overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)] border-[4px] border-white/80 backdrop-blur-3xl mb-5 relative`}>
            {avatarUrl ? (
              <img src={avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-5xl font-black text-white">${(name || "U")[0]}</div>`; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white">{(name || "U")[0]}</div>
            )}
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 tracking-tight drop-shadow-sm">{name}</h1>
          <div className="flex items-center gap-1.5 mt-1 justify-center">
            <p className="text-slate-600 font-bold text-sm bg-white/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/40 shadow-sm">@{username}</p>
          </div>
          
          <div className="flex flex-col items-center mt-4 space-y-2">
            {(uniVal === "Other / Not a student" || institutionName === "Other / Not a student" || institutionName === "Other" || (uniVal === "University" && !institutionName)) ? (
              <span className="bg-slate-100 backdrop-blur-xl px-4 py-1.5 rounded-full text-slate-500 text-xs font-bold shadow-sm border border-slate-200 flex items-center gap-1.5">
                <User className="w-4 h-4" /> Not a student
              </span>
            ) : isStudentVerified ? (
              <span className="bg-emerald-50 backdrop-blur-xl px-4 py-1.5 rounded-full text-emerald-600 text-xs font-bold shadow-sm border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Verified Student {institutionName ? `• ${institutionName} ${uniVal !== "University" ? '('+uniVal+')' : ''}` : (uniVal !== "University" ? `• ${uniVal}` : "")}
              </span>
            ) : (
              <span className="bg-orange-50 backdrop-blur-xl px-4 py-1.5 rounded-full text-orange-600 text-xs font-bold shadow-sm border border-orange-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Unverified Student {institutionName ? `• ${institutionName} ${uniVal !== "University" ? '('+uniVal+')' : ''}` : (uniVal !== "University" ? `• ${uniVal}` : "")}
              </span>
            )}
            {distanceText && (
              <p className="text-slate-500 text-[11px] flex items-center justify-center flex-wrap gap-1 font-bold mt-2 uppercase tracking-widest bg-white/40 px-3 py-1 rounded-full backdrop-blur-md">
                 <MapPin className="w-3.5 h-3.5" />
                 {targetProfileData?.location_name ? (
                   <span>{targetProfileData.location_name} • {distanceText}</span>
                 ) : (
                   <span>{distanceText}</span>
                 )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-2 space-y-4 relative z-20">
        {/* Bio */}
        {bio && (
          <div className="bg-white/60 backdrop-blur-3xl p-5 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80">
            <h3 className="font-extrabold text-slate-900 text-lg mb-2 tracking-tight">About</h3>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">{bio}</p>
          </div>
        )}

        {/* Active Listings Carousel */}
        <div className="bg-white/60 backdrop-blur-3xl py-5 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80 overflow-hidden">
          <div className="px-5 flex items-center justify-between mb-4">
             <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Active Listings</h3>
             <span onClick={() => setShowGrid(true)} className="text-emerald-600 text-xs font-bold cursor-pointer hover:underline bg-emerald-500/10 px-3 py-1 rounded-full">See All</span>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar px-5 pb-2 gap-3">
            {listingsQuery.isLoading ? (
               <div className="flex gap-3">
                 {[1, 2, 3].map((i) => (
                   <div key={`sk-${i}`} className="min-w-[140px] w-[140px] h-36 bg-white/50 rounded-[24px] animate-pulse border border-white/60"></div>
                 ))}
               </div>
            ) : listingsQuery.data?.items?.length === 0 ? (
               <div className="text-xs text-slate-500 font-bold bg-white/50 px-4 py-3 rounded-2xl inline-block">No active listings</div>
            ) : (
               (listingsQuery.data?.items || []).filter((l: any) => l.status !== 'hidden' || targetUserId === user?.id).map((l: any) => (
                 <div key={l.id} className="min-w-[140px] w-[140px] bg-white/80 backdrop-blur-xl rounded-[24px] overflow-hidden flex-shrink-0 border border-white shadow-sm cursor-pointer relative hover:-translate-y-1 transition-transform" onClick={() => setShowGrid(true)}>
                   <div className="h-28 bg-slate-100 relative">
                      {l.status === 'finalized' && <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-full z-10 shadow-md">Swapped</div>}
                      {l.status === 'hidden' && targetUserId === user?.id && <div className="absolute top-2 right-2 bg-slate-50 text-white text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-full z-10 shadow-md">Hidden</div>}
                      {l.images && l.images[0] ? (
                        <img src={l.images[0]} className={`w-full h-full object-cover ${l.status !== 'active' ? 'opacity-50 grayscale' : ''}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-8 h-8" /></div>
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <p className={`font-bold text-slate-900 text-xs truncate ${l.status !== 'active' ? 'opacity-50' : ''}`}>{l.title}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Swap Wishes */}
        <div className="bg-white/60 backdrop-blur-3xl p-5 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80">
          <h3 className="font-extrabold text-slate-900 text-lg mb-3 tracking-tight">Swishes</h3>
          {wishesQuery.isLoading ? (
             <div className="h-10 bg-white/50 rounded-2xl animate-pulse w-full border border-white/60"></div>
          ) : wishesQuery.data?.items?.length === 0 ? (
             <div className="text-xs text-slate-500 font-bold bg-white/50 px-4 py-3 rounded-2xl inline-block">No active swishes</div>
          ) : (
            <ul className="space-y-2">
              {(wishesQuery.data?.items || []).map((w: any) => (
                <li key={w.id} className="flex items-center gap-3 text-sm text-slate-700 font-bold bg-white/80 border border-white shadow-sm px-4 py-3 rounded-[20px]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {w.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Communities */}
        <div className="bg-white/60 backdrop-blur-3xl p-5 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80">
          <h3 className="font-extrabold text-slate-900 text-lg mb-3 tracking-tight">Communities</h3>
          {membershipsQuery.isLoading ? (
             <div className="space-y-3">
               {[1, 2].map((i) => (
                 <div key={`sk-m-${i}`} className="h-12 w-full bg-white/50 rounded-[20px] animate-pulse border border-white/60"></div>
               ))}
             </div>
          ) : (() => {
            if (!myMembershipsQuery || !myMembershipsQuery.data?.items) return <div className="text-xs text-slate-500 font-bold bg-white/50 px-4 py-3 rounded-2xl inline-block">No mutual communities</div>;
            const myCommIds = new Set(myMembershipsQuery.data.items.map((m: any) => m.communityId));
            const mutualComms = (membershipsQuery.data?.items || []).filter((m: any) => myCommIds.has(m.communityId));
            if (mutualComms.length === 0) return <div className="text-xs text-slate-500 font-bold bg-white/50 px-4 py-3 rounded-2xl inline-block">No mutual communities</div>;
            return (
              <div className="space-y-2 mt-2">
                {mutualComms.map((m: any) => (
                  <div key={`mutual-${m.id}`} className="flex items-center gap-3 text-sm font-bold text-slate-800 bg-white/80 border border-white shadow-sm p-3 rounded-[20px]">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                       <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    {m.communities?.name || "Community"}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Safety Card */}
        <div className="bg-white/60 backdrop-blur-3xl p-5 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80 mb-8">
          <h3 className="font-extrabold text-slate-900 text-lg mb-4 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" /> Safety Checklist
          </h3>
          <div className="space-y-2">
             {(uniVal === "Other / Not a student" || institutionName === "Other / Not a student" || institutionName === "Other" || (uniVal === "University" && !institutionName)) ? (
               <p className="flex items-center gap-3 text-sm font-bold px-4 py-3 rounded-[20px] text-slate-700 bg-slate-100 border border-slate-200">
                 <User className="w-5 h-5 text-slate-500" /> Not a student
               </p>
             ) : isStudentVerified ? (
               <p className="flex items-center gap-3 text-sm font-bold px-4 py-3 rounded-[20px] text-emerald-700 bg-emerald-50 border border-emerald-200">
                 <CheckCircle className="w-5 h-5 text-emerald-500" /> Verified Student
               </p>
             ) : (
               <p className="flex items-center gap-3 text-sm font-bold px-4 py-3 rounded-[20px] text-orange-700 bg-orange-50 border border-orange-200">
                 <AlertCircle className="w-5 h-5 text-orange-500" /> Unverified Student
               </p>
             )}
             <p className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-white/80 border border-white shadow-sm px-4 py-3 rounded-[20px]">
               <CheckCircle className="w-5 h-5 text-emerald-500" /> Email Verified
             </p>
             <p className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-white/80 border border-white shadow-sm px-4 py-3 rounded-[20px]">
               <CheckCircle className="w-5 h-5 text-emerald-500" /> Clean Record
             </p>
          </div>
        </div>
      </div>

      {/* Grid Modal */}
      <AnimatePresence>
        {showGrid && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed left-1/2 -translate-x-1/2 w-full max-w-md bottom-0 top-[10%] bg-white/80 backdrop-blur-3xl rounded-t-[40px] z-[300] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white">
            <div className="sticky top-0 bg-white/60 backdrop-blur-3xl px-6 py-5 flex items-center justify-between border-b border-white/80 z-10">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{name}'s Listings</h2>
              <button onClick={() => setShowGrid(false)} className="w-10 h-10 flex items-center justify-center bg-white/80 border border-white shadow-sm rounded-full hover:bg-white"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 pb-32">
              {(listingsQuery.data?.items || []).filter((l: any) => l.status !== 'hidden' || targetUserId === user?.id).map((l: any) => (
                <div key={l.id} className="bg-white/80 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-sm border border-white cursor-pointer flex flex-col relative hover:-translate-y-1 transition-transform" onClick={() => { setShowGrid(false); navigate("/swipes?item=" + l.id); }}>
                   <div className="aspect-square bg-slate-100 relative">
                     {l.status === 'finalized' && <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full z-10">Swapped</div>}
                     {l.status === 'hidden' && targetUserId === user?.id && <div className="absolute top-2 right-2 bg-slate-50 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full z-10">Hidden</div>}
                     {l.images && l.images[0] ? <img src={l.images[0]} className={`absolute inset-0 w-full h-full object-cover ${l.status !== 'active' ? 'opacity-50 grayscale' : ''}`} /> : <div className="absolute inset-0 flex items-center justify-center text-slate-300"><Package className="w-8 h-8" /></div>}
                   </div>
                   <div className="p-4">
                     <p className={`font-bold text-slate-900 text-sm truncate ${l.status !== 'active' ? 'opacity-50' : ''}`}>{l.title}</p>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Floating Actions */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[400px] bg-white/60 backdrop-blur-3xl rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-2 flex justify-between z-50 border border-white/80">
         <motion.button 
           onClick={handleMessage}
           whileTap={{ scale: 0.95 }} 
           className="flex-1 flex flex-col items-center justify-center gap-1 py-3.5 text-white bg-emerald-500 rounded-[24px] shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:opacity-90"
         >
           <MessageCircle className="w-5 h-5" />
           <span className="text-xs font-black tracking-widest uppercase mt-0.5">Message</span>
         </motion.button>
         
         <motion.button 
           onClick={() => setShowGrid(true)}
           whileTap={{ scale: 0.95 }} 
           className="flex-1 flex flex-col items-center justify-center gap-1 py-3.5 text-slate-700 rounded-[24px] hover:bg-white/50 transition-colors"
         >
           <Package className="w-5 h-5" />
           <span className="text-[10px] font-black tracking-widest uppercase mt-0.5">View Items</span>
         </motion.button>
         
         <motion.button 
           onClick={() => targetUserId && toggleWatchedUser(targetUserId.toString())}
           whileTap={{ scale: 0.95 }} 
           className={`flex-1 flex flex-col items-center justify-center gap-1 py-3.5 rounded-[24px] hover:bg-white/50 transition-colors ${targetUserId && watchedUserIds.includes(targetUserId.toString()) ? 'text-red-500' : 'text-slate-700'}`}
         >
           <Heart className={`w-5 h-5 ${targetUserId && watchedUserIds.includes(targetUserId.toString()) ? 'fill-current' : ''}`} />
           <span className="text-[10px] font-black tracking-widest uppercase mt-0.5">Save Trader</span>
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
  let fullName = "User";
  try {
     const uni = JSON.parse(profile?.university || "{}");
     const desc = JSON.parse(profile?.description || "{}");
     if (desc.name) fullName = desc.name;
     else if (profile?.name) fullName = profile.name;
     else if (isMe && user?.metadata?.name) fullName = user.metadata.name;
     
     if (uni.username) username = uni.username;
     else if (desc.username) username = desc.username;
     else if (isMe && user?.metadata?.username) username = user.metadata.username;
  } catch(e) {}
  if (fullName === "User" || !fullName) {
     fullName = profile?.name || (isMe ? user?.metadata?.name : "") || "SwapSoko User";
  }
  if (username === "User") {
     if (fullName && fullName !== "SwapSoko User" && fullName !== "User") username = fullName.split(" ").join("").toLowerCase();
  }
  const displayName = fullName;
  const displayUsername = "@" + username.replace(/^@+/, '');
  let isStudentVerified = (isMe ? user?.metadata?.isStudentVerified : false) || profile?.isStudentVerified || false;
  let uniVal = "University";
  let extractedAvatar = "";
  let institutionName = "";
  
  if (profile?.university) {
      if (profile.university.startsWith("{")) {
          try {
              const u = JSON.parse(profile.university);
              uniVal = u.val || profile.campus || "University";
              institutionName = u.institution || "";
              isStudentVerified = isStudentVerified || u.isStudentVerified;
          } catch(e) {}
      } else {
          institutionName = profile.university;
          uniVal = profile.campus || "University";
      }
  } else if (profile?.campus) {
      uniVal = profile.campus;
  }
  
  try {
     const d = JSON.parse(profile?.description || "{}");
     isStudentVerified = isStudentVerified || d.isStudentVerified;
     extractedAvatar = d.avatarUrl || "";
  } catch(e) {}
  
  // Clean up corrupted JSON location strings that might have leaked into campus
  if (uniVal.includes("lng\":") || uniVal.startsWith("-1.") || uniVal.startsWith("{")) {
      uniVal = "University";
  }
  if (institutionName.includes("lng\":") || institutionName.startsWith("-1.") || institutionName.startsWith("{")) {
      institutionName = "";
  }
  
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
            <div className="relative w-24 h-24 flex items-center justify-center"><img src="/logo.jpg" alt="SwapSoko" className="w-20 h-20 object-contain drop-shadow-xl" /></div>
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
      className="min-h-screen relative overflow-y-auto bg-white bottom-nav-safe"
    >
      
      
      
            {/* Header Profile Section - Card Redesign */}
      <div className="px-4 pt-6 z-10 relative">
        <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_32px_rgba(15,23,42,0.08)] border border-slate-100 p-8 flex flex-col items-center text-center relative">
          <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden shadow-[0_8px_32px_rgba(15,23,42,0.08)] border border-slate-100 mb-5 relative flex items-center justify-center">
            {(displayAvatar && displayAvatar !== "null" && displayAvatar !== "undefined") ? (
              <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<span class="text-slate-400 text-4xl font-black">${(displayName || "U")[0]}</span>`; }} />
            ) : (
              <span className="text-slate-400 text-4xl font-black">{(displayName || "U")[0]}</span>
            )}
          </div>
          
          <h1 className="text-[24px] font-black text-slate-900 tracking-tight">{displayName}</h1>
          <p className="text-slate-500 font-bold text-[15px] mt-0.5">{displayUsername}</p>
          
          <div className="flex items-center justify-center mt-5 gap-3">
            {(uniVal === "Other / Not a student" || institutionName === "Other / Not a student" || institutionName === "Other" || (uniVal === "University" && !institutionName)) ? (
              <span className="bg-slate-50 px-4 py-2 rounded-xl text-slate-500 text-[13px] font-bold border border-slate-100 flex items-center gap-1.5">
                <User className="w-4 h-4" /> Not a student
              </span>
            ) : (
              <span className="bg-slate-50 px-4 py-2 rounded-xl text-slate-700 text-[13px] font-bold border border-slate-100 flex items-center gap-1.5">
                <User className="w-4 h-4" /> Student • {institutionName || uniVal}
              </span>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/edit-profile")}
              className="text-[13px] font-bold text-slate-700 bg-white border border-slate-200 px-5 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Profile
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-8 grid grid-cols-3 gap-3 relative z-10 bg-white">
        <StatCard icon={<Repeat2 className="w-4 h-4" />} label={"Completed Swaps"} value={completedSwaps} color="#22C55E" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label={"Acceptance Rate"} value={`${acceptanceRate}%`} color="#2563EB" />
        <StatCard icon={<Clock className="w-4 h-4" />} label={"Response Time"} value={avgResponseTime} color="#F59E0B" />
      </div>

      {/* Tabs */}
      {/* Tabs (Segmented Control) */}
      <div className="px-4 mt-6">
        <div className="flex bg-slate-50 p-1.5 rounded-[20px] items-center relative border border-slate-100 z-10">
          {[
            { id: "listings", label: "Listings", icon: <Package className="w-4 h-4" /> },
            { id: "swaps", label: "Swaps", icon: <Repeat2 className="w-4 h-4" /> },
            { id: "saved", label: "Saved", icon: <Heart className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 z-10 ${
                activeTab === tab.id ? "bg-white text-slate-900 shadow-sm scale-100 border border-slate-200 font-bold" : "text-slate-500 hover:text-slate-900 hover:bg-white/40 scale-95 opacity-80"
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
                <div key={listing.id} className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(15,23,42,0.08)] border border-slate-100 flex flex-col">
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
                    <div className="bg-white/40 backdrop-blur-md p-3 border-t border-white/60 flex items-center justify-between gap-2 px-5">
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
                <div key={`wish-${wish.id}`} className="shadow-[0_8px_32px_rgba(15,23,42,0.04)] border border-white/80 bg-white/60 backdrop-blur-xl relative z-10 overflow-hidden flex items-center gap-3 p-4 rounded-[28px]">
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
                <div key={item.id} className="shadow-[0_8px_32px_rgba(15,23,42,0.04)] border border-white/80 bg-white/60 backdrop-blur-xl relative z-10 overflow-hidden flex items-center gap-3 p-4 rounded-[28px]">
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
                <div key={`wish-${wish.id}`} className="shadow-[0_8px_32px_rgba(15,23,42,0.04)] border border-white/80 bg-white/60 backdrop-blur-xl relative z-10 overflow-hidden flex items-center gap-3 p-4 rounded-[28px]">
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
                <div key={`comm-${comm.id}`} className="shadow-[0_8px_32px_rgba(15,23,42,0.04)] border border-white/80 bg-white/60 backdrop-blur-xl relative z-10 overflow-hidden flex items-center gap-3 p-4 rounded-[28px]">
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
                <div key={`search-${search.id}`} className="shadow-[0_8px_32px_rgba(15,23,42,0.04)] border border-white/80 bg-white/60 backdrop-blur-xl relative z-10 overflow-hidden flex items-center gap-3 p-4 rounded-[28px]">
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
                <div key={`user-${userId}`} className="shadow-[0_8px_32px_rgba(15,23,42,0.04)] border border-white/80 bg-white/60 backdrop-blur-xl relative z-10 overflow-hidden flex items-center gap-3 p-4 rounded-[28px]">
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
                <div key={`cat-${cat}`} className="shadow-[0_8px_32px_rgba(15,23,42,0.04)] border border-white/80 bg-white/60 backdrop-blur-xl relative z-10 overflow-hidden flex items-center gap-3 p-4 rounded-[28px]">
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
          <div className="bg-white/60 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-[0_8px_32px_rgba(15,23,42,0.04)] border border-white/80 relative z-10 p-2 space-y-1">
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
                className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-white/80 rounded-[24px] transition-all cursor-pointer"
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(() => {
     if (listing.media && Array.isArray(listing.media)) {
        const v = listing.media.find((m: any) => m.type === 'video');
        return v ? v.url : null;
     }
     return null;
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

  const handleUpdate = async () => {
    const finalDesc = valueEngineStr ? `${description}\n\n${valueEngineStr}` : description;
    
    toast.loading("Saving changes...");
    
    // Check if video was removed
    if (!videoUrl && listing.media && listing.media.some((m: any) => m.type === 'video')) {
       await supabase.from('listing_media').delete().match({ listing_id: listing.id, type: 'video' });
    }
    
    // Upload new video if provided
    if (videoFile) {
       const ext = videoFile.name.split('.').pop() || 'mp4';
       const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
       const { data: uploadData, error: uploadError } = await supabase.storage.from('listing-videos').upload(fileName, videoFile);
       if (!uploadError && uploadData) {
           const { data: publicUrlData } = supabase.storage.from('listing-videos').getPublicUrl(fileName);
           // Delete old video record first
           await supabase.from('listing_media').delete().match({ listing_id: listing.id, type: 'video' });
           // Insert new
           await supabase.from('listing_media').insert({
               listing_id: listing.id,
               type: 'video',
               url: publicUrlData.publicUrl
           });
       }
    }
    
    toast.dismiss();

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
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Photos & Video</label>
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
                  <span className="text-xs font-bold">Photo</span>
                </label>
              )}
              {videoUrl ? (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 group shadow-sm bg-black">
                  <video src={videoUrl} className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1" />
                    </div>
                  </div>
                  <button 
                    onClick={() => { setVideoUrl(null); setVideoFile(null); }}
                    className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ) : (
                <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 flex-shrink-0 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-500/5 transition-all cursor-pointer">
                  <input 
                    type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVideoFile(file);
                        setVideoUrl(URL.createObjectURL(file));
                      }
                    }} 
                  />
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-xs font-bold">Video</span>
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
