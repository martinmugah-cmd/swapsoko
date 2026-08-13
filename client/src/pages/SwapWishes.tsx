import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Star, ArrowRight, Repeat2, Check, X, Flame, Zap, Leaf, Package, Repeat, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ProposeSwapModal } from "./Swipes";
import { useAppStore } from "@/store";

function PreviewUser({ uid }: { uid: string }) {
   const profileQuery = trpc.profile.get.useQuery({ id: uid }, { enabled: !!uid });
   let partnerName = profileQuery.isLoading ? "Loading..." : (uid ? uid.slice(0,5) : "Unknown");
   try {
      if (profileQuery.data) {
        const desc = JSON.parse(profileQuery.data?.university || "{}");
        if (desc.username) partnerName = desc.username;
        else if (profileQuery.data?.name && profileQuery.data.name !== "SwapSoko User" && profileQuery.data.name !== "User") partnerName = profileQuery.data.name.split(" ").join("").toLowerCase();
      }
   } catch(e) {}
   return <span>@{partnerName}</span>;
}

function SwapChain({ cycle }: { cycle: { legs: any[]; type: string; matchScore?: number; distance?: string; trust?: number; } }) {
  const { user } = useAuth();
  const [previewLeg, setPreviewLeg] = useState<any>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Repeat2 className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-[15px] tracking-tight">
              {cycle.type === "3way" ? "3-Way" : "4-Way"} Swap Cycle
            </h3>
            <p className="text-[11px] font-bold text-gray-500 tracking-wide uppercase mt-0.5">Automated Match</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {cycle.matchScore && <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold border border-indigo-100/50">Fit {cycle.matchScore}%</span>}
          <div className="flex items-center gap-1.5">
             {cycle.distance && <span className="text-[9px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full font-bold">Dist {cycle.distance}</span>}
             {cycle.trust && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">Trust {cycle.trust}%</span>}
          </div>
        </div>
      </div>

      {/* Chain visualization */}
      <div className="relative bg-gray-50/50 rounded-2xl p-4 border border-gray-100/80 mb-5">
        <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible hide-scrollbar snap-x z-10 relative pt-2 pb-2">
          {cycle.legs.map((leg: any, i: number) => {
            const isOwn = user && leg.userId === user.id;
            return (
              <div key={i} className="flex items-center gap-3 flex-shrink-0 snap-center">
                <motion.div 
                  layoutId={`cycle-card-${leg.id || leg.receiveListingId}`}
                  onClick={() => { if (!isOwn) setPreviewLeg(leg) }} 
                  className={`flex flex-col items-center bg-white p-3 rounded-2xl min-w-[110px] shadow-sm border border-gray-100 relative ${isOwn ? 'ring-2 ring-indigo-500 ring-offset-2' : 'cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300'}`}
                >
                  {isOwn && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full z-20 shadow-sm">You</span>}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-50 mb-2.5 relative flex items-center justify-center group mt-1">
                    {(() => {
                      let imgs: string[] = [];
                      if (Array.isArray(leg.images)) imgs = leg.images;
                      else if (typeof leg.images === 'string') { try { imgs = JSON.parse(leg.images); } catch(e) { imgs = [leg.images]; } }
                      const img = (imgs[0] && !imgs[0].startsWith('blob:')) ? imgs[0] : null;
                      return img ? (
                        <>
                          <img src={img} alt={leg.title} className="w-full h-full object-cover absolute inset-0 z-10 transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          <div className="absolute inset-0 bg-black/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 z-0">
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-[12px] text-center text-slate-900 font-extrabold w-[95px] truncate px-1 tracking-tight" title={leg.title}>{leg.title}</p>
                  <p className="text-[9px] text-gray-400 font-bold mt-0.5 truncate w-[95px] text-center"><PreviewUser uid={leg.userId} /></p>
                </motion.div>
              
                {/* Arrow connecting nodes */}
                <div className="w-6 flex justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-300" strokeWidth={2.5} />
                </div>
              </div>
            );
          })}
          {/* Loop back indicator */}
          <div className="flex items-center gap-2 flex-shrink-0 pr-4">
             <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center border-dashed shadow-sm">
                <Repeat2 className="w-5 h-5 text-gray-400" />
             </div>
          </div>
        </div>
      </div>
      {/* Group Propose Action */}
      <div className="pt-2 flex items-center justify-between">
        <p className="text-[11px] text-gray-500 font-medium max-w-[190px] leading-relaxed">Starting this cycle will create a dedicated group chat to finalize terms.</p>
        <ProposeCycleButton cycle={cycle} />
      </div>
      <AnimatePresence>
        {previewLeg && (
           <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
             <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={() => setPreviewLeg(null)} 
             />
             
             <motion.div 
                layoutId={`cycle-card-${previewLeg.id || previewLeg.receiveListingId}`}
                className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
             >
                <div className="w-full h-[400px] relative">
                   {(() => {
                      let imgs: string[] = [];
                      if (Array.isArray(previewLeg.images)) imgs = previewLeg.images;
                      else if (typeof previewLeg.images === 'string') { try { imgs = JSON.parse(previewLeg.images); } catch(e) { imgs = [previewLeg.images]; } }
                      const img = (imgs[0] && !imgs[0].startsWith('blob:')) ? imgs[0] : null;
                      return img ? (
                         <img src={img} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full bg-gray-50 flex items-center justify-center"><Package className="w-16 h-16 text-gray-300" /></div>
                      );
                   })()}
                   <button onClick={() => setPreviewLeg(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40"><X className="w-5 h-5" /></button>
                   <div className="absolute inset-x-0 bottom-0 pt-20 pb-4 px-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                      <h1 className="text-2xl font-black text-white leading-tight shadow-sm mb-1">{previewLeg.title}</h1>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-white/90 font-bold">User: <PreviewUser uid={previewLeg.userId} /></p>
                      </div>
                   </div>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ProposeCycleButton({ cycle }: { cycle: any }) {
  const { user } = useAuth();
  const profileQuery = (trpc as any).profile.me.useQuery(undefined, { enabled: !!user });
  const hasMyListing = cycle.legs.some((leg: any) => leg.userId === user?.id);
  const newCycleRoomMutation = (trpc as any).chat.newCycleRoom.useMutation();
  const denyCycleMutation = (trpc as any).chat.denyCycle.useMutation();
  const cycleHash = [...cycle.legs.map((l: any) => l.id || l.receiveListingId)].sort().join('-');
  const checkQuery = (trpc as any).chat.checkCycleState.useQuery({ cycleHash }, { enabled: !!user, refetchInterval: 3000 });

  useEffect(() => {
    const handleUpdate = () => checkQuery.refetch();
    window.addEventListener('app_messages_updated', handleUpdate);
    return () => window.removeEventListener('app_messages_updated', handleUpdate);
  }, []);
  
  if (!hasMyListing) {
    return (
      <button disabled className="px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-gray-100 text-gray-400">
        Not a participant
      </button>
    );
  }

  const state = checkQuery.data;
  const isJoined = state?.joined?.includes(user?.id);
  const isRejected = state?.status === 'rejected';
  
  const handleAction = async (action: 'join' | 'deny') => {
    if (!user) return;
    const allParticipants = cycle.legs.map((l: any) => l.userId).filter(Boolean);
    const uniqueParticipants = Array.from(new Set(allParticipants));
    
    let myName = user.user_metadata?.firstName || user.metadata?.firstName || 'User';
    if (profileQuery.data?.name) {
       try {
           const desc = JSON.parse(profileQuery.data.university || "{}");
           myName = desc.username || profileQuery.data.name;
       } catch(e) {
           myName = profileQuery.data.name;
       }
    }

    try {
      if (action === 'join') {
        toast.success("Joining cycle group...");
        await newCycleRoomMutation.mutateAsync({
          userId: user.id,
          userName: myName,
          participantIds: uniqueParticipants,
          cycleHash,
          cycle: cycle
        });
      } else {
        toast.success("Cycle denied.");
        await denyCycleMutation.mutateAsync({
          userId: user.id,
          userName: myName,
          cycleHash
        });
      }
      checkQuery.refetch();
    } catch (e) {
      console.error("Action failed", e);
    }
  };

  if (isRejected) {
     return (
        <button disabled className="px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-red-50 text-red-400">
           Cycle Denied
        </button>
     );
  }

  if (state?.exists) {
    if (state?.status === 'accepted') {
       return (
         <button disabled className="px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-200">
           Cycle Accepted!
         </button>
       );
    }
    if (state?.joined?.length === cycle.legs.length) {
       return (
         <button disabled className="px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-indigo-500 text-white shadow-md shadow-indigo-500/20">
           Group Created
         </button>
       );
    }
    if (isJoined) {
       return (
         <button disabled className="px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200">
           Joined - Waiting...
         </button>
       );
    }
    return (
       <div className="flex items-center gap-2">
         <motion.button
           whileTap={{ scale: 0.95 }}
           onClick={() => handleAction('deny')}
           disabled={denyCycleMutation.isPending || newCycleRoomMutation.isPending}
           className="px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-red-50 text-red-600 hover:bg-red-100 transition-all"
         >
           Deny
         </motion.button>
         <motion.button
           whileTap={{ scale: 0.95 }}
           onClick={() => handleAction('join')}
           disabled={denyCycleMutation.isPending || newCycleRoomMutation.isPending}
           className="px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
         >
           Join In
         </motion.button>
       </div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => handleAction('join')}
      disabled={newCycleRoomMutation.isPending}
      className={`px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wide transition-all ${
        newCycleRoomMutation.isPending ? "bg-gray-100 text-gray-400" : "bg-green-500 text-white shadow-[#22C55E]/30 shadow-lg hover:shadow-xl hover:bg-[#16a34a]"
      }`}
    >
      {newCycleRoomMutation.isPending ? "Pending..." : "Propose Cycle"}
    </motion.button>
  );
}

export function WishCard({ wish, onRespond, hideOfferButton }: { wish: any; onRespond?: () => void; hideOfferButton?: boolean }) {
    const { user } = useAuth();
  const { savedWishIds, toggleSavedWish } = useAppStore();
  
  let offerItems: string[] = [];
  if (Array.isArray(wish.offerItems)) offerItems = wish.offerItems;
  else if (typeof wish.offerItems === 'string') { try { const parsed = JSON.parse(wish.offerItems); offerItems = Array.isArray(parsed) ? parsed : [wish.offerItems]; } catch(e) { offerItems = [wish.offerItems]; } }

  const urgencyConfig: Record<string, { bg: string; text: string; border: string; label: React.ReactNode }> = {
    high: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", label: <><Flame className="w-3 h-3 inline" /> Urgent</> },
    medium: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", label: <><Zap className="w-3 h-3 inline" /> Medium</> },
    low: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", label: <><Leaf className="w-3 h-3 inline" /> Low</> },
  };
  const uc = urgencyConfig[wish.urgency || "medium"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 relative overflow-hidden flex flex-col`}
    >
      <div className={`absolute top-0 bottom-0 left-0 w-[6px] ${uc.bg.replace('bg-', 'bg-').replace('-50', '-400')}`} />
      
      <div className="pl-2">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 uppercase tracking-wider ${uc.bg} ${uc.text}`}>{uc.label}</span>
            <span className="text-[11px] text-gray-400 font-bold tracking-wider uppercase">{wish.campus?.split(",")[0] || "JKUAT"}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest mb-1">{"Need"}</p>
            <p className="font-extrabold text-slate-900 text-[20px] leading-tight">{wish.title}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest mb-1.5">{"Offering"}</p>
            <div className="flex flex-wrap gap-2">
              {offerItems.map((item: string, i: number) => (
                <span key={i} className="bg-blue-50 text-blue-600 border border-blue-100 text-[12px] px-3 py-1.5 rounded-full font-bold shadow-sm">{item}</span>
              ))}
              {wish.cashTopUp > 0 && (
                <span className="bg-green-500 text-white border border-[#16A34A] text-[12px] font-extrabold px-3 py-1.5 rounded-full shadow-sm">+ KES {wish.cashTopUp.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {(() => {
              const avatar = wish.profiles?.avatarUrl || wish.user?.avatar_url;
              if (avatar) {
                return <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm" />;
              }
              return (
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shadow-sm border border-slate-200">
                  <span className="text-slate-600 text-[11px] font-black">{(wish.profiles?.name || wish.user?.name || "U").charAt(0).toUpperCase()}</span>
                </div>
              );
            })()}
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900">@{(() => {
                    const n = wish.profiles?.name || wish.user?.name;
                    try {
                      const desc = JSON.parse(wish.profiles?.university || "{}");
                      return desc.username || (n && n !== "SwapSoko User" ? n.split(" ").join("").toLowerCase() : "user");
                    } catch(e) {
                      return n && n !== "SwapSoko User" ? n.split(" ").join("").toLowerCase() : "user";
                    }
                  })()}</span>
              {wish.responseCount > 0 && (
                <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg font-bold">
                  {wish.responseCount} offers
                </span>
              )}
            </div>
          </div>
          {wish.userId !== user?.id && !hideOfferButton && (
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => wish.id && toggleSavedWish(wish.id.toString())}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 shadow-sm hover:bg-gray-100 transition-colors"
              >
                <Heart className={`w-4 h-4 ${wish.id && savedWishIds.includes(wish.id.toString()) ? 'text-red-400 fill-red-400' : 'text-gray-400'}`} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onRespond}
                className="bg-slate-900 text-white text-[13px] font-extrabold px-5 py-2 rounded-full shadow-[0_4px_15px_rgba(15,23,42,0.2)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.3)] transition-all"
              >
                Offer
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Create Wish Modal ────────────────────────────────────────────────────────
export function CreateWishModal({ onClose, communityId }: { onClose: () => void; communityId?: number }) {
  const { user } = useAuth();
  const createMutation = trpc.wishes.create.useMutation();
  const [requestedItem, setRequestedItem] = useState("");
  const [offeringInput, setOfferingInput] = useState("");
  const [offeringItems, setOfferingItems] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [expiryDate, setExpiryDate] = useState("");
  const [cashTopUp, setCashTopUp] = useState(0);

  const filters = useAppStore(state => state.filters);
  const utils = trpc.useUtils();
  const handleSubmit = () => {
    if (!requestedItem.trim()) { toast.error("Enter what you need"); return; }
    let description = requestedItem;
    if (expiryDate) description += `\n\n[Expires: ${expiryDate}]`;
    if (communityId) description += `\n\n<!--soko:${communityId}-->`;
    
    const finalCampus = filters.campus || user?.user_metadata?.campus || "JKUAT Main Campus (Juja)";
    
    createMutation.mutate({ 
      title: requestedItem, 
      description: description, 
      offerItems: offeringItems, 
      urgency, 
      userId: user?.id, 
      campus: finalCampus 
    }, {
      onSuccess: () => { 
        utils.wishes.list.invalidate();
        toast.success("Swish posted!"); 
        onClose(); 
      },
      onError: (err: any) => { toast.error("Failed to post swish"); console.error(err); }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-[480px] rounded-t-[32px] p-6 pb-28 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
        
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <h3 className="font-extrabold text-slate-900 text-2xl tracking-tight">Post a Swish</h3>
        </div>
        <p className="text-slate-500 text-[13px] font-medium">Let the community know what you're looking for.</p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">I Need *</label>
            <input
              value={requestedItem}
              onChange={e => setRequestedItem(e.target.value)}
              placeholder="e.g. iPhone 11, Laptop..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-400/10 transition-all font-semibold text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">I'm Offering</label>
            <div className="flex gap-2">
              <input
                value={offeringInput}
                onChange={e => setOfferingInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && offeringInput.trim()) {
                    setOfferingItems(prev => [...prev, offeringInput.trim()]);
                    setOfferingInput("");
                  }
                }}
                placeholder="Add items you can offer..."
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-400/10 transition-all font-semibold text-slate-900 placeholder:text-slate-400"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (offeringInput.trim()) {
                    setOfferingItems(prev => [...prev, offeringInput.trim()]);
                    setOfferingInput("");
                  }
                }}
                className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-md hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-5 h-5 text-white" />
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {offeringItems.map((item, i) => (
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={i} 
                  className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold text-[13px] px-3 py-1.5 rounded-full shadow-sm"
                >
                  {item}
                  <button onClick={() => setOfferingItems(prev => prev.filter((_, idx) => idx !== i))} className="hover:bg-yellow-200 rounded-full p-0.5 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Urgency</label>
            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {(["low", "medium", "high"] as const).map(u => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className={`flex-1 py-2 rounded-[14px] text-[13px] font-bold capitalize transition-all duration-200 ${
                    urgency === u ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {u === "high" ? <><Flame className={`w-3.5 h-3.5 inline mr-1 ${urgency === 'high' ? 'text-red-500' : ''}`} /> Urgent</> : 
                   u === "medium" ? <><Zap className={`w-3.5 h-3.5 inline mr-1 ${urgency === 'medium' ? 'text-amber-500' : ''}`} /> Medium</> : 
                   <><Leaf className={`w-3.5 h-3.5 inline mr-1 ${urgency === 'low' ? 'text-green-500' : ''}`} /> Low</>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Expiry Date (Optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-400/10 transition-all font-semibold text-slate-900 placeholder:text-slate-400 block appearance-none"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={createMutation.isPending || !requestedItem.trim()}
          className="w-full mt-8 bg-yellow-400 text-yellow-950 font-extrabold text-[15px] py-4 rounded-full shadow-[0_8px_20px_rgba(250,204,21,0.3)] hover:shadow-[0_12px_25px_rgba(250,204,21,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {createMutation.isPending ? "Posting..." : "Post Swish"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Swap Wishes Page ─────────────────────────────────────────────────────────
export default function SwapWishesPage() {
    const [, navigate] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<"wishes" | "cycles">("wishes");
  const [proposeWish, setProposeWish] = useState<any>(null);

  const wishesQuery = trpc.wishes.list.useQuery({ limit: 20 });
  const cyclesQuery = trpc.multiWay.findCycles.useQuery(
    { listingId: 1 },
    { enabled: activeTab === "cycles" }
  );
  const sendProposal = trpc.proposals.send.useMutation();
  
  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    wishesQuery.refetch();
  }, [user?.id]);

  const handleSendProposal = (message: string, cashTopUp: number, options?: any) => {
    if (!proposeWish) return;
    const toastId = toast.loading("Sending proposal...");
    sendProposal.mutate({
      wishId: proposeWish.id,
      userId: user?.id,
      toUserId: proposeWish.userId,
      message,
      cashTopUp,
      ...options
    }, {
      onSuccess: (data: any) => {
        toast.success("Proposal sent!", { id: toastId });
        setProposeWish(null);
      },
      onError: () => {
        toast.error("Failed to send proposal", { id: toastId });
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8FAFC] bottom-nav-safe"
    >
      {/* Dynamic Floating Header */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-2">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex flex-col gap-3 bg-white/70 backdrop-blur-3xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[24px] px-4 py-3 max-w-[800px] mx-auto w-full"
        >
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/")} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200/80 transition-colors text-slate-900">
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>
            
            <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
              <h1 className="font-extrabold text-slate-900 text-[18px] flex items-center justify-center gap-1.5 tracking-tight">
                <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" /> Swishes
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Wishes & Cycles</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowCreate(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors text-emerald-600"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: "wishes", label: "Wishes Board" },
              { id: "cycles", label: "Multi-Way Swap" },
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 rounded-[16px] text-[13px] font-bold transition-all ${
                  activeTab === tab.id ? "bg-slate-900 text-white shadow-md" : "bg-slate-100/50 text-slate-600 hover:bg-slate-200/50"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <AnimatePresence mode="wait">
          {activeTab === "wishes" ? (
            <motion.div
              key="wishes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {wishesQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={`sk-wish-${i}`} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="w-3/4 h-4 bg-gray-100 rounded-full"></div>
                          <div className="w-1/2 h-3 bg-gray-100 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (() => {
                let displayWishes = (wishesQuery.data?.items || []).filter((w: any) => w.userId?.toString() !== user?.id?.toString());
                const searchParams = new URLSearchParams(window.location.search);
                const targetId = searchParams.get('id');
                if (targetId) {
                  displayWishes = [...displayWishes];
                  const targetIdx = displayWishes.findIndex((i: any) => i.id?.toString() === targetId);
                  if (targetIdx > 0) {
                    const target = displayWishes[targetIdx];
                    displayWishes.splice(targetIdx, 1);
                    displayWishes.unshift(target);
                  }
                }
                
                return displayWishes.map((wish: any) => (
                  <WishCard
                    key={wish.id}
                    wish={wish}
                    onRespond={() => {
                      if (!isAuthenticated) {
                        toast("Please login to make an offer");
                        return;
                      }
                      setProposeWish(wish);
                    }}
                  />
                ));
              })()}
              {(wishesQuery.data?.items || []).length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Star className="w-12 h-12 text-yellow-400 fill-yellow-400/20" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">No Swishes Yet</h3>
                  <p className="text-slate-500 text-[15px] font-medium max-w-[260px] leading-relaxed mb-8">
                    Be the first to let the community know what you're looking for.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreate(true)}
                    className="flex items-center justify-center gap-2 w-full max-w-[240px] bg-yellow-400 text-yellow-950 font-extrabold text-[15px] py-4 rounded-full shadow-[0_8px_20px_rgba(250,204,21,0.25)] hover:shadow-[0_12px_25px_rgba(250,204,21,0.35)] hover:-translate-y-0.5 transition-all"
                  >
                    <Plus className="w-5 h-5" /> Post Your First Swish
                  </motion.button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="cycles"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pb-20"
            >
              {cyclesQuery.isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={`sk-cycle-${i}`} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-pulse">
                      <div className="w-1/3 h-5 bg-gray-100 rounded-full mb-4 mx-auto"></div>
                      <div className="flex justify-between items-center px-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
                        <div className="flex-1 h-1 bg-gray-100 mx-4"></div>
                        <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
                        <div className="flex-1 h-1 bg-gray-100 mx-4"></div>
                        <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (Array.isArray(cyclesQuery.data) ? cyclesQuery.data : cyclesQuery.data?.cycles || []).length > 0 ? (
                (Array.isArray(cyclesQuery.data) ? cyclesQuery.data : cyclesQuery.data?.cycles || []).map((cycle: any, i: number) => (
                  <SwapChain key={i} cycle={cycle} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Repeat className="w-12 h-12 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">No Cycles Found Yet</h3>
                  <p className="text-slate-500 text-[15px] font-medium max-w-[260px] leading-relaxed mb-8">
                    Add more items to your profile to enable AI-powered multi-way swaps.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/post")}
                    className="flex items-center justify-center gap-2 w-full max-w-[240px] bg-indigo-500 text-white font-extrabold text-[15px] py-4 rounded-[20px] shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_25px_rgba(99,102,241,0.35)] hover:-translate-y-0.5 transition-all"
                  >
                    <Plus className="w-5 h-5" /> Add a Listing
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Modals */}
      <AnimatePresence>
        {showCreate && <CreateWishModal onClose={() => setShowCreate(false)} />}
        {proposeWish && (
          <ProposeSwapModal
            listing={proposeWish}
            onClose={() => setProposeWish(null)}
            onSend={handleSendProposal}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
