import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft, ShieldCheck, Send, Mic, Image, Check, CheckCheck,
  Phone, MoreVertical, MessageCircle, Plus, X, Smile, Star, Square, MapPin, Handshake, Repeat2, CheckCircle, XCircle, GraduationCap
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { formatDistanceToNow } from "date-fns";
import ProfilePage from "@/pages/Profile";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CycleReviewModal } from "@/components/CycleReviewModal";
import { ReportModal } from "@/components/ReportModal";
import { MeetingSchedulerModal } from "@/components/MeetingSchedulerModal";
import { TradeCertificate } from "@/components/TradeCertificate";

import { VoicePlayer } from "@/components/VoicePlayer";
// Fix for default marker icon in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const TIPS = [
  "Meet in well-lit public spaces.",
  "Check items thoroughly before leaving.",
  "Never send money before meeting.",
  "Bring a friend for high-value swaps.",
  "Trust your instincts. If it feels off, cancel.",
  "Test electronics with a power bank.",
  "Confirm university ID if on campus."
];

function getStableTip(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TIPS[Math.abs(hash) % TIPS.length];
}

// ─── Quick Reply Chips ────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  "Is this still available?",
  "Can we meet at JKUAT?",
  "I can add KES 500 via M-Pesa",
  "Deal! Let's swap",
  "Can I see more photos?",
  "Where shall we meet?",
];

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

function ParticipantRow({ pid, isYou }: { pid: string, isYou: boolean }) {
   const profileQuery = trpc.profile.get.useQuery({ id: pid }, { enabled: !!pid });
   let partnerName = "User";
   let avatarUrl = undefined;
   try {
      const desc = JSON.parse(profileQuery.data?.university || "{}");
      if (desc.username) partnerName = desc.username;
      else if (profileQuery.data?.name && profileQuery.data.name !== "SwapSoko User" && profileQuery.data.name !== "User") partnerName = profileQuery.data.name.split(" ").join("").toLowerCase();
      if (desc.avatarUrl) avatarUrl = desc.avatarUrl;
      if (profileQuery.data?.avatarUrl) avatarUrl = profileQuery.data.avatarUrl;
   } catch(e) {}

   return (
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
         <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#22C55E]/20 to-[#3B82F6]/20 flex items-center justify-center border border-gray-100 overflow-hidden">
            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-slate-900 font-bold">{partnerName.slice(0,2).toUpperCase()}</span>}
         </div>
         <div>
            <p className="font-bold text-slate-900">@{partnerName}</p>
            {isYou && <p className="text-xs text-green-500 font-bold">You</p>}
         </div>
      </div>
   );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function ChatBubble({ msg, isOwn, allMessages, currentUserId, partnerFullName, onConfirmReceipt, onViewProfile, onImageClick, onOpenAgreement, onRejectProposal, onCounterProposal, onReceiptClick, onPreviewClick, onAcceptCycle, onScheduleMeeting, onViewReceipt }: { msg: any; isOwn: boolean; allMessages?: any[]; currentUserId?: string; partnerFullName?: string; onConfirmReceipt?: (listingId: number) => void; onViewProfile?: (userId: string) => void; onImageClick?: (url: string) => void; onOpenAgreement?: (listingId: number, msgId?: number, isReview?: boolean, data?: any) => void; onRejectProposal?: (proposal: any, msgId?: number, rawContent?: string) => void; onCounterProposal?: (proposal: any, msgId?: number, rawContent?: string) => void; onReceiptClick?: (rData: any) => void; onPreviewClick?: (leg: any) => void; onAcceptCycle?: (msgId: number, cycleInfo: any) => void; onScheduleMeeting?: (cycleInfo: any) => void; onViewReceipt?: (cycleInfo: any) => void; }) {
  const [, navigate] = useLocation();
  const [frontCardId, setFrontCardId] = useState<string | null>(null);
  const isVoice = msg.type === "voice";
  const isImage = msg.type === "image" || !!msg.imageUrl;
  const isQuickReply = msg.type === "quick_reply";
  const isProposal = msg.type === "proposal";
  
  const listingMatch = msg.content?.match(/\[Regarding Listing:\s*(\d+)\]/);
  const taggedListingId = listingMatch ? parseInt(listingMatch[1]) : null;
  const wishMatch = msg.content?.match(/\[Regarding Wish:\s*(\d+)\]/);
  const taggedWishId = wishMatch ? parseInt(wishMatch[1]) : null;

  const contentText = msg.content?.replace(/\[Regarding (Listing|Wish):\s*\d+\]\n?/, "");
  
  const listingQuery = trpc.listings.get.useQuery({ id: taggedListingId as number }, { enabled: !!taggedListingId });
  const listing = listingQuery.data;

  const wishQuery = trpc.wishes.get.useQuery({ id: taggedWishId as number }, { enabled: !!taggedWishId });
  const wish = wishQuery.data;

  const communityQuery = trpc.communities.get.useQuery({ id: listing?.communityId as number }, { enabled: !!listing?.communityId });
  const communityName = communityQuery.data?.name;

  let locationCoords = null;
  const mapsLinkMatch = contentText?.match(/maps\.google\.com\/\?q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/);
  if (mapsLinkMatch) {
    locationCoords = { lat: parseFloat(mapsLinkMatch[1]), lng: parseFloat(mapsLinkMatch[3]) };
  } else {
    const coordsMatch = contentText?.match(/(-?\d+\.\d{2,}),\s*(-?\d+\.\d{2,})/);
    if (coordsMatch) {
      locationCoords = { lat: parseFloat(coordsMatch[1]), lng: parseFloat(coordsMatch[2]) };
    }
  }

  if (msg.type === "cycle_action") {
     let actionData: any = {};
     try { actionData = JSON.parse(msg.content); } catch(e) {}
     
     if (actionData.action === 'counter') {
        return (
           <div className="flex justify-center my-6 w-full">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 max-w-sm w-full text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full mix-blend-multiply blur-xl -translate-y-1/2 translate-x-1/4"></div>
                 <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md mb-3 inline-block relative z-10">Counter Proposal</span>
                 <p className="text-sm text-gray-800 font-medium relative z-10">
                   {msg.senderId ? <PreviewUser uid={msg.senderId} /> : (actionData.userName ? `@${actionData.userName}` : 'A user')} has proposed new terms for the swap.
                 </p>
                 {actionData.changes && (
                   <div className="mt-3 flex flex-col gap-2 relative z-10">
                      {actionData.changes.message && (
                         <div className="bg-gray-50/70 rounded-2xl px-5 py-4 text-sm italic text-gray-700 border border-gray-100 text-left mx-1 shadow-sm mb-3">
                            "{actionData.changes.message}"
                         </div>
                      )}
                      {actionData.changes.cashTopUp && (
                         <div className="flex flex-col bg-green-50/70 rounded-2xl px-5 py-4 border border-green-100 text-left mb-3 mx-1 shadow-sm">
                            <span className="text-xs font-extrabold text-green-800 uppercase tracking-widest mb-1">Cash Top-up</span>
                            {actionData.changes.topUpPayerId ? (
                               <span className="text-sm font-medium text-green-900 leading-snug">
                                  <PreviewUser uid={actionData.changes.topUpPayerId} /> will pay <PreviewUser uid={actionData.changes.topUpReceiverId} /> <span className="font-black">+ KES {actionData.changes.cashTopUp}</span>
                               </span>
                            ) : (
                               <span className="text-sm font-medium text-green-900 leading-snug">
                                  A cash top-up of <span className="font-black">+ KES {actionData.changes.cashTopUp}</span> was requested.
                               </span>
                            )}
                         </div>
                      )}
                      {actionData.changes.meetingLocation && (
                         <div className="flex flex-col bg-purple-50/70 rounded-2xl px-5 py-4 border border-purple-100 text-left mx-1 shadow-sm">
                            <span className="text-xs font-extrabold text-purple-800 uppercase tracking-widest mb-1">Meeting Suggested</span>
                            <span className="text-sm font-bold text-purple-900 leading-snug">{actionData.changes.meetingLocation}</span>
                            {(actionData.changes.meetingDate || actionData.changes.meetingTime) && (
                               <span className="text-[11px] text-purple-700 mt-1 font-medium">
                                 {actionData.changes.meetingDate} {actionData.changes.meetingTime && `at ${actionData.changes.meetingTime}`}
                               </span>
                            )}
                         </div>
                      )}
                   </div>
                 )}
              </div>
           </div>
        );
     }

     return (
       <div className="flex justify-center my-4 w-full">
         <span className="text-xs font-medium text-gray-500 bg-gray-100/80 backdrop-blur px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
            {msg.senderId ? <PreviewUser uid={msg.senderId} /> : (actionData.userName ? `@${actionData.userName}` : 'A user')} {actionData.action === 'accept' ? 'accepted the cycle proposal' : actionData.action === 'join' ? 'joined the cycle group' : actionData.action === 'reject' ? 'rejected the cycle' : actionData.action === 'suggest_meeting' ? 'suggested a meeting' : 'interacted with the cycle'}
         </span>
       </div>
     );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}
    >
      {!isOwn && (
        <div className="w-7 h-7 rounded-full gradient-green flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1 cursor-pointer overflow-hidden" onClick={() => onViewProfile ? onViewProfile(msg.senderId) : navigate(`/profile/${msg.senderId}`)}>
           {(() => {
              const ProfileAvatar = ({ uid }: { uid: string }) => {
                 const query = trpc.profile.get.useQuery({ id: uid }, { enabled: !!uid });
                 let initial = "?";
                 let url = "";
                 try {
                    const desc = JSON.parse(query.data?.university || "{}");
                    initial = (desc.username || query.data?.name || "U")[0].toUpperCase();
                    url = desc.avatarUrl || query.data?.avatarUrl || "";
                 } catch(e) {
                    initial = (query.data?.name || "U")[0].toUpperCase();
                    url = query.data?.avatarUrl || "";
                 }
                 if (url) return <img src={url} className="w-full h-full object-cover" />;
                 return <span className="text-white text-xs font-bold">{initial}</span>;
              };
              return <ProfileAvatar uid={msg.senderId} />;
           })()}
        </div>
      )}
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {isVoice ? (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-3xl ${isOwn ? "gradient-green rounded-br-sm text-white" : "bg-white card-shadow rounded-bl-sm"}`}>
            <VoicePlayer url={msg.content} isOwn={isOwn} />
          </div>
        ) : isImage ? (
          <div 
            onClick={() => onImageClick?.(msg.imageUrl || msg.content)}
            className={`rounded-2xl overflow-hidden cursor-pointer ${isOwn ? "border-2 border-green-500" : "border-2 border-white shadow-sm"}`}
          >
            <img src={msg.imageUrl || msg.content} alt="shared" className="w-48 h-auto max-h-64 object-cover" />
          </div>
        ) : isQuickReply ? (
          <div className={`px-4 py-2 rounded-3xl border-2 ${isOwn ? "border-green-500 text-green-500 bg-[#F0FDF4]" : "border-[#2563EB] text-blue-600 bg-[#EFF6FF]"}`}>
            <span className="text-xs font-semibold">{msg.content}</span>
          </div>
        ) : isProposal ? (
          (() => {
            let pData: any = {};
            try { pData = JSON.parse(msg.content); } catch(e) {}
            
            // Dynamically derive status if missing or local (RLS prevents DB update)
            if (allMessages) {
               const subsequentMessages = allMessages.filter(m => new Date(m.createdAt || m.created_at || 0) > new Date(msg.createdAt || msg.created_at || 0));
               
               for (const subMsg of subsequentMessages) {
                  if (subMsg.type === "text" && subMsg.content) {
                     const cleanContent = subMsg.content.replace(/\[Regarding (Listing|Wish):\s*\d+\]\n?/, "");
                     if (cleanContent.startsWith("[AGREEMENT]") || cleanContent.startsWith("[AGREEMENT_SIGNED]")) {
                        try {
                           const aData = JSON.parse(cleanContent.replace(/\[AGREEMENT_SIGNED\]|\[AGREEMENT\]/, ""));
                           if (aData.listingId === pData.listingId) {
                              pData.status = 'accepted';
                              break;
                           }
                        } catch(e) {}
                     } else if (cleanContent.startsWith("[REJECT] ")) {
                        // Assuming any reject after this proposal in the room applies to it
                        pData.status = 'rejected';
                        break;
                     }
                  } else if (subMsg.type === "proposal") {
                     try {
                        const nextPData = JSON.parse(subMsg.content);
                        if (nextPData.listingId === pData.listingId) {
                           pData.status = 'countered';
                           break;
                        }
                     } catch(e) {}
                  }
               }
            }
            
            return (
              <div className={`w-64 rounded-2xl p-5 shadow-sm border ${isOwn ? "bg-gradient-to-br from-[#22C55E]/10 to-[#10B981]/10 border-green-500/30 backdrop-blur-md" : "bg-white/90 backdrop-blur-md border-gray-100"}`}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOwn ? "bg-green-500/20 text-green-500" : "bg-blue-600/20 text-blue-600"}`}>
                    <Handshake className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-[15px]">{pData.wishId ? "Swish Offer" : "Swap Offer"}</h4>
                </div>
                {pData.listingTitle && (
                  <div className="flex items-center gap-3 mb-3 bg-white/50 p-2.5 rounded-2xl">
                     {!pData.wishId && (
                       pData.listingImage ? (
                          <img src={pData.listingImage} alt="Listing" className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm" />
                       ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                             <Image className="w-4 h-4 text-gray-400" />
                          </div>
                       )
                     )}
                     <p className="text-sm font-extrabold text-slate-900 line-clamp-2">
                        {pData.wishId && !pData.listingTitle.startsWith('Wish:') ? `Wish: ${pData.listingTitle}` : pData.listingTitle}
                     </p>
                  </div>
                )}
                <p className="text-xs text-gray-600 mb-2">{pData.message || "No message attached"}</p>
                {pData.offerItems && (
                  <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Offered Items</span>
                    <p className="text-xs font-bold text-gray-800">{pData.offerItems}</p>
                  </div>
                )}
                {pData.cashTopUp > 0 && (
                  <p className="text-xs font-bold text-green-500 mb-2">+ KES {pData.cashTopUp}</p>
                )}
                {!isOwn && !pData.status && (
                  <div className="flex flex-col gap-2 mt-4">
                    <button onClick={() => onOpenAgreement?.(pData.listingId, msg.id, false, pData)} className="w-full bg-slate-900 text-white text-xs font-bold py-2.5 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:bg-[#1E293B] transition-all">
                      Accept Offer
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => onCounterProposal?.(pData, msg.id)} className="flex-1 bg-white border border-gray-200 text-slate-900 text-xs font-bold py-2.5 rounded-full hover:bg-gray-50 transition-all">
                        Counter
                      </button>
                      <button onClick={() => onRejectProposal?.(pData, msg.id)} className="flex-1 bg-[#FEF2F2] border border-red-100 text-red-600 text-xs font-bold py-2.5 rounded-full hover:bg-red-50 transition-all">
                        Reject
                      </button>
                    </div>
                  </div>
                )}
                {pData.status ? (
                  <p className={`text-xs mt-2 text-center uppercase tracking-wider font-bold ${pData.status === 'rejected' ? 'text-red-500' : pData.status === 'accepted' ? 'text-green-500' : 'text-blue-500'}`}>Offer {pData.status}</p>
                ) : isOwn ? (
                  <p className="text-xs text-gray-400 mt-2 text-center uppercase tracking-wider font-bold">Offer Sent</p>
                ) : null}
              </div>
            );
          })()
        ) : msg.type === "cycle_init" ? (
          (() => {
            let cycleInfo: any = {};
            try { cycleInfo = JSON.parse(msg.content); } catch(e) {}
            const latestRevision = cycleInfo.revisions ? cycleInfo.revisions[cycleInfo.revisions.length - 1] : cycleInfo;
            const cycle = latestRevision.cycle;
            if (!cycle) return <div />;
            const cycleStatus = latestRevision.status;
            
            return (
              <div className="w-72 bg-gradient-to-br from-[#22C55E] via-[#10B981] to-[#3B82F6] rounded-2xl p-1 shadow-lg mt-2 mb-4 relative">
                <div className="bg-white/95 backdrop-blur-md rounded-[22px] p-4 h-full relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
                  
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#22C55E] to-[#3B82F6] flex items-center justify-center shadow-inner">
                      <Repeat2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-sm tracking-tight">{cycle.type === '3-way' ? '3-Way' : 'Multi-Way'} Swap Cycle</h4>
                      <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#3B82F6] uppercase tracking-widest">
                         Proposal {cycleInfo.revisions ? `(Rev ${cycleInfo.revisions.length})` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="relative h-[240px] mb-4 z-10 flex items-center justify-center">
                    {(() => {
                       if (!cycle.legs || !Array.isArray(cycle.legs)) return null;
                       const sortedLegs = [...cycle.legs].sort((a: any, b: any) => {
                          if (a.userId === currentUserId) return -1;
                          if (b.userId === currentUserId) return 1;
                          if (frontCardId) {
                             if ((a.id || a.receiveListingId) === frontCardId) return -1;
                             if ((b.id || b.receiveListingId) === frontCardId) return 1;
                          }
                          return 0;
                       });
                       const total = sortedLegs.length;
                       return sortedLegs.map((leg: any, i: number) => {
                          const isOwnListing = leg.userId === currentUserId;
                          // Fan out cards
                          const yOffset = (total - 1 - i) * -16;
                          const scale = 1 - (total - 1 - i) * 0.05;
                          const zIndex = i;
                          const rotation = (i - Math.floor(total / 2)) * 6;
                          return (
                            <motion.div 
                              key={i} 
                              layoutId={`cycle-card-${leg.id || leg.receiveListingId}`}
                              onClick={() => { 
                                 if (!isOwnListing) {
                                    setFrontCardId(leg.id || leg.receiveListingId);
                                    onPreviewClick?.(leg);
                                 }
                              }} 
                              className={`absolute left-1/2 top-1/2 w-36 h-48 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-[3px] border-white overflow-hidden ${isOwnListing ? 'cursor-default' : 'cursor-pointer hover:shadow-[0_12px_40px_rgb(0,0,0,0.2)] hover:z-50'}`} 
                              style={{ marginLeft: "-4.5rem", marginTop: "-6rem", zIndex }}
                              initial={{ y: yOffset, scale, rotate: rotation }}
                              animate={{ y: yOffset, scale, rotate: rotation }}
                              whileHover={isOwnListing ? {} : { y: yOffset - 30, rotate: 0, scale: scale * 1.05 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              {(() => {
                                 let imgs: string[] = [];
                                 if (Array.isArray(leg.images)) imgs = leg.images;
                                 else if (typeof leg.images === 'string') { try { imgs = JSON.parse(leg.images); } catch(e) { imgs = [leg.images]; } }
                                 if (!imgs.length && leg.receiveImage) imgs = [leg.receiveImage];
                                 const img = (imgs[0] && !imgs[0].startsWith('blob:')) ? imgs[0] : null;
                                 return img ? (
                                   <img src={img} className="absolute inset-0 w-full h-full object-cover" />
                                 ) : (
                                   <div className="absolute inset-0 bg-gray-100 flex items-center justify-center"><Image className="w-8 h-8 text-gray-300" /></div>
                                 );
                              })()}
                              <div className="absolute inset-x-0 bottom-0 pt-16 pb-3 px-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                <p className="text-xs font-black text-white leading-tight line-clamp-2 shadow-sm">{leg.title || leg.receiveTitle}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-[9px] text-white/80 font-bold truncate"><PreviewUser uid={leg.userId} /></p>
                                  {isOwnListing && <span className="text-[8px] font-black text-green-500 bg-white px-2 py-0.5 rounded-full shadow-sm">YOU</span>}
                                </div>
                              </div>
                            </motion.div>
                          )
                       });
                    })()}
                  </div>

                  {cycleStatus === 'pending' && !latestRevision.accepted_users?.includes(currentUserId) && <div className="flex gap-2 w-full mt-4 relative z-10">
                      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); console.log('counter 1 clicked'); onCounterProposal?.(cycle, msg.id, msg.content); }} className="flex-1 bg-white border border-gray-200 text-gray-700 text-[11px] font-bold py-2 rounded-full hover:bg-gray-50">Counter</button>
                      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRejectProposal?.(cycle, msg.id, msg.content); }} className="flex-1 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold py-2 rounded-full hover:bg-red-100">Reject</button>
                      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onAcceptCycle?.(msg.id, cycleInfo); }} className="flex-1 bg-green-50 border border-green-100 text-green-700 text-[11px] font-bold py-2 rounded-full hover:bg-green-100 shadow-sm shadow-green-500/20">Accept</button>
                  </div>}
                  
                  {cycleStatus === 'pending' && latestRevision.accepted_users?.includes(currentUserId) && (
                     <div className="flex flex-col gap-2 relative z-10 mt-3 pt-2 border-t border-gray-100">
                        <div className="text-center">
                           <span className="text-xs font-bold text-gray-600 bg-white/50 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Waiting for responses...</span>
                        </div>
                        <div className="flex justify-center mt-1">
                           <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); console.log('counter 2 clicked'); onCounterProposal?.(cycle, msg.id, msg.content); }} className="bg-white border border-gray-200 text-gray-700 text-xs font-bold px-4 py-1.5 rounded-full hover:bg-gray-50">Change Mind & Counter</button>
                        </div>
                     </div>
                  )}
                  
                  {cycleStatus !== 'pending' && (
                     <div className="text-center relative z-10 mt-3 pt-2 border-t border-gray-100 flex flex-col justify-center items-center gap-2">
                        <div className="flex justify-center items-center gap-2">
                          <span className={`text-xs font-bold uppercase tracking-wider ${['active', 'accepted', 'completed'].includes(cycleStatus) ? 'text-green-500' : 'text-red-500'}`}>{cycleStatus}</span>
                          {['accepted', 'scheduled', 'completed'].includes(cycleStatus) && (
                            <button onClick={() => onViewReceipt?.(cycleInfo)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold shadow-sm hover:bg-blue-100 transition-colors ml-2">View Certificate</button>
                          )}
                        </div>
                        {['accepted', 'scheduled'].includes(cycleStatus) && (
                          <div className="w-full mt-2">
                             {(() => {
                               const myReceiptSent = allMessages?.some((m: any) => String(m.senderId) === String(currentUserId) && m.content.startsWith("[RECEIVED]"));
                               const allReceipts = new Set(allMessages?.filter((m: any) => m.content.startsWith("[RECEIVED]")).map((m: any) => String(m.senderId)) || []);
                               const isCompleted = allReceipts.size >= (latestRevision.participants?.length || 0);
                               
                               if (isCompleted) {
                                  return <p className="text-center text-xs text-green-500 font-bold uppercase mt-2 border-t border-gray-100 pt-2">Cycle Completed ✓</p>;
                               }
                               if (!myReceiptSent) {
                                  return (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); onConfirmReceipt?.(0); }} 
                                      className="w-full bg-green-50 text-green-600 border border-green-200 py-1.5 rounded-full text-xs font-bold hover:bg-green-100 transition-colors"
                                    >
                                      Confirm Items Received
                                    </button>
                                  );
                               }
                               return <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{allReceipts.size} of {latestRevision.participants?.length} confirmed</p>;
                             })()}
                          </div>
                        )}
                     </div>
                  )}
                </div>
              </div>
            );
          })()
        ) : (
          <div className={`flex flex-col gap-1.5 ${isOwn ? "items-end" : "items-start"}`}>
            {listing && (
              <div className="flex flex-col gap-2">
                <div 
                  onClick={() => navigate(`/swipes?id=${listing.id}`)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center gap-3 w-56 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 relative">
                    {(() => {
                      let img = null;
                      if (Array.isArray(listing.images) && listing.images.length > 0) {
                        img = listing.images[0];
                      }
                      return img ? (
                        <img src={img} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <Image className="w-4 h-4 text-gray-300 m-auto mt-3" />
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                      {listing.title}
                      {listing.user_id && (
                        <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-200 inline-block align-middle">
                          {(() => {
                             const ProfileAvatar = ({ uid }: { uid: string }) => {
                                const query = trpc.profile.get.useQuery({ id: uid }, { enabled: !!uid });
                                let initial = "?";
                                let url = "";
                                try {
                                   const desc = JSON.parse(query.data?.university || "{}");
                                   initial = (desc.username || query.data?.name || "U")[0].toUpperCase();
                                   url = desc.avatarUrl || query.data?.avatarUrl || "";
                                } catch(e) {
                                   initial = (query.data?.name || "U")[0].toUpperCase();
                                   url = query.data?.avatarUrl || "";
                                }
                                if (url) return <img src={url} className="w-full h-full object-cover" />;
                                return <div className="w-full h-full bg-green-500 text-white flex items-center justify-center text-[8px] font-bold">{initial}</div>;
                             };
                             return <ProfileAvatar uid={listing.user_id} />;
                          })()}
                        </div>
                      )}
                    </p>
                    <p className="text-[9px] text-green-500 font-medium truncate">
                      {communityName ? `${communityName} Swap` : 'Swap Tag'}
                    </p>
                  </div>
                </div>
                {listing.status !== 'finalized' && currentUserId !== listing.user_id && (
                  <button onClick={(e) => { e.stopPropagation(); onOpenAgreement?.(listing.id); }} className="w-56 text-[11px] font-bold bg-[#F0FDF4] text-green-500 py-1.5 rounded-full border border-[#BBF7D0] hover:bg-green-100 transition-colors">
                    Create Swap Agreement
                  </button>
                )}
              </div>
            )}
            {wish && (
              <div 
                onClick={() => navigate(`/swap-wishes?id=${wish.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center gap-3 w-56 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{wish.title}</p>
                  <p className="text-[9px] text-yellow-600 font-medium truncate">Swish Tag</p>
                </div>
              </div>
            )}
            {contentText.trim() && (
              contentText.startsWith("[RECEIPT]") ? (
                (() => {
                  try {
                    const rData = JSON.parse(contentText.replace("[RECEIPT]", ""));
                    return (
                      <div onClick={() => onReceiptClick?.(rData)} className="bg-white w-64 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden cursor-pointer hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300">
                        <div className="bg-gradient-to-r from-[#22C55E] to-[#3B82F6] p-4 text-center">
                          <CheckCircle className="w-8 h-8 text-white mx-auto mb-1 opacity-90" />
                          <h3 className="font-black text-white tracking-widest uppercase text-xs">Transaction Receipt</h3>
                        </div>
                        <div className="p-5 bg-[#FAFAFA] relative">
                          <div className="absolute -top-3 left-4 w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100"></div>
                          <div className="absolute -top-3 right-4 w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100"></div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200 border-dashed">
                               <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
                               <span className="text-xs font-black text-slate-900">{new Date(rData.timestamp).toLocaleDateString()}</span>
                            </div>
                            {rData.type === 'cycle' ? (
                              <div className="flex justify-between items-center pb-3 border-b border-gray-200 border-dashed">
                                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cycle Action</span>
                                 <span className="text-xs font-black text-slate-900">Accepted</span>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center pb-3 border-b border-gray-200 border-dashed">
                                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Partner</span>
                                 <span className="text-xs font-black text-slate-900">{partnerFullName || rData.partnerName}</span>
                              </div>
                            )}
                            <div className="pb-3 border-b border-gray-200 border-dashed">
                               <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Items Included</span>
                               {rData.type === 'cycle' && rData.cycle?.legs ? (
                                   <div className="flex flex-col gap-2 mt-1">
                                      {rData.cycle.legs.map((leg: any, i: number) => {
                                         const nextLeg = rData.cycle.legs[(i + 1) % rData.cycle.legs.length];
                                         const cash = leg.cashTopUp || (rData.cycle.cashTopUp > 0 && rData.cycle.topUpSenderId === leg.id ? rData.cycle.cashTopUp : 0);
                                         return (
                                            <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                              <div className="flex flex-col flex-1 min-w-0 pr-1">
                                                 <span className="text-xs font-bold text-gray-800 truncate"><PreviewUser uid={leg.userId} /></span>
                                                 <span className="text-[9px] text-gray-500 font-medium truncate">gives: {leg.title || leg.receiveTitle}</span>
                                              </div>
                                              <div className="mx-1 text-gray-300 shrink-0">
                                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                              </div>
                                              <div className="flex flex-col items-end flex-1 min-w-0 pl-1 text-right">
                                                 <span className="text-xs font-bold text-gray-800 truncate"><PreviewUser uid={nextLeg.userId} /></span>
                                                 {cash > 0 && (
                                                    <span className="text-[9px] font-bold text-red-500 truncate">- KES {cash}</span>
                                                 )}
                                              </div>
                                            </div>
                                         );
                                      })}
                                   </div>
                                ) : (
                                   <>
                                      <p className="text-xs font-bold text-gray-800 leading-snug">{rData.itemsExchanged}</p>
                                      {rData.cashTopUp && <p className="text-xs font-bold text-green-500 mt-1">+ KES {rData.cashTopUp}</p>}
                                   </>
                                )}
                            </div>
                            {rData.type !== 'cycle' && (
                            <div className="pt-3">
                               <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
                                  <span className="text-blue-500 text-sm mt-0.5">💡</span>
                                  <div>
                                     <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-0.5">Safety Tip</p>
                                     <p className="text-[11px] font-medium text-blue-800 leading-tight">
                                        {getStableTip(rData?.id || String(msg?.id) || "tip")}
                                     </p>
                                  </div>
                               </div>
                            </div>
                            )}
                            {rData.cycle?.meetingLocation && (
                               <div className="pb-3 border-b border-gray-200 border-dashed">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Meeting Arranged</span>
                                  <p className="text-xs font-bold text-purple-700 leading-snug">{rData.cycle.meetingLocation}</p>
                                  {(rData.cycle.meetingDate || rData.cycle.meetingTime) && (
                                     <p className="text-xs font-medium text-purple-600 mt-0.5">
                                        {rData.cycle.meetingDate} {rData.cycle.meetingTime && `at ${rData.cycle.meetingTime}`}
                                     </p>
                                  )}
                               </div>
                            )}
                          </div>
                          <div className="mt-4 pt-3 flex items-center justify-center opacity-40">
                             <div className="w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgNCAyMCI+PHJlY3Qgd2lkdGg9IjIiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] bg-repeat-x"></div>
                          </div>
                          <p className="text-center text-[8px] font-black tracking-[0.2em] text-gray-400 mt-2">SWAPSOKO VERIFIED</p>
                        </div>
                      </div>
                    );
                  } catch(e: any) { return <div className="text-red-500 font-bold p-2 bg-red-50 rounded">Invalid receipt: {e.message}</div>; }
                })()
              ) : contentText.startsWith("[AGREEMENT]") || contentText.startsWith("[AGREEMENT_SIGNED]") ? (
                (() => {
                  try {
                    const isSigned = contentText.startsWith("[AGREEMENT_SIGNED]");
                    const aData = JSON.parse(contentText.replace(isSigned ? "[AGREEMENT_SIGNED]" : "[AGREEMENT]", ""));
                    return (
                      <div className="bg-white w-56 rounded-2xl shadow-sm border border-gray-200 p-3">
                         <div className="flex items-center gap-2 mb-2">
                           <Handshake className={`w-4 h-4 ${isSigned ? "text-green-500" : "text-blue-600"}`} />
                           <h4 className="font-bold text-slate-900 text-xs">Swap Agreement Form</h4>
                         </div>
                         <p className="text-xs text-gray-500 mb-3">{isSigned ? "Agreement has been signed and finalized." : "Proposed terms for the swap. Review and finalize to lock it in."}</p>
                         {!isSigned && !isOwn && (
                      <button 
                             onClick={() => onOpenAgreement?.(aData.listingId, msg.id, !isOwn, aData)}
                             className="w-full bg-[#EFF6FF] text-blue-600 text-[11px] font-bold py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                           >
                             Review & Finalize
                           </button>
                         )}
                         {!isSigned && isOwn && (
                           <p className="text-xs text-gray-400 mt-2 text-center uppercase tracking-wider font-bold">Form Sent</p>
                         )}
                         {isSigned && (
                           <>
                             {(() => {
                               const myReceiptSent = allMessages?.some((m: any) => String(m.senderId) === String(currentUserId) && m.content === `[RECEIVED]${aData.listingId}`);
                               const partnerReceiptSent = allMessages?.some((m: any) => String(m.senderId) !== String(currentUserId) && m.content === `[RECEIVED]${aData.listingId}`);
                               const isCompleted = myReceiptSent && partnerReceiptSent;

                               return (
                                 <div className="mt-2 pt-2 border-t border-gray-100">
                                   <p className="text-center text-xs text-green-500 font-bold uppercase mb-2">Swap Agreed ✓</p>
                                   {!myReceiptSent ? (
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); onConfirmReceipt?.(aData.listingId); }} 
                                       className="w-full bg-green-50 text-green-600 border border-green-200 py-1.5 rounded-full text-xs font-bold hover:bg-green-100 transition-colors"
                                     >
                                       Confirm Items Received
                                     </button>
                                   ) : !isCompleted ? (
                                     <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Waiting for partner...</p>
                                   ) : (
                                     <p className="text-center text-xs text-green-500 font-bold uppercase">Swap Completed ✓</p>
                                   )}
                                 </div>
                               );
                             })()}
                           </>
                         )}
                      </div>
                    );
                  } catch(e) { return <div>Invalid agreement form</div>; }
                })()
              ) : contentText.startsWith("[REJECT]") ? (
                <div className={`w-56 rounded-2xl shadow-sm border p-4 ${isOwn ? "bg-red-50 border-red-100" : "bg-white border-gray-100"}`}>
                   <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-[11px] font-black tracking-widest text-red-900 uppercase">Offer Rejected</span>
                   </div>
                   <p className="text-xs font-medium text-gray-700 leading-relaxed bg-white/50 p-2.5 rounded-xl">
                      {contentText.replace("[REJECT]", "").trim()}
                   </p>
                </div>
              ) : (
                <div className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${isOwn ? "gradient-green text-white rounded-br-[4px]" : "apple-glass-dark text-white rounded-bl-[4px]"}`}>
                  {locationCoords ? (
                    <div className="flex flex-col gap-2">
                      <p className="font-medium">{contentText.split('\n')[0] || "Shared Location"}</p>
                      <div 
                        onClick={() => window.open(`https://maps.google.com/?q=${locationCoords?.lat},${locationCoords?.lng}`, '_blank')}
                        className="h-40 w-[200px] sm:w-[250px] rounded-xl overflow-hidden relative z-0 cursor-pointer group"
                      >
                        <MapContainer center={[locationCoords.lat, locationCoords.lng]} zoom={15} style={{ height: "100%", width: "100%", pointerEvents: 'none' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[locationCoords.lat, locationCoords.lng]} />
                        </MapContainer>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-2 backdrop-blur-sm shadow-sm">
                            <MapPin className="w-5 h-5 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    contentText
                  )}
                </div>
              ))}
          </div>
        )}
        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
          <span className="text-[9px] text-gray-400">
            {(() => {
               try {
                  return formatDistanceToNow(new Date(msg.createdAt || Date.now()), { addSuffix: true });
               } catch(e) { return "recently"; }
            })()}
          </span>
          {isOwn && (
            msg.isRead
              ? <CheckCheck className="w-3 h-3 text-green-500" />
              : <Check className="w-3 h-3 text-gray-300" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ChatRoom({ roomId, onBack }: { roomId: number; onBack: () => void }) {
  const { user } = useAuth();
  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
  const [isReporting, setIsReporting] = useState(false);
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [mentionState, setMentionState] = useState({ active: false, query: "" });
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);
  const [agreementState, setAgreementState] = useState<{isOpen: boolean; listingId?: number; isReview?: boolean; data?: any; msgId?: number}>({isOpen: false});
  const [counterState, setCounterState] = useState<{isOpen: boolean; proposalData?: any; msgId?: number; isCycle?: boolean; rawContent?: string}>({isOpen: false});
  const [rejectState, setRejectState] = useState<{isOpen: boolean; proposalData?: any; msgId?: number; isCycle?: boolean; rawContent?: string}>({isOpen: false});

  const handleRejectSubmit = async (replyMsg: string) => {
    try {
      const { proposalData, msgId, isCycle, rawContent } = rejectState;
      let finalContent: any;
      
      if (isCycle && rawContent) {
          const content = JSON.parse(rawContent);
          const latestRev = content.revisions ? content.revisions[content.revisions.length - 1] : content;
          latestRev.status = 'rejected';
          finalContent = content;
      } else {
          finalContent = {...proposalData, status: 'rejected'};
      }

      utils.chat.getMessages.setData({ roomId }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          messages: old.messages.map((m: any) => 
            m.id === msgId ? { ...m, content: JSON.stringify(finalContent) } : m
          )
        };
      });

      if (!isCycle && proposalData?.proposalId) {
        updateProposalMutation.mutate({ id: proposalData.proposalId, status: 'rejected' }, {
          onSuccess: () => { utils.chat.getMessages.invalidate({ roomId }); }
        });
      }

      if (msgId) {
        await supabase.from('messages').update({ content: JSON.stringify(finalContent) }).eq('id', msgId);
        utils.chat.getMessages.invalidate({ roomId });
      }

      if (isCycle) {
         let myName = user?.user_metadata?.firstName || user?.metadata?.firstName || 'A user';
         if (profileQuery.data?.name) {
            try {
                const desc = JSON.parse(profileQuery.data?.university || "{}");
                myName = desc.username || profileQuery.data?.name || myName;
            } catch(e) {}
         }
         await sendMutation.mutateAsync({ roomId, content: JSON.stringify({ action: 'reject', userName: myName, customMsg: replyMsg }), type: 'cycle_action', senderId: user?.id });
         toast.success("Cycle rejected. Chat room will be dissolved.");
         setTimeout(() => {
           deleteChatMutation.mutate({ id: roomId });
         }, 1500);
      } else {
         handleSend("[REJECT] " + replyMsg, "text");
         toast.success("Offer rejected");
      }

      setRejectState({isOpen: false});
      setCustomRejectMsg("");
    } catch (e: any) {
      toast.error("Failed to reject offer: " + e.message);
    }
  };

  const [customRejectMsg, setCustomRejectMsg] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [reviewState, setReviewState] = useState<{isOpen: boolean; msgId?: number; cycleInfo?: any}>({isOpen: false});
  const [schedulerState, setSchedulerState] = useState<{isOpen: boolean; cycleInfo?: any}>({isOpen: false});
  const [receiptState, setReceiptState] = useState<{isOpen: boolean; cycleInfo?: any}>({isOpen: false});
  const updateListingMutation = trpc.listings.update.useMutation();
  const deleteListingMutation = trpc.listings.delete.useMutation();
  const updateProposalMutation = trpc.proposals.update.useMutation();
  const updateMessageMutation = trpc.chat.updateMessage.useMutation();
  const sendProposalMutation = trpc.proposals.send.useMutation();
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [fullscreenReceipt, setFullscreenReceipt] = useState<any>(null);
  const [previewLeg, setPreviewLeg] = useState<any>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const roomsQuery = trpc.chat.myRooms.useQuery(undefined, { enabled: !!user });
  const singleRoomQuery = trpc.chat.getRoomById.useQuery({ roomId: parseInt(roomId as any) }, { enabled: !!user && !!roomId });
  
  let room = roomsQuery.data?.rooms?.find((r: any) => r.id?.toString() === roomId?.toString());
  if (!room && singleRoomQuery.data) {
     room = singleRoomQuery.data;
  }
  
  const partnerId = room?.isCycle ? null : (room?.user1Id?.toString() === user?.id?.toString() ? room?.user2Id : room?.user1Id);
  const profileQuery = trpc.profile.get.useQuery({ id: partnerId }, { enabled: !!partnerId && !room?.isCycle });
  const myProfileQuery = trpc.profile.me.useQuery(undefined, { enabled: !!user });
  
  let partnerName = room?.isCycle ? "Cycle Group" : (partnerId ? "User" : "Cycle Group");
  if (!room?.isCycle) {
    try {
       const desc = JSON.parse(profileQuery.data?.university || "{}");
       if (desc.username) partnerName = desc.username;
       else if (profileQuery.data?.name && profileQuery.data.name !== "SwapSoko User" && profileQuery.data.name !== "User") partnerName = profileQuery.data.name.split(" ").join("").toLowerCase();
    } catch(e) {}
    if (partnerId && partnerName !== "User" && partnerName !== "Loading...") partnerName = "@" + partnerName;
  }
  let partnerAvatar = profileQuery.data?.avatarUrl;
  try {
     const desc = JSON.parse(profileQuery.data?.university || "{}");
     if (desc.avatarUrl) partnerAvatar = desc.avatarUrl;
  } catch(e) {}
  let partnerFullName = "User";
  if (profileQuery.data?.name) {
     partnerFullName = profileQuery.data.name;
  }

  const messagesQuery = trpc.chat.getMessages.useQuery(
    { roomId },
    { refetchInterval: 3000 }
  );
  
  const markReadMutation = trpc.chat.markRead.useMutation();

  useEffect(() => {
    if (user?.id) {
      const msgs = messagesQuery.data?.messages || messagesQuery.data;
      const hasUnread = Array.isArray(msgs) && msgs.some((m: any) => !m.isRead && m.senderId !== user.id);
      if (hasUnread || !messagesQuery.data) {
        markReadMutation.mutate({ roomId, userId: user.id });
      }
    }
  }, [roomId, user?.id, messagesQuery.data]);

  const sendMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data: any) => {
      if (data) {
        utils.chat.getMessages.setData({ roomId }, (old: any) => {
          if (!old) return { messages: [data] };
          return { ...old, messages: [...old.messages, data] };
        });
      }
      setLocalMessages([]);
    },
  });

  const allMessages = messagesQuery.data?.messages || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }, 150);
    
    // Fallback second attempt to ensure it scrolls if images load
    const timer2 = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }, 500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [allMessages.length, localMessages.length, messagesQuery.isLoading, roomId]);

  const handleSend = (text?: string, type: "text" | "quick_reply" | "image" | "voice" = "text") => {
    const content = text || input.trim();
    if (!content) return;
    setInput("");
    setShowQuickReplies(false);

    // Optimistic update
    const optimistic = {
      id: Date.now(),
      roomId,
      senderId: user?.id,
      type,
      content,
      imageUrl: type === "image" ? content : undefined,
      isRead: false,
      createdAt: new Date(),
    };
    setLocalMessages(prev => [...prev, optimistic]);

    sendMutation.mutate({ roomId, content, type, senderId: user?.id });
  };

  const handleAcceptCycle = async (msgId: number, cycleInfo: any) => {
    try {
      let content = typeof cycleInfo === 'string' ? JSON.parse(cycleInfo) : cycleInfo;
      const localRevision = content.revisions ? content.revisions[content.revisions.length - 1] : content;
      if (!localRevision.cycle) {
          const baseCycle = { ...content };
          if (baseCycle.revisions) delete baseCycle.revisions;
          if (baseCycle.entered_chat) delete baseCycle.entered_chat;
          localRevision.cycle = baseCycle;
      }
      const revId = localRevision.id || 1;
      
      // Fetch latest from DB to prevent overwriting other users' acceptances
      const { data: msgData } = await supabase.from('messages').select('content').eq('id', msgId).single();
      let currentAccepted = localRevision.accepted_users || [];
      if (msgData?.content) {
          try {
              const parsed = typeof msgData.content === 'string' ? JSON.parse(msgData.content) : msgData.content;
              const dbRev = parsed.revisions ? parsed.revisions[parsed.revisions.length - 1] : parsed;
              if (dbRev && dbRev.accepted_users) {
                  currentAccepted = dbRev.accepted_users;
              }
          } catch(e) {}
      }
      if (!Array.isArray(currentAccepted)) currentAccepted = [];
      
      if (!currentAccepted.includes(user?.id)) {
          currentAccepted.push(user?.id);
      }
      
      const allAccepted = content.participants.every((p: string) => currentAccepted.includes(p));
      
      if (allAccepted) {
          localRevision.status = 'completed';
          localRevision.accepted_users = currentAccepted;
          
          await supabase.from('messages').update({ content: JSON.stringify(content) }).eq('id', msgId);
          
          const listingIds = localRevision.cycle.legs.map((l: any) => l.id);
          await supabase.from('listings').update({ status: 'finalized' }).in('id', listingIds);
          await sendMutation.mutateAsync({ roomId, content: "[RECEIPT]" + JSON.stringify({ type: 'cycle', message: 'Cycle accepted by all parties', cycle: localRevision.cycle, timestamp: Date.now() }), type: 'text', senderId: user?.id });
      } else {
          localRevision.accepted_users = currentAccepted;
          
          await supabase.from('messages').update({ content: JSON.stringify(content) }).eq('id', msgId);
          
          let myName = user?.user_metadata?.firstName || 'User';
          if (myProfileQuery.data?.name) {
             try {
                 const desc = JSON.parse(myProfileQuery.data.university || "{}");
                 myName = desc.username || myProfileQuery.data.name;
             } catch(e) {
                 myName = myProfileQuery.data.name;
             }
          }
          await sendMutation.mutateAsync({ roomId, content: JSON.stringify({ action: 'accept', userName: myName }), type: 'cycle_action', senderId: user?.id });
      }
      toast.success("Cycle accepted!");
      setReviewState({ isOpen: false });
      messagesQuery.refetch();
    } catch (e) {
      toast.error("Failed to accept cycle");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleSend(event.target.result as string, "image");
      }
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = audioBlob;
        setPreviewAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
        clearInterval(recordingTimerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
         setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone access denied or not supported");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);
    setPreviewAudioUrl(null);
    audioBlobRef.current = null;
    setRecordingTime(0);
  };

  const sendVoiceNote = async () => {
     if (!audioBlobRef.current || !user) return;
     const toastId = toast.loading("Uploading voice message...");
     try {
       const fileName = `${user.id}/${roomId}/${Date.now()}.webm`;
       const { error } = await supabase.storage.from('voice-notes').upload(fileName, audioBlobRef.current, { contentType: 'audio/webm' });
       if (error) throw error;
       
       const { data } = supabase.storage.from('voice-notes').getPublicUrl(fileName);
       handleSend(data.publicUrl, "voice");
       toast.success("Voice message sent!", { id: toastId });
       cancelRecording();
     } catch (err) {
       console.warn("Storage upload failed, falling back to data URL", err);
       const reader = new FileReader();
       reader.onloadend = () => {
         if (reader.result) {
            handleSend(reader.result as string, "voice");
            toast.success("Voice message sent!", { id: toastId });
            cancelRecording();
         }
       };
       reader.readAsDataURL(audioBlobRef.current);
     }
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    const toastId = toast.loading("Getting location...");
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const url = `https://maps.google.com/?q=${latitude},${longitude}`;
      handleSend(`📍 My Meetup Location:\n${url}`, "text");
      toast.success("Location shared!", { id: toastId });
      setShowQuickReplies(false);
    }, () => {
      toast.error("Failed to get location", { id: toastId });
    }, { enableHighAccuracy: true });
  };

  const deleteChatMutation = trpc.chat.delete.useMutation({
    onSuccess: () => {
      toast.success("Chat deleted");
      onBack();
    }
  });

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    if (action === "delete") {
      deleteChatMutation.mutate({ id: roomId });
    }
  };

  const handleConfirmReceipt = async (listingId: number) => {
    handleSend(`[RECEIVED]${listingId}`, "text");
    const partnerSent = displayMessages?.some((m: any) => String(m.senderId) !== String(user?.id) && m.content === `[RECEIVED]${listingId}`);
    if (partnerSent && room?.proposalId) {
        updateProposalMutation.mutate({ id: room.proposalId, status: 'completed' });
        toast.success("Swap marked as completed!");
    }
    
    const cycleInitMsg = allMessages?.find((m: any) => m.type === 'cycle_init');
    if (cycleInitMsg) {
       let cInfo = typeof cycleInitMsg.content === 'string' ? JSON.parse(cycleInitMsg.content) : cycleInitMsg.content;
       const localRevision = cInfo.revisions ? cInfo.revisions[cInfo.revisions.length - 1] : cInfo;
       
       const allReceipts = allMessages?.filter((m: any) => m.content.startsWith("[RECEIVED]")).map((m: any) => String(m.senderId)) || [];
       allReceipts.push(String(user?.id));
       const uniqueReceipts = new Set(allReceipts);
       
       if (uniqueReceipts.size >= cInfo.participants.length) {
          const listingIds = localRevision.cycle.legs.map((l: any) => l.id);
          await supabase.from('listings').update({ status: 'finalized' }).in('id', listingIds);

          toast.success("Cycle completed! All linked listings have been removed.");
       }
    }
  };

  const displayMessages = [...allMessages, ...localMessages.filter(
    lm => !allMessages.find((m: any) => m.content === lm.content && String(m.senderId) === String(lm.senderId))
  )];

  if (viewingProfile) {
    return (
      <div className="absolute inset-0 z-[9999] bg-white h-full overflow-y-auto w-full">
        <ProfilePage uid={viewingProfile} onBack={() => setViewingProfile(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[250] bg-[#F8FAFC] h-[100dvh]">
      {/* Header */}
      <div className="page-header px-4 py-3 flex items-center gap-3 z-50">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </button>
        <button onClick={() => { if (room?.user2Id === null) setShowMenu(true); else setViewingProfile(partnerId); }} className="flex items-center gap-2 flex-1 min-w-0 text-left">
          <div className="w-10 h-10 rounded-full gradient-green flex items-center justify-center overflow-hidden flex-shrink-0">
            {partnerAvatar ? (
              <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-bold">{partnerName[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <p className="font-bold text-slate-900 text-[15px] truncate">{partnerName}</p>
              {room?.user2Id !== null && profileQuery.data?.isStudentVerified && <GraduationCap className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />}
            </div>
            <p className="text-[11px] text-green-500 font-medium">{room?.user2Id === null ? `${(typeof room.metadata === 'string' ? JSON.parse(room.metadata || '{}') : (room.metadata || {})).participantIds?.length || room?.cycleData?.participants?.length || 0} Members` : 'Active now'}</p>
          </div>
        </button>
        <div className="flex items-center gap-2 relative">
          <button onClick={() => navigate('/verify')} className="p-2 bg-green-50 rounded-full hover:bg-green-100 transition-colors" title="In-Person Verification">
            <ShieldCheck className="w-5 h-5 text-green-600" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-1">
            <MoreVertical className="w-6 h-6 text-slate-900" />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px] z-50"
              >
                <button onClick={() => handleMenuAction("delete")} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 font-bold">Delete Chat</button>
                <button onClick={() => { setShowMenu(false); setIsReporting(true); }} className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 font-bold border-t border-gray-100">Report User</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
                      if (!imgs.length && previewLeg.receiveImage) imgs = [previewLeg.receiveImage];
                      const img = (imgs[0] && !imgs[0].startsWith('blob:')) ? imgs[0] : null;
                      return img ? (
                         <img src={img} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full bg-gray-50 flex items-center justify-center"><Image className="w-16 h-16 text-gray-300" /></div>
                      );
                   })()}
                   <button onClick={() => setPreviewLeg(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40"><X className="w-5 h-5" /></button>
                   <div className="absolute inset-x-0 bottom-0 pt-20 pb-4 px-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                      <h1 className="text-2xl font-black text-white leading-tight shadow-sm mb-1">{previewLeg.title || previewLeg.receiveTitle}</h1>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-white/90 font-bold">User: <PreviewUser uid={previewLeg.userId} /></p>
                      </div>
                   </div>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGroupInfo && (
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 z-[9999] bg-white h-full overflow-y-auto w-full">
             <div className="page-header px-4 py-3 flex items-center justify-between border-b border-gray-100 z-50 sticky top-0 bg-white/90 backdrop-blur-md">
               <div className="flex items-center gap-3">
                 <button onClick={() => setShowGroupInfo(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100"><ChevronLeft className="w-6 h-6" /></button>
                 <h2 className="font-bold text-slate-900 text-lg">Cycle Group Chat</h2>
               </div>
             </div>
             <div className="p-6 pb-20">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#22C55E] to-[#3B82F6] flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                   <Repeat2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-center text-slate-900 mb-8">Group Members</h2>
                <div className="flex flex-col gap-4 mb-8">
                   {room?.metadata && JSON.parse(room.metadata).participantIds?.map((pid: string) => (
                      <ParticipantRow key={pid} pid={pid} isYou={pid === user?.id} />
                   ))}
                </div>
                <button onClick={() => handleMenuAction("delete")} className="w-full bg-[#FEF2F2] text-red-600 font-bold py-4 rounded-2xl shadow-sm border border-red-100 hover:bg-red-50">
                   Leave Cycle Chat
                </button>
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {agreementState.isOpen && (
          <SwapAgreementModal 
            onClose={() => setAgreementState({isOpen: false})} 
            partnerName={partnerName}
            partnerAvatar={partnerAvatar}
            listingId={agreementState.listingId!}
            isReview={agreementState.isReview}
            initialData={agreementState.data}
            onSend={async (data) => {
               try {
                 if (agreementState.msgId && agreementState.data) {
                   utils.chat.getMessages.setData({ roomId }, (old: any) => {
                     if (!old) return old;
                     return {
                       ...old,
                       messages: old.messages.map((m: any) => 
                         m.id === agreementState.msgId 
                           ? { ...m, content: JSON.stringify({...agreementState.data, status: 'accepted'}) }
                           : m
                       )
                     };
                   });
                   if (agreementState.data.proposalId) {
                     updateProposalMutation.mutate({ id: agreementState.data.proposalId, status: 'accepted' }, {
                       onSuccess: () => { utils.chat.getMessages.invalidate({ roomId }); }
                     });
                   }
                   await supabase.from('messages').update({ content: JSON.stringify({...agreementState.data, status: 'accepted'}) }).eq('id', agreementState.msgId);
                   utils.chat.getMessages.invalidate({ roomId });
                 }
                 handleSend("[AGREEMENT]" + JSON.stringify(data), "text");
                 setAgreementState({isOpen: false});
               } catch (e: any) {
                 toast.error("Error sending agreement: " + e.message);
               }
            }}
            onFinalize={async (data) => {
               const partnerId = room.user1Id === user?.id ? room.user2Id : room.user1Id;
               await supabase.from('listings').update({ status: 'finalized' }).eq('id', agreementState.listingId);
               if (agreementState.msgId) {
                 await supabase.from('messages').update({ content: "[AGREEMENT_SIGNED]" + JSON.stringify(data) }).eq('id', agreementState.msgId);
               }
               // Mark as completed in proposals table
               await supabase.from('proposals').update({ status: 'completed' })
                 .or(`from_user_id.eq.${partnerId},to_user_id.eq.${partnerId}`)
                 .eq('listing_id', agreementState.listingId);
                 
               handleSend("[RECEIPT]" + JSON.stringify({...data, listingImage: agreementState.data?.listingImage, timestamp: Date.now(), partnerName}), "text");
            }}
          />
        )}
        
        {reviewState.isOpen && reviewState.cycleInfo && (
          <CycleReviewModal
            cycleInfo={reviewState.cycleInfo}
            currentUserId={user?.id || ''}
            onClose={() => setReviewState({ isOpen: false })}
            onAccept={() => handleAcceptCycle(reviewState.msgId!, reviewState.cycleInfo)}
          />
        )}

        {schedulerState.isOpen && schedulerState.cycleInfo && (
          <MeetingSchedulerModal
             cycleInfo={schedulerState.cycleInfo}
             onClose={() => setSchedulerState({ isOpen: false })}
             onSuggest={async (date, time, location) => {
                let myName = user?.user_metadata?.firstName || 'A user';
                if (myProfileQuery.data?.name) {
                   try {
                       const desc = JSON.parse(myProfileQuery.data.university || "{}");
                       myName = desc.username || myProfileQuery.data.name;
                   } catch(e) { myName = myProfileQuery.data.name; }
                }
                const meetingMsg = {
                   action: 'suggest_meeting',
                   userName: myName,
                   meeting: { date, time, location },
                   status: 'proposed'
                };
                await sendMutation.mutateAsync({ roomId, content: JSON.stringify(meetingMsg), type: 'cycle_action', senderId: user?.id });
                toast.success("Meeting suggested!");
             }}
          />
        )}

        {receiptState.isOpen && receiptState.cycleInfo && (
          <TradeCertificate
             cycleInfo={receiptState.cycleInfo}
             currentUserId={user?.id || ''}
             onClose={() => setReceiptState({ isOpen: false })}
          />
        )}
        {counterState.isOpen && (
          <CounterProposalModal 
            onClose={() => setCounterState({isOpen: false})}
            partnerName={partnerName}
            originalData={counterState.proposalData}
            onSend={async (data) => {
               try {
                 if (counterState.isCycle && counterState.rawContent && counterState.msgId) {
                     const content = JSON.parse(counterState.rawContent);
                     
                     const prevRevision = content.revisions ? content.revisions[content.revisions.length - 1] : content;
                     const newRevisionId = content.revisions ? content.revisions.length + 1 : 2;
                     
                     const baseCycle = prevRevision.cycle ? prevRevision.cycle : { ...content };
                     if (baseCycle.revisions) delete baseCycle.revisions;
                     if (baseCycle.entered_chat) delete baseCycle.entered_chat;
                     const newCycle = JSON.parse(JSON.stringify(baseCycle));
                     let topUpPayerId: string | undefined = undefined;
                     let topUpReceiverId: string | undefined = undefined;

                     if (data.cashTopUp !== undefined) {
                         const myLegIndex = newCycle.legs?.findIndex((l: any) => l.userId === user?.id);
                         if (myLegIndex !== -1 && myLegIndex !== undefined) {
                             // The person who should pay the cash top up is the one receiving my item (receiverLeg)
                             const receiverLegIndex = (myLegIndex - 1 + newCycle.legs.length) % newCycle.legs.length;
                             topUpPayerId = newCycle.legs[receiverLegIndex]?.userId;
                             topUpReceiverId = user?.id;
                             if (data.cashTopUp === 0) {
                                 delete newCycle.legs[receiverLegIndex].cashTopUp;
                             } else {
                                 newCycle.legs[receiverLegIndex].cashTopUp = data.cashTopUp;
                             }
                         } else {
                             if (data.cashTopUp === 0) {
                                 delete newCycle.cashTopUp;
                             } else {
                                 newCycle.cashTopUp = data.cashTopUp;
                             }
                         }
                     }
                   if (data.meetingLocation) newCycle.meetingLocation = data.meetingLocation;
                   if (data.meetingDate) newCycle.meetingDate = data.meetingDate;
                   if (data.meetingTime) newCycle.meetingTime = data.meetingTime;
                   
                   const newRevision = {
                       id: newRevisionId,
                       cycle: newCycle,
                       status: 'pending',
                       accepted_users: [user?.id],
                       created_by: user?.id,
                       changes: {
                           message: data.message,
                           cashTopUp: data.cashTopUp,
                           topUpPayerId,
                           topUpReceiverId,
                           meetingLocation: data.meetingLocation,
                           meetingDate: data.meetingDate,
                           meetingTime: data.meetingTime
                       }
                   };
                   
                   if (content.revisions) {
                       content.revisions.push(newRevision);
                   } else {

                        content.revisions = [{
                            id: 1,
                            cycle: baseCycle,
                            status: content.status || 'pending',
                            accepted_users: content.accepted_users || [],
                            created_by: content.participants ? content.participants[0] : 'system',
                            changes: null
                        }, newRevision];
                    }
                   
                   // Move the deck to the bottom by updating created_at
                   await supabase.from('messages').update({ content: JSON.stringify(content), created_at: new Date().toISOString() }).eq('id', counterState.msgId);

                   utils.chat.getMessages.setData({ roomId }, (old: any) => {
                       if (!old) return old;
                       return { ...old, messages: old.messages.map((m: any) => m.id === counterState.msgId ? { ...m, content: JSON.stringify(content) } : m) };
                   });
                   
                   let myName = user?.user_metadata?.firstName || user?.metadata?.firstName || 'A user';
                   if (profileQuery.data?.name) {
                      try {
                          const desc = JSON.parse(profileQuery.data?.university || "{}");
                          myName = desc.username || profileQuery.data?.name || myName;
                      } catch(e) {}
                   }
                   await sendMutation.mutateAsync({ roomId, content: JSON.stringify({ action: 'counter', userName: myName, changes: newRevision.changes }), type: 'cycle_action', senderId: user?.id });
                   
                   toast.success("Counter proposal sent!");
                   setCounterState({isOpen: false});
                   return;
               }

               if (counterState.proposalData && counterState.msgId) {
                 utils.chat.getMessages.setData({ roomId }, (old: any) => {
                   if (!old) return old;
                   return {
                     ...old,
                     messages: old.messages.map((m: any) => 
                       m.id === counterState.msgId 
                         ? { ...m, content: JSON.stringify({...counterState.proposalData, status: 'countered'}) }
                         : m
                     )
                   };
                 });
                 if (counterState.proposalData.proposalId) {
                    updateProposalMutation.mutate({ id: counterState.proposalData.proposalId, status: 'countered' }, {
                       onSuccess: () => { utils.chat.getMessages.invalidate({ roomId }); }
                    });
                 }
                 await supabase.from('messages').update({ content: JSON.stringify({...counterState.proposalData, status: 'countered'}) }).eq('id', counterState.msgId);
                 utils.chat.getMessages.invalidate({ roomId });
               }
               
               sendProposalMutation.mutate({
                 userId: user?.id,
                 toUserId: partnerId,
                 listingId: data.listingId,
                 wishId: data.wishId,
                 message: data.message,
                 offerItems: data.offerItems,
                 cashTopUp: data.cashTopUp
               });
               toast.success("Counter offer sent!");
               setCounterState({isOpen: false});
             } catch (err: any) {
               toast.error("Failed to send counter proposal: " + err.message);
             }
            }}
          />
        )}
        {rejectState.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setRejectState({isOpen: false})}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-900">Reject Offer</h3>
                <button onClick={() => { setRejectState({isOpen: false}); setCustomRejectMsg(""); }} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Choose a reply to send with your rejection:</p>
              
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  placeholder="Type a custom reply..." 
                  value={customRejectMsg}
                  onChange={e => setCustomRejectMsg(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500"
                />
                <button 
                  onClick={() => {
                    if (customRejectMsg.trim()) handleRejectSubmit(customRejectMsg);
                  }}
                  disabled={!customRejectMsg.trim()}
                  className="bg-green-500 text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50"
                >
                  Send
                </button>
              </div>

              <div className="flex flex-col gap-2 mb-2 max-h-[200px] overflow-y-auto pr-2 hide-scrollbar">
                {["shinda apo", "baki nayo", "kaa nayo", "unadhani nitakulamba", "haiwezi bosi", "i only have a wanadred bob in my pocket", "waah ngori"].map(reply => (
                  <button 
                    key={reply}
                    onClick={() => handleRejectSubmit(reply)}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    "{reply}"
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-4 py-4" onClick={() => setShowMenu(false)}>
        {messagesQuery.isLoading ? (
          <div className="flex flex-col gap-4 py-4 px-2">
            {[1, 2, 3].map((i) => (
              <div key={`sk-msg-${i}`} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                <div className={`max-w-[75%] rounded-2xl p-3 ${i % 2 === 0 ? 'bg-green-500/20 rounded-tr-[4px]' : 'bg-gray-100 rounded-tl-[4px]'}`}>
                  <div className={`h-4 ${i % 2 === 0 ? 'bg-green-500/30' : 'bg-gray-200'} rounded-full w-${i % 2 === 0 ? '32' : '48'} mb-2`}></div>
                  {i === 2 && <div className={`h-4 ${i % 2 === 0 ? 'bg-green-500/30' : 'bg-gray-200'} rounded-full w-24`}></div>}
                </div>
              </div>
            ))}
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          displayMessages.map((msg: any) => {
            if (msg.content?.startsWith("[RECEIVED]")) return null;
            return (
              <ChatBubble 
                key={msg.id} 
                msg={msg} 
                isOwn={String(msg.senderId) === String(user?.id)} 
                allMessages={displayMessages}
                currentUserId={user?.id}
                partnerFullName={partnerFullName}
                onConfirmReceipt={handleConfirmReceipt}
                onViewProfile={(uid) => setViewingProfile(uid)} 
                onImageClick={setFullscreenImage} 
                onOpenAgreement={(listingId, msgId, isReview, data) => setAgreementState({isOpen: true, listingId, isReview, data, msgId})}
                onPreviewClick={(leg) => setPreviewLeg(leg)}
                onAcceptCycle={(msgId, cycleInfo) => setReviewState({ isOpen: true, msgId, cycleInfo })}
                onScheduleMeeting={(cycleInfo) => setSchedulerState({ isOpen: true, cycleInfo })}
                onViewReceipt={(cycleInfo) => setReceiptState({ isOpen: true, cycleInfo })}
                onRejectProposal={async (pData, msgId, rawContent) => {
                  if (pData.legs) {
                    setRejectState({ isOpen: true, proposalData: pData, msgId, isCycle: true, rawContent });
                  } else {
                    setRejectState({ isOpen: true, proposalData: pData, msgId });
                  }
                }}
              onCounterProposal={async (pData, msgId, rawContent) => {
                if (pData.legs) {
                  setCounterState({ isOpen: true, proposalData: pData, msgId, isCycle: true, rawContent });
                } else {
                  setCounterState({ isOpen: true, proposalData: pData, msgId });
                }
              }}
              onReceiptClick={setFullscreenReceipt}
            />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenImage(null)}
            className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          >
            <img src={fullscreenImage} className="max-w-full max-h-full object-contain" />
          </motion.div>
        )}
        {fullscreenReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenReceipt(null)}
            className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4 cursor-pointer backdrop-blur-sm"
          >
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#22C55E] to-[#3B82F6] p-6 text-center">
                <CheckCircle className="w-12 h-12 text-white mx-auto mb-2 opacity-90" />
                <h3 className="font-black text-white tracking-widest uppercase text-sm">Transaction Receipt</h3>
              </div>
              <div className="p-8 bg-[#FAFAFA] relative">
                <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100"></div>
                <div className="absolute -top-4 right-6 w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100"></div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200 border-dashed">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</span>
                     <div className="text-right">
                       <p className="text-sm font-black text-slate-900">{new Date(fullscreenReceipt.timestamp).toLocaleDateString()}</p>
                       <p className="text-xs font-bold text-gray-400">{new Date(fullscreenReceipt.timestamp).toLocaleTimeString()}</p>
                     </div>
                  </div>
                  
                  {fullscreenReceipt.type === 'cycle' ? (
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 border-dashed">
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cycle Action</span>
                       <span className="text-sm font-black text-slate-900">Accepted</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 border-dashed">
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Partner</span>
                       <span className="text-sm font-black text-slate-900">{partnerFullName || fullscreenReceipt.partnerName}</span>
                    </div>
                  )}
                  
                  <div className="pb-4 border-b border-gray-200 border-dashed">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Items Included</span>
                     {fullscreenReceipt.type !== 'cycle' && fullscreenReceipt.listingImage && (
                        <div className="mb-3 w-full h-32 rounded-xl overflow-hidden border border-gray-100">
                           <img src={fullscreenReceipt.listingImage} className="w-full h-full object-cover" />
                        </div>
                     )}
                     {fullscreenReceipt.type === 'cycle' && fullscreenReceipt.cycle?.legs ? (
                        <div className="flex flex-col gap-2 mt-2">
                           {fullscreenReceipt.cycle.legs.map((leg: any, i: number) => {
                              const nextLeg = fullscreenReceipt.cycle.legs[(i + 1) % fullscreenReceipt.cycle.legs.length];
                              const cash = leg.cashTopUp || (fullscreenReceipt.cycle.cashTopUp > 0 && fullscreenReceipt.cycle.topUpSenderId === leg.id ? fullscreenReceipt.cycle.cashTopUp : 0);
                              return (
                                 <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                   <div className="flex flex-col flex-1 min-w-0 pr-2">
                                      <span className="text-xs font-bold text-gray-800 truncate"><PreviewUser uid={leg.userId} /></span>
                                      <span className="text-xs text-gray-500 font-medium truncate mt-0.5">gives: {leg.title || leg.receiveTitle}</span>
                                   </div>
                                   <div className="mx-2 text-gray-300 shrink-0">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                   </div>
                                   <div className="flex flex-col items-end flex-1 min-w-0 pl-2 text-right">
                                      <span className="text-xs font-bold text-gray-800 truncate"><PreviewUser uid={nextLeg.userId} /></span>
                                      {cash > 0 && (
                                         <span className="text-xs font-bold text-red-500 truncate mt-0.5">- KES {cash}</span>
                                      )}
                                   </div>
                                 </div>
                              );
                           })}
                        </div>
                     ) : (
                        <>
                           <p className="text-sm font-bold text-gray-800 leading-snug">{fullscreenReceipt.itemsExchanged}</p>
                           {fullscreenReceipt.cashTopUp && <p className="text-xs font-bold text-green-500 mt-1">+ KES {fullscreenReceipt.cashTopUp}</p>}
                        </>
                     )}
                  </div>
                  {fullscreenReceipt.type !== 'cycle' && (
                  <div className="mt-4">
                     <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                        <span className="text-blue-500 text-lg mt-0.5">💡</span>
                        <div>
                           <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest mb-1">Safety Tip</p>
                           <p className="text-sm font-medium text-blue-800 leading-relaxed">
                              {getStableTip(fullscreenReceipt?.id || "modal")}
                           </p>
                        </div>
                     </div>
                  </div>
                  )}
                  
                  {(fullscreenReceipt.meetupPlace || fullscreenReceipt.timeWindow) && (
                    <div className="pb-4 border-b border-gray-200 border-dashed">
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Meetup Details</span>
                       <p className="flex justify-between text-sm mb-1"><span className="font-bold text-gray-600">Location:</span> <span className="font-bold text-slate-900">{fullscreenReceipt.meetupPlace}</span></p>
                       <p className="flex justify-between text-sm"><span className="font-bold text-gray-600">Time:</span> <span className="font-bold text-slate-900">{fullscreenReceipt.timeWindow}</span></p>
                    </div>
                  )}
                  
                  {fullscreenReceipt.conditionNotes && (
                    <p className="text-xs font-medium italic text-gray-400 pt-2">Notes: {fullscreenReceipt.conditionNotes}</p>
                  )}
                </div>
                
                <div className="mt-6 pt-4 flex flex-col items-center justify-center opacity-40">
                   <div className="w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgNCAyMCI+PHJlY3Qgd2lkdGg9IjIiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] bg-repeat-x mb-2"></div>
                   <p className="text-xs font-black tracking-[0.2em] text-gray-400 mt-2">SWAPSOKO VERIFIED</p>
                </div>
              </div>
              <button onClick={() => setFullscreenReceipt(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/20"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick replies & Attachments */}
      <AnimatePresence>
        {showQuickReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-4 bg-white border-t border-gray-100"
          >
            <div className="flex gap-6 mb-4 pb-4 border-b border-gray-50 overflow-x-auto scrollbar-hide">
              <button onClick={() => { fileInputRef.current?.click(); setShowQuickReplies(false); }} className="flex flex-col items-center flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                  <Image className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1.5 font-medium text-gray-500">Photo</span>
              </button>
              <button onClick={shareLocation} className="flex flex-col items-center flex-shrink-0">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1.5 font-medium text-gray-500">Location</span>
              </button>
            </div>
            
            <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Quick Replies</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend(reply, "quick_reply")}
                  className="px-3 py-1.5 rounded-full border border-green-500 text-green-500 text-xs font-medium"
                >
                  {reply}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageUpload} />

      {/* Input */}
      {!isPreview && (
      <div className="pb-4 px-4 bg-transparent mt-2 shrink-0 relative z-[60]">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.1)] rounded-3xl p-2 flex items-center gap-2">
          {previewAudioUrl ? (
            <>
              <button onClick={cancelRecording} className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <X className="w-5 h-5 text-red-500" />
              </button>
              <div className="flex-1 bg-[#F8FAFC]/50 rounded-2xl px-3 py-1 border border-gray-100/50 overflow-hidden">
                 <VoicePlayer url={previewAudioUrl} />
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={sendVoiceNote}
                className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all bg-green-500 shadow-[#22C55E]/30 shadow-md"
              >
                <Send className="w-4 h-4 ml-0.5 text-white" />
              </motion.button>
            </>
          ) : isRecording ? (
            <>
               <div className="flex-1 flex items-center gap-3 px-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-red-500 font-bold text-sm">
                   {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                 </span>
                 <span className="text-gray-400 text-xs ml-auto flex items-center gap-1 font-medium">
                   ← Cancel
                 </span>
               </div>
               <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={cancelRecording}
                  className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all bg-gray-100"
               >
                 <X className="w-5 h-5 text-gray-500" />
               </motion.button>
               <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={stopRecording}
                  className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all bg-green-500"
               >
                 <Check className="w-5 h-5 text-white" />
               </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowQuickReplies(v => !v)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors"
              >
                {showQuickReplies ? <X className="w-5 h-5 text-gray-500" /> : <Plus className="w-5 h-5 text-gray-500" />}
              </motion.button>
              {mentionState.active && room?.cycleData?.participants && (
                <div className="absolute bottom-[80px] left-4 bg-white border border-gray-100 shadow-xl rounded-xl p-2 w-48 z-50">
                  <p className="text-xs font-bold text-gray-400 px-2 py-1 uppercase tracking-widest">Mention</p>
                  {room.cycleData.participants.map((pid: string) => (
                     <MentionOption key={pid} pid={pid} input={input} setInput={setInput} setMentionState={setMentionState} query={mentionState.query} />
                  ))}
                </div>
              )}
              <div className="flex-1 flex items-center bg-[#F8FAFC]/50 rounded-2xl px-4 py-2.5 border border-gray-100/50">
                <input
                  value={input}
                  onChange={e => {
                    const val = e.target.value;
                    setInput(val);
                    const lastWord = val.split(' ').pop();
                    if (lastWord && lastWord.startsWith('@')) {
                      setMentionState({ active: true, query: lastWord.slice(1).toLowerCase() });
                    } else {
                      setMentionState({ active: false, query: "" });
                    }
                  }}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-slate-900 placeholder-gray-400 outline-none w-full"
                />
              </div>
              {input.trim() ? (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleSend()}
                  className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all bg-green-500 shadow-[#22C55E]/30 shadow-md"
                >
                  <Send className="w-4 h-4 ml-0.5 text-white" />
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={startRecording}
                  className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all bg-green-500/10"
                >
                  <Mic className="w-5 h-5 text-green-500" />
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
      )}
      <ReportModal isOpen={isReporting} onClose={() => setIsReporting(false)} targetType="message" targetId={roomId.toString()} />
    </div>
  );
}

function ChatRoomItem({ room, user, onSelectRoom }: { room: any; user: any; onSelectRoom: (id: number) => void }) {
  const partnerId = room.user1Id === user?.id ? room.user2Id : room.user1Id;
  const profileQuery = trpc.profile.get.useQuery({ id: partnerId }, { enabled: !!partnerId && !room.isCycle });
  
  let partnerName = room.isCycle ? "Cycle Group Swap" : "User";
  let partnerAvatar = null;

  if (!room.isCycle) {
    try {
      const desc = JSON.parse(profileQuery.data?.university || "{}");
      if (desc.username) partnerName = desc.username;
      else if (profileQuery.data?.name && profileQuery.data.name !== "SwapSoko User" && profileQuery.data.name !== "User") partnerName = profileQuery.data.name.split(" ").join("").toLowerCase();
    } catch(e) {}
    if (partnerName !== "User") partnerName = "@" + partnerName;
    partnerAvatar = profileQuery.data?.avatarUrl;
    try {
       const desc = JSON.parse(profileQuery.data?.university || "{}");
       if (desc.avatarUrl) partnerAvatar = desc.avatarUrl;
    } catch(e) {}
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelectRoom(room.id)}
      className="w-[calc(100%-2rem)] mx-auto flex items-center gap-3 px-4 py-3.5 bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl mb-3 shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full gradient-green flex items-center justify-center overflow-hidden">
          {room.isCycle ? (
            <Repeat2 className="w-6 h-6 text-white" />
          ) : partnerAvatar ? (
            <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold">{partnerName[0]?.toUpperCase()}</span>
          )}
        </div>
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 pr-2">
            <p className="font-bold text-slate-900 text-sm truncate">{partnerName}</p>
            {!room.isCycle && profileQuery.data?.isStudentVerified && <GraduationCap className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0" />}
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatDistanceToNow(new Date(room.lastMessageAt || Date.now()), { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">Tap to open conversation</p>
      </div>
    </motion.button>
  );
}

// ─── Swap Agreement Modal ───────────────────────────────────────────────────────
function SwapAgreementModal({ onClose, partnerName, partnerAvatar, listingId, isReview, initialData, onSend, onFinalize }: { onClose: () => void; partnerName: string; partnerAvatar?: string; listingId: number; isReview?: boolean; initialData?: any; onSend: (data: any) => void; onFinalize: (data: any) => void; }) {
  const listingQuery = trpc.listings.get.useQuery({ id: listingId }, { enabled: !!listingId });
  const autoItemsExchanged = listingQuery.data?.title || initialData?.itemsExchanged || "Agreed Items";
  const [itemsExchanged, setItemsExchanged] = useState(initialData?.itemsExchanged || "");
  const [cashTopUp, setCashTopUp] = useState(initialData?.cashTopUp || "");
  const [meetupPlace, setMeetupPlace] = useState(initialData?.meetupPlace || "");
  const [timeWindow, setTimeWindow] = useState(initialData?.timeWindow || "");
  const [conditionNotes, setConditionNotes] = useState(initialData?.conditionNotes || "");
  const [accepted, setAccepted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-[480px] mx-auto rounded-t-[36px] p-6 pb-28 max-h-[85vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
            <Handshake className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">Swap Agreement</h3>
        </div>
        <p className="text-gray-500 text-sm font-medium mb-6">Lock in terms with <span className="font-bold text-slate-900">{partnerName.startsWith('@') ? partnerName : '@' + partnerName}</span> before meeting.</p>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Item in Transaction</label>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                  {listingQuery.data?.images ? (
                     <img src={(typeof listingQuery.data.images === 'string' ? JSON.parse(listingQuery.data.images || '[]') : listingQuery.data.images)[0]} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400"><Image className="w-6 h-6" /></div>
                  )}
               </div>
               <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{listingQuery.data?.title || autoItemsExchanged}</h4>
                  <div className="flex items-center gap-1">
                     <span className="bg-green-500/10 text-green-500 text-xs font-black uppercase tracking-wider pl-1 pr-2 py-0.5 rounded-full flex items-center gap-1">
        {partnerAvatar ? <img src={partnerAvatar} className="w-3.5 h-3.5 rounded-full object-cover" /> : <div className="w-3.5 h-3.5 rounded-full bg-green-500 text-white flex items-center justify-center text-[8px]">{partnerName.replace('@', '').charAt(0).toUpperCase()}</div>}
        {partnerName.startsWith('@') ? partnerName : '@' + partnerName}
    </span>
                  </div>
               </div>
            </div>
            
          <div>
             <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Full Agreement Details</label>
             <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[14px] font-semibold text-slate-900">
                {initialData?.itemsExchanged || (initialData?.offerItems ? `${initialData.offerItems} for ${listingQuery.data?.title || autoItemsExchanged}` : autoItemsExchanged)}
             </div>
          </div>

          </div>
          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Cash Difference (KES)</label>
            <input
              value={cashTopUp}
              onChange={e => setCashTopUp(e.target.value)}
              placeholder="e.g. 0 or 500 via M-Pesa"
              className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-[14px] font-semibold text-slate-900 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-[#22C55E]/10 transition-all placeholder:font-medium placeholder:text-gray-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Meetup Place</label>
              <input
                value={meetupPlace}
                onChange={e => setMeetupPlace(e.target.value)}
                placeholder="e.g. JKUAT Gate A"
                className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-[14px] font-semibold text-slate-900 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-[#22C55E]/10 transition-all placeholder:font-medium placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Time Window</label>
              <input
                value={timeWindow}
                onChange={e => setTimeWindow(e.target.value)}
                placeholder="e.g. Tomorrow 2PM-3PM"
                className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-[14px] font-semibold text-slate-900 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-[#22C55E]/10 transition-all placeholder:font-medium placeholder:text-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Condition Notes</label>
            <input
              value={conditionNotes}
              onChange={e => setConditionNotes(e.target.value)}
              placeholder="e.g. Minor scratch on screen, fully functional"
              className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-[14px] font-semibold text-slate-900 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-[#22C55E]/10 transition-all placeholder:font-medium placeholder:text-gray-400"
            />
          </div>
          
          {isReview && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={accepted} 
                  onChange={e => setAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded-[6px] focus:ring-[#22C55E]"
                />
                <span className="text-sm text-orange-900 leading-snug font-bold">
                  I have checked these terms and agree to proceed. I understand this serves as our final agreement before the swap.
                </span>
              </label>
            </div>
          )}
        </div>

        {isReview ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!accepted) { toast.error("Please agree to the terms"); return; }
              onFinalize({ itemsExchanged, cashTopUp, meetupPlace, timeWindow, conditionNotes, listingId });
              toast.success("Swap Agreement signed & finalized!");
              onClose();
            }}
            className={`w-full mt-6 font-extrabold py-4 rounded-2xl text-[15px] transition-colors shadow-sm ${accepted ? "gradient-green text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] hover:scale-[1.02]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            Sign & Finalize Swap
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!isReview) {
                  let finalItems = itemsExchanged.trim();
                  if (!finalItems) finalItems = initialData?.offerItems ? `${initialData.offerItems} for ${listingQuery.data?.title || autoItemsExchanged}` : autoItemsExchanged;
                  onSend({ itemsExchanged: finalItems, cashTopUp, meetupPlace, timeWindow, conditionNotes, listingId });
                  toast.success("Agreement sent for review!");
                  onClose();
                  return;
              }
              onSend({ itemsExchanged, cashTopUp, meetupPlace, timeWindow, conditionNotes, listingId });
              toast.success("Agreement sent for review!");
              onClose();
            }}
            className="w-full mt-6 font-extrabold py-4 rounded-2xl text-[15px] transition-colors gradient-green text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] hover:scale-[1.02]"
          >
            Send Agreement Form
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}


function CounterProposalModal({ onClose, partnerName, originalData, onSend }: { onClose: () => void; partnerName: string; originalData: any; onSend: (data: any) => void; }) {
  const { user } = useAuth();
  const isCycle = !!originalData?.legs;
  let cyclePartnerId = "";
  let initialCashTopUp = "";

  if (isCycle && user) {
      const myIndex = originalData.legs.findIndex((l: any) => l.userId === user.id);
      if (myIndex !== -1) {
          const prevLeg = originalData.legs[(myIndex - 1 + originalData.legs.length) % originalData.legs.length];
          cyclePartnerId = prevLeg.userId;
          initialCashTopUp = prevLeg.cashTopUp?.toString() || "";
      }
  } else {
      initialCashTopUp = originalData?.cashTopUp?.toString() || "";
  }

  const [message, setMessage] = useState("");
  const [offeredItems, setOfferedItems] = useState(originalData?.offerItems || "");
  const [cashTopUp, setCashTopUp] = useState(initialCashTopUp);
  const [meetingLocation, setMeetingLocation] = useState(originalData?.meetingLocation || "");
  const [meetingDate, setMeetingDate] = useState(originalData?.meetingDate || "");
  const [meetingTime, setMeetingTime] = useState(originalData?.meetingTime || "");

  const [safetyTip] = useState(getStableTip(originalData?.messageId ? String(originalData.messageId) : "proposal"));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-[480px] mx-auto rounded-t-[36px] p-6 pb-28 max-h-[85vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">Counter Offer</h3>
        </div>
        <p className="text-gray-500 text-sm font-medium mb-6">Propose new terms to <span className="font-bold text-slate-900">{isCycle && cyclePartnerId ? <PreviewUser uid={cyclePartnerId} /> : `@${partnerName}`}</span>.</p>
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="e.g. I can accept if you add KES 500"
              rows={2}
              className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-[14px] font-semibold text-slate-900 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-[#22C55E]/10 transition-all resize-none placeholder:font-medium placeholder:text-gray-400"
            />
          </div>
          {!isCycle && (
            <div>
              <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Offered Items</label>
              <input
                type="text"
                value={offeredItems}
                onChange={e => setOfferedItems(e.target.value)}
                placeholder="e.g. My iPhone 12 + 2 Games"
                className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-[14px] font-semibold text-slate-900 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-[#22C55E]/10 transition-all placeholder:font-medium placeholder:text-gray-400"
              />
            </div>
          )}
          <div>
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Cash Top-up (KES)</label>
            <input
              type="number"
              value={cashTopUp}
              onChange={e => setCashTopUp(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-[14px] font-semibold text-slate-900 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-[#22C55E]/10 transition-all placeholder:font-medium placeholder:text-gray-400"
            />
          </div>
          
          <div className="pt-4 border-t border-gray-100">
             {isCycle && (
               <>
                 <h4 className="font-bold text-gray-900 text-sm mb-3">Meeting Arrangements <span className="text-gray-400 font-medium text-xs ml-1">(Optional)</span></h4>
             <div className="grid grid-cols-2 gap-3 mb-3">
               <div>
                 <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Date</label>
                 <input
                   type="date"
                   value={meetingDate}
                   onChange={e => setMeetingDate(e.target.value)}
                   className="w-full bg-gray-50 border border-transparent rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                 />
               </div>
               <div>
                 <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Time</label>
                 <input
                   type="time"
                   value={meetingTime}
                   onChange={e => setMeetingTime(e.target.value)}
                   className="w-full bg-gray-50 border border-transparent rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                 />
               </div>
             </div>
             <div>
               <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Location</label>
               <input
                 type="text"
                 value={meetingLocation}
                 onChange={e => setMeetingLocation(e.target.value)}
                 placeholder="Type specific location..."
                 className="w-full bg-gray-50 border border-transparent rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:font-medium placeholder:text-gray-400"
               />
             </div>
             <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3 items-start">
               <span className="text-blue-500 text-lg mt-0.5">💡</span>
               <div>
                  <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-0.5">Safety Tip</p>
                  <p className="text-[11px] font-medium text-blue-800 leading-relaxed">{safetyTip}</p>
               </div>
             </div>
               </>
             )}
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            const hasChanges = (cashTopUp !== initialCashTopUp) || !!message || offeredItems !== (originalData?.offerItems || "") || meetingLocation !== (originalData?.meetingLocation || "") || meetingDate !== (originalData?.meetingDate || "") || meetingTime !== (originalData?.meetingTime || "");
            if (!hasChanges) { toast.error("Please change some terms to send a counter offer"); return; }
            
            const parsedCash = parseInt(cashTopUp);
            onSend({ 
               message, 
               offerItems: offeredItems,
               cashTopUp: isNaN(parsedCash) ? 0 : parsedCash, 
               listingId: originalData.listingId, 
               wishId: originalData.wishId,
               meetingLocation,
               meetingDate,
               meetingTime
            });
            onClose();
          }}
          className="w-full mt-6 font-extrabold py-4 rounded-2xl text-[15px] transition-colors gradient-green text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] hover:scale-[1.02]"
        >
          Send Counter Offer
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Chat List View ───────────────────────────────────────────────────────────
function ChatList({ onSelectRoom }: { onSelectRoom: (id: number) => void }) {
    const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  const roomsQuery = trpc.chat.myRooms.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-[#F8FAFC]">
        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-[0_12px_30px_rgba(34,197,94,0.2)] border-[3px] border-white bg-white mb-6">
          <img src="/logo.jpg" alt="SwapSoko" className="w-full h-full object-cover" />
        </div>
        <h2 className="font-extrabold text-slate-900 text-2xl mb-2 tracking-tight">Access Messages</h2>
        <p className="text-gray-500 text-[15px] max-w-[260px] leading-relaxed mb-8 font-medium">Sign in to view your chats and connect with other swappers.</p>
        <motion.button
          onClick={() => window.location.href = getLoginUrl()}
          whileTap={{ scale: 0.95 }}
          className="bg-slate-900 text-white font-bold py-3.5 px-10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:bg-[#1E293B] transition-all"
        >
          Sign In to Continue
        </motion.button>
      </div>
    );
  }

  const rooms = roomsQuery.data?.rooms || [];

  return (
    <div className="flex flex-col h-screen pb-20">
      <div className="page-header px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-slate-900 text-lg">{"Chat"}</h1>
        </div>
      </div>

      {roomsQuery.isLoading ? (
        <div className="px-4 py-2 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={`sk-room-${i}`} className="w-full flex items-center gap-3 px-4 py-3.5 bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="w-24 h-4 bg-gray-200 rounded-full"></div>
                  <div className="w-12 h-3 bg-gray-200 rounded-full"></div>
                </div>
                <div className="w-3/4 h-3 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-slate-900 text-lg">No conversations yet</h3>
          <p className="text-gray-400 text-sm mt-1">Make an offer on an item to start a chat!</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="mt-6 border-2 border-gray-100 text-slate-900 font-bold px-6 py-2.5 rounded-3xl text-sm"
          >
            Explore Listings
          </motion.button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pt-2">
          {rooms.map((room: any) => (
            <ChatRoomItem key={room.id} room={room} user={user} onSelectRoom={onSelectRoom} />
          ))}
        </div>
      )}
    </div>
  );
}
// ─── Main Chat Page ───────────────────────────────────────────────────────────
const SAFETY_TIPS = [
  "Meet in a well-lit, public place like a coffee shop or mall.",
  "Consider meeting near a police station for high-value swaps.",
  "Bring a friend along if possible.",
  "Inspect the item thoroughly before completing the swap.",
  "Never meet in secluded or private areas.",
  "Verify the condition of the item matches the description.",
  "Trust your instincts; if something feels off, cancel the meetup.",
  "Check the user's profile and reviews before swapping.",
  "Don't share personal financial information or passwords.",
  "Take a screenshot of the agreement for your records.",
  "Ensure your phone is fully charged before meeting.",
  "Let someone know where you are going and who you are meeting.",
  "If the item is electronic, test it before accepting the swap.",
  "Don't carry large amounts of cash unless necessary for a top-up.",
  "Avoid swapping at your home or workplace if possible.",
  "Keep conversations within the platform for a record of the agreement.",
  "Beware of users asking to communicate outside the app immediately.",
  "Check for genuine photos rather than stock images.",
  "Ask for additional photos if you are unsure about the item's condition.",
  "Confirm the meeting time and place before leaving.",
  "If the other party changes the meeting location at the last minute, be cautious.",
  "Do not feel pressured to complete the swap if you are unsatisfied.",
  "Double-check the items included in the swap before handing yours over.",
  "Report any suspicious behavior to the platform administrators.",
  "For phones, verify the IMEI number is not blacklisted.",
  "For laptops, check the battery health and screen for dead pixels.",
  "Ensure all accessories promised are included.",
  "If paying a cash top-up, count the money before handing it over.",
  "Be wary of offers that seem too good to be true.",
  "Take your time inspecting; don't let the other party rush you.",
  "If swapping vehicles, verify the logbook and chassis number.",
  "For designer items, ask for a receipt or certificate of authenticity.",
  "If swapping tickets, verify their validity with the issuer.",
  "Do not transfer money via mobile money before meeting in person.",
  "Beware of users claiming they are out of town and want to use a courier.",
  "A genuine swapper will not mind you taking time to test the item.",
  "If the location feels unsafe upon arrival, leave immediately.",
  "Keep the items in your possession until both parties are satisfied.",
  "If swapping accounts or digital goods, change passwords immediately.",
  "Remember that all swaps are final once completed.",
  "Be polite but firm about your requirements.",
  "If the item has defects not mentioned, you have the right to renegotiate or cancel.",
  "Check serial numbers against the original box if provided.",
  "If swapping appliances, ask to plug them in to test.",
  "Ensure any activation locks (like iCloud) are removed before swapping.",
  "Wipe all personal data from your devices before swapping them.",
  "Bring a power bank to test electronics if meeting outdoors.",
  "If swapping clothing, check for stains or tears not mentioned.",
  "Confirm the size of items like shoes or clothes before meeting.",
  "Stay in public view during the entire transaction."
];

export default function ChatPage() {
  const params = useParams<{ id?: string }>();
  const [activeRoomId, setActiveRoomId] = useState<number | null>(
    params.id ? parseInt(params.id) : null
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8FAFC]"
    >
      <AnimatePresence>
        {activeRoomId ? (
          <motion.div
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
          >
            <ChatRoom roomId={activeRoomId} onBack={() => setActiveRoomId(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
          >
            <ChatList onSelectRoom={setActiveRoomId} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const MentionOption = ({ pid, input, setInput, setMentionState, query }: any) => {
   const profileQuery = trpc.profile.get.useQuery({ id: pid }, { enabled: !!pid });
   
   if (profileQuery.isLoading) {
       return <div className="px-2 py-1.5 animate-pulse bg-gray-50 h-8 rounded-lg mb-1"></div>;
   }
   
   let name = "user_" + String(pid).slice(0, 4);
   if (profileQuery.data) {
       if (profileQuery.data.name) {
           name = profileQuery.data.name.split(" ").join("").toLowerCase();
       }
       if (profileQuery.data.university) {
           try {
               const md = JSON.parse(profileQuery.data.university);
               if (md.username) name = md.username.split(" ").join("").toLowerCase();
           } catch(e) {}
       }
   }
   
   if (query && !name.toLowerCase().includes(query.toLowerCase())) {
       return null;
   }
   
   return (
       <div onClick={() => {
           const words = input.split(' ');
           words.pop(); // remove the @query part
           setInput(words.join(' ') + (words.length > 0 ? ' ' : '') + '@' + name + ' ');
           setMentionState({ active: false, query: '' });
       }} className="px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center gap-2">
           <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold overflow-hidden">
               {profileQuery.data?.avatarUrl ? <img src={profileQuery.data.avatarUrl} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
           </div>
           <span className="text-sm font-medium text-gray-700">@{name}</span>
       </div>
   );
};
