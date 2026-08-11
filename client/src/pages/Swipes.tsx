import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import { Sparkles, MapPin, Navigation, Compass, ChevronLeft, Search, Filter, MessageCircle, RefreshCw, Layers, Zap, Info, Shield, Plus, Heart, X, CheckCircle, Star, Clock, Gift, Flame, Tag, Repeat2, GraduationCap } from "lucide-react";
import { FilterSheet } from "@/components/FilterSheet";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";


// ─── Propose Swap Modal ───────────────────────────────────────────────────────
export function ProposeSwapModal({ listing, onClose, onSend }: { listing: any; onClose: () => void; onSend: (msg: string, cash: number, options?: any) => void }) {
    const [message, setMessage] = useState("");
  const [cashTopUp, setCashTopUp] = useState(0);
  const [offerItems, setOfferItems] = useState("");
  const [mpesaEnabled, setMpesaEnabled] = useState(false);
  let isDonation = false;
  if (Array.isArray(listing?.wantItems)) {
    isDonation = listing.wantItems.some((w: any) => typeof w === 'string' && w.includes("FREE / DONATION"));
  } else if (typeof listing?.wantItems === 'string') {
    isDonation = listing.wantItems.includes("FREE / DONATION");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-end justify-center"
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
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        <h3 className="font-extrabold text-[#0F172A] text-2xl tracking-tight">{isDonation ? "Claim Donation" : "Propose Swap"}</h3>
        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
          <Repeat2 className="w-4 h-4 text-[#22C55E]" />
          For: <span className="font-semibold text-[#0F172A] truncate max-w-[200px]">{listing.title}</span>
        </p>

        <div className="mt-6 space-y-4">
          {!isDonation && (
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">What you're offering</label>
              <input
                value={offerItems}
                onChange={e => setOfferItems(e.target.value)}
                placeholder="e.g. iPhone 11, Laptop..."
                className="w-full mt-1.5 bg-gray-50 border border-transparent rounded-[16px] px-4 py-3.5 text-[15px] outline-none focus:border-[#22C55E] focus:bg-white focus:ring-4 focus:ring-[#22C55E]/10 transition-all font-medium text-[#0F172A] placeholder:text-gray-400"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Message (optional)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={isDonation ? "Introduce yourself and why you'd like this..." : "Add a friendly note to your proposal..."}
              rows={2}
              className="w-full mt-1.5 bg-gray-50 border border-transparent rounded-[16px] px-4 py-3.5 text-[15px] outline-none focus:border-[#22C55E] focus:bg-white focus:ring-4 focus:ring-[#22C55E]/10 transition-all resize-none font-medium text-[#0F172A] placeholder:text-gray-400"
            />
          </div>

          {!isDonation && (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[20px] p-4 transition-all hover:shadow-md hover:shadow-[#22C55E]/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#22C55E] rounded-[10px] flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-black">M</span>
                  </div>
                  <span className="text-[15px] font-bold text-[#166534]">M-Pesa Top-Up</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMpesaEnabled(!mpesaEnabled)}
                  className={`w-12 h-7 rounded-full transition-colors flex items-center shadow-inner ${mpesaEnabled ? "bg-[#22C55E]" : "bg-gray-300"}`}
                >
                  <motion.div
                    animate={{ x: mpesaEnabled ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </motion.button>
              </div>
              <AnimatePresence>
                {mpesaEnabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-[#BBF7D0]">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-[#166534]">Cash amount (KES)</label>
                        {listing?.cashTopUpAmount > 0 && (
                          <button 
                            onClick={() => setCashTopUp(listing.cashTopUpAmount)}
                            className="text-[10px] bg-white text-[#22C55E] px-2.5 py-1 rounded-full font-bold shadow-sm border border-[#22C55E]/20 hover:bg-[#22C55E] hover:text-white transition-colors"
                          >
                            Auto-fill: {listing.cashTopUpAmount}
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">KES</span>
                        <input
                          type="number"
                          value={cashTopUp || ''}
                          onChange={e => setCashTopUp(Number(e.target.value))}
                          placeholder={listing?.cashTopUpAmount > 0 ? `${listing.cashTopUpAmount}` : "0"}
                          className="w-full bg-white border border-[#BBF7D0] rounded-[16px] pl-12 pr-4 py-3.5 text-[16px] font-bold text-[#0F172A] outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/20 transition-all shadow-inner"
                        />
                      </div>
                      <p className="text-[11px] font-medium text-gray-500 mt-2 flex justify-between">
                        <span>Paid via M-Pesa at meetup</span>
                        {listing?.cashTopUpAmount > 0 && <span className="text-[#22C55E]">Target: ~KES {listing.cashTopUpAmount}</span>}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {listing.lat && listing.lng && (
            <div className="flex gap-3 pt-2">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`} target="_blank" rel="noreferrer" className="flex-1 py-3 text-xs font-bold text-center bg-blue-50/50 rounded-[16px] text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors">
                Google Maps
              </a>
              <a href={`https://waze.com/ul?ll=${listing.lat},${listing.lng}&navigate=yes`} target="_blank" rel="noreferrer" className="flex-1 py-3 text-xs font-bold text-center bg-cyan-50/50 rounded-[16px] text-cyan-600 border border-cyan-100 hover:bg-cyan-100 transition-colors">
                Waze
              </a>
            </div>
          )}

          <button
            onClick={() => {
               let finalMsg = message;
               if (isDonation) {
                 finalMsg = `[DONATION CLAIM]\n\n` + (message ? message : "I would like to claim this item.");
               } else {
                 if (offerItems.trim()) {
                   finalMsg = `I can offer: ${offerItems.trim()}` + (message ? `\n\n${message}` : "");
                 }
                 if (mpesaEnabled && cashTopUp > 0) {
                    finalMsg += `\n\n[Cash Bridge]: I will add KES ${cashTopUp} to balance the trade.`;
                 }
               }
               onSend(finalMsg, mpesaEnabled ? cashTopUp : 0, { offerItems });
               onClose();
            }}
            disabled={!isDonation && !offerItems && (!mpesaEnabled || cashTopUp <= 0)}
            className="w-full mt-4 bg-[#22C55E] text-white font-extrabold text-[15px] py-4 rounded-[16px] shadow-[0_8px_20px_rgba(34,197,94,0.25)] hover:shadow-[0_12px_25px_rgba(34,197,94,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isDonation ? "Claim Free" : "Send Proposal"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Chameleon Score Badge ───────────────────────────────────────────────────
function ChameleonScore({ score }: { score: number }) {
  let color = "#EF4444"; // red < 50
  let label = "Weak";
  let bg = "bg-red-50";
  let border = "border-red-200";

  if (score >= 95) {
    color = "#10B981"; // emerald
    label = "Excellent";
    bg = "bg-emerald-50";
    border = "border-emerald-200";
  } else if (score >= 85) {
    color = "#22C55E"; // green
    label = "Strong";
    bg = "bg-[#F0FDF4]"; // green-50
    border = "border-[#BBF7D0]"; // green-200
  } else if (score >= 70) {
    color = "#EAB308"; // yellow
    label = "Good";
    bg = "bg-yellow-50";
    border = "border-yellow-200";
  } else if (score >= 50) {
    color = "#F97316"; // orange
    label = "Possible";
    bg = "bg-orange-50";
    border = "border-orange-200";
  }

  return (
    <div className={`border rounded-[16px] px-2 py-1 flex flex-col items-center justify-center shadow-sm ${bg} ${border}`} style={{ color }}>
      <div className="flex items-center justify-center">
        <div 
          className="w-8 h-8"
          style={{
            backgroundColor: color,
            WebkitMaskImage: `url('/cham.png')`,
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: `url('/cham.png')`,
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
          }}
        />
      </div>
      <span className="text-[8.5px] uppercase font-bold tracking-wider mt-0.5 opacity-90">{label} Match</span>
    </div>
  );
}

// ─── Special Details Parser ──────────────────────────────────────────────────
function renderSpecialDetails(desc: string) {
  if (!desc.startsWith('[Service Details]') && !desc.startsWith('[Donation Details]')) {
    return <p className="text-gray-600 text-[13px] line-clamp-2 font-medium leading-relaxed">{desc.replace(/<!--[\s\S]*?-->/g, '').trim()}</p>;
  }
  
  const parts = desc.replace(/<!--[\s\S]*?-->/g, '').trim().split('\n\n');
  const detailsBlock = parts[0];
  const actualDesc = parts.slice(1).join('\n\n');
  
  const fields = detailsBlock.split('\n').slice(1).map(line => {
     const [k, ...v] = line.split(':');
     if (!k || !v.length) return null;
     return { key: k.trim(), val: v.join(':').trim() };
  }).filter(Boolean);

  return (
    <div className="flex flex-col gap-2 mt-2 w-full">
       <div className="flex flex-wrap gap-1.5 w-full">
          {fields.map((f: any) => (
             <div key={f.key} className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-1 rounded-[10px] flex items-center gap-1 border border-slate-200">
               <span className="opacity-60">{f.key}:</span> <span className="truncate max-w-[80px]">{f.val}</span>
             </div>
          ))}
       </div>
       {actualDesc && <p className="text-gray-600 text-[12px] line-clamp-1 font-medium">{actualDesc}</p>}
    </div>
  );
}

// ─── Swipe Card ───────────────────────────────────────────────────────────────
function SwipeCard({
  item,
  onSwipeRight,
  onSwipeLeft,
  isTop,
  index,
  onTap,
  cycleCount,
}: {
  item: any;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  isTop: boolean;
  index: number;
  onTap?: (item: any) => void;
  cycleCount: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);
  const controls = useAnimation();

  let images: string[] = [];
  if (Array.isArray(item.images)) images = item.images;
  else if (typeof item.images === 'string') { try { const parsed = JSON.parse(item.images); images = Array.isArray(parsed) ? parsed : [item.images]; } catch(e) { images = [item.images]; } }
  
  let wantItems: string[] = [];
  if (Array.isArray(item.wantItems)) wantItems = item.wantItems;
  else if (typeof item.wantItems === 'string') { try { const parsed = JSON.parse(item.wantItems); wantItems = Array.isArray(parsed) ? parsed : [item.wantItems]; } catch(e) { wantItems = [item.wantItems]; } }

  const img = (images[0] && !images[0].startsWith('blob:')) ? images[0] : "/logo.jpg";

  const isDragging = useRef(false);

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = async (_: any, info: any) => {
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
    const threshold = 120;
    if (info.offset.x > threshold) {
      await controls.start({ x: 600, opacity: 0, rotate: 20, transition: { duration: 0.3 } });
      onSwipeRight();
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: -600, opacity: 0, rotate: -20, transition: { duration: 0.3 } });
      onSwipeLeft();
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 400, damping: 30 } });
    }
  };

  if (!isTop) {
    return (
      <motion.div
        style={{ scale: 1 - index * 0.04, y: index * 12, zIndex: 10 - index }}
        className="absolute inset-0 bg-white rounded-[32px] card-shadow-lg"
      />
    );
  }

  return (
    <motion.div
      drag={flipped ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      style={{ x, rotate, opacity, zIndex: 20, perspective: 1200 }}
      animate={controls}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTap={() => { if (!isDragging.current) setFlipped(!flipped); }}
      className={`absolute inset-0 rounded-[32px] overflow-visible swipe-card touch-none ${flipped ? '' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-full"
      >
        {/* Front Face */}
        <div 
          style={{ 
             backfaceVisibility: "hidden", 
             WebkitBackfaceVisibility: "hidden", 
             MozBackfaceVisibility: "hidden", 
             transform: "rotateY(0deg)" 
          }} 
          className="absolute inset-0 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col"
        >
          {/* Top Half: Image */}
          <div className="relative h-[48%] bg-[#0F172A]">
            <img src={img} alt={item.title} className="w-full h-full object-cover blur-xl opacity-60 scale-110" />
            <img src={img} alt={item.title} className="absolute inset-0 w-full h-full object-contain" />
            
            {/* Gradient for badges */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-1/2" />
            
            {/* LIKE indicator */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-6 left-6 border-4 border-[#22C55E] rounded-[20px] px-3 py-1 rotate-[-15deg] z-10 bg-white/10 backdrop-blur-md"
            >
              <span className="text-[#22C55E] font-black text-2xl tracking-widest">SWAP</span>
            </motion.div>

            {/* NOPE indicator */}
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-6 right-6 border-4 border-red-500 rounded-[20px] px-3 py-1 rotate-[15deg] z-10 bg-white/10 backdrop-blur-md"
            >
              <span className="text-red-500 font-black text-2xl tracking-widest">NOPE</span>
            </motion.div>

            {/* Distance badge */}
            {(item.distanceKm !== undefined && !isNaN(item.distanceKm)) && (
              <div className="absolute bottom-3 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 z-10 shadow-sm">
                <MapPin className="w-3 h-3" />
                {item.distanceKm > 1000 ? "+1000 km away" : item.distanceKm < 1 ? `${Math.round(item.distanceKm * 1000)} m away` : `${item.distanceKm} km away`}
              </div>
            )}
          </div>

          {/* Bottom Half: Content */}
          <div className="flex-1 p-5 flex flex-col justify-between bg-white z-10 relative">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="pr-2">
                  <h3 className="font-extrabold text-[#0F172A] text-[22px] leading-tight mb-0.5">{item.title}</h3>
                  <p className="text-gray-500 text-xs font-semibold flex items-center gap-1 uppercase tracking-wide"><MapPin className="w-3.5 h-3.5" /> 
                    {(() => {
                        let text = item.locationName || item.campus || "Unknown";
                        try {
                           const l = JSON.parse(text);
                           if (l.town || l.county) return `${l.town || ''}, ${l.county || ''}`.replace(/^, | ,$/, '').trim();
                        } catch(e) {}
                        return text;
                    })()}
                  </p>
                </div>
                {item._matchScore !== undefined && (
                  <ChameleonScore score={item._matchScore} />
                )}
              </div>

              {renderSpecialDetails(item.description || "No description.")}

              {/* Context Row: Wants & Explainability */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {/* Cash badge / Donation badge */}
                {(wantItems.includes("FREE / DONATION")) ? (
                  <div className="bg-[#ECFDF5] text-[#10B981] font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                    FREE
                  </div>
                ) : item.cashTopUpAllowed && item.cashTopUpAmount > 0 ? (
                  <div className="bg-[#F0FDF4] text-[#22C55E] font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                    + KES {item.cashTopUpAmount.toLocaleString()}
                  </div>
                ) : null}

                {wantItems.slice(0, 1).map((w: string, i: number) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded-full">{w}</span>
                ))}
                {wantItems.length > 1 && <span className="text-gray-400 text-[9px] font-bold">+{wantItems.length - 1}</span>}
                
                {item._matchReasons && item._matchReasons.length > 0 && (
                   <span className="text-blue-500 font-bold text-[9px] uppercase tracking-widest ml-1 flex items-center gap-0.5 truncate">
                     <CheckCircle className="w-2.5 h-2.5 shrink-0" /> {item._matchReasons.join(', ')}
                   </span>
                )}
              </div>
              
              {/* Insight Badges (ESV + MultiSwap) */}
              {(item._esv || cycleCount > 0) && (
                <div className="mt-2.5 flex items-center gap-2">
                  {item._esv && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-[8px] text-[10px] font-bold tracking-wide">
                      <Tag className="w-3 h-3" />
                      KES {item._esv.toLocaleString()}
                    </div>
                  )}
                  {cycleCount > 0 && (
                    <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2 py-1 rounded-[8px] text-[10px] font-bold tracking-wide">
                      <Flame className="w-3 h-3" />
                      Multi-Swap
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Info Bar */}
            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[14px] border border-gray-100 overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm shrink-0">
                  {(() => {
                    let avatar = item.profiles?.avatarUrl || item.profiles?.avatar_url;
                    if (!avatar) {
                      try {
                        const uni = JSON.parse(item.profiles?.university || "{}");
                        avatar = uni.avatarUrl;
                      } catch(e) {}
                    }
                    if (!avatar) {
                      try {
                        const desc = JSON.parse(item.profiles?.description || "{}");
                        avatar = desc.avatarUrl;
                      } catch(e) {}
                    }
                    if (avatar) return <img src={avatar} alt="avatar" className="w-full h-full object-cover" />;
                    return (
                      <div className="w-full h-full gradient-green flex items-center justify-center">
                        <span className="text-white text-xs font-black">{(item.profiles?.name || item.user?.name || "U").charAt(0).toUpperCase()}</span>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold text-[#0F172A]">@{(() => {
                      const n = item.profiles?.name;
                      let desc: any = {};
                      let uni: any = {};
                      try { desc = JSON.parse(item.profiles?.description || "{}"); } catch(e) {}
                      try { uni = JSON.parse(item.profiles?.university || "{}"); } catch(e) {}
                      let un = desc.username || uni.username;
                      if (un) return un;
                      return n && n !== "SwapSoko User" ? n.toLowerCase().replace(/\s+/g, '') : "user";
                    })()}</span>
                    {item.profiles?.isStudentVerified && (
                      <GraduationCap className="w-3.5 h-3.5 text-[#3B82F6]"/>
                    )}
                  </div>
                </div>
              </div>

              {/* Swipe hint */}
              <div className="flex items-center gap-2.5 opacity-40">
                <X className="w-4 h-4 text-gray-800" />
                <div className="w-px h-3 bg-gray-300" />
                <Heart className="w-4 h-4 text-[#22C55E]" />
              </div>
            </div>
          </div>
        </div>

      {/* Back Face (Details) */}
      <div 
        style={{ 
           backfaceVisibility: "hidden", 
           WebkitBackfaceVisibility: "hidden", 
           MozBackfaceVisibility: "hidden", 
           transform: "rotateY(180deg)" 
        }} 
        className="absolute inset-0 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 flex flex-col pointer-events-auto overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto hide-scrollbar -mx-2 px-2 pb-6 flex flex-col justify-start pt-2">
          
          <h3 className="font-extrabold text-[#0F172A] text-2xl leading-tight mb-4 text-center">{item.title}</h3>
          
          {item.description && item.description.replace(/<!--[\s\S]*?-->/g, '').trim().length > 0 && (
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-[24px] p-5 mb-5 shadow-inner">
               {renderSpecialDetails(item.description)}
            </div>
          )}

          <div className="mb-5 flex justify-center">
            {(() => {
               const c = item.condition?.toLowerCase() || "";
               let bg = "bg-gray-50", text = "text-gray-600", border = "border-gray-200";
               if (c.includes("new") || c.includes("mint")) { bg = "bg-green-50"; text = "text-green-600"; border = "border-green-200"; }
               else if (c.includes("good") || c.includes("fair")) { bg = "bg-blue-50"; text = "text-blue-600"; border = "border-blue-200"; }
               else if (c.includes("used") || c.includes("poor")) { bg = "bg-orange-50"; text = "text-orange-600"; border = "border-orange-200"; }
               return (
                 <div className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-bold border ${bg} ${text} ${border}`}>
                   Condition: {item.condition || "Not specified"}
                 </div>
               );
            })()}
          </div>
          
          {images && images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {images.slice(0, 4).map((imgUrl: string, idx: number) => (
                 <div key={idx} className={`w-full overflow-hidden rounded-[20px] shadow-sm border border-gray-100 ${images.length === 1 ? 'h-48 col-span-2' : 'h-28'}`}>
                   <img src={imgUrl} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
                 </div>
              ))}
            </div>
          )}
          
        </div>

        <div className="pt-4 border-t border-gray-100 mt-auto bg-white z-10 flex gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
            className="flex-1 py-4 bg-gray-100 text-gray-700 transition-all hover:bg-gray-200 rounded-[20px] font-bold flex items-center justify-center gap-2"
          >
            <Repeat2 className="w-5 h-5" /> Back
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setFlipped(false); onSwipeRight(); }}
            className="flex-[2] py-4 bg-[#22C55E] text-white transition-all hover:bg-green-600 rounded-[20px] font-bold shadow-[0_4px_14px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" /> Propose Swap
          </button>
        </div>
      </div>

      </motion.div>
    </motion.div>
  );
}

// ─── Swipes Page ──────────────────────────────────────────────────────────────
import { Feed } from "@/components/Feed/Feed";
import { useAppStore } from "@/store";
import L from "leaflet";

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function SwipesPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { filters, toggleSavedItem, savedItemIds, watchedCategoryIds, toggleWatchedCategory } = useAppStore();
  
  const feedQuery = trpc.listings.feed.useQuery({ limit: 50, filters });
  const cyclesQuery = trpc.multiWay.findCycles.useQuery(undefined, { enabled: !!user });
  const myListingsQuery = trpc.listings.myListings.useQuery({}, { enabled: !!user });
  const myWishesQuery = trpc.wishes.myWishes.useQuery({}, { enabled: !!user });
  const myCommunitiesQuery = trpc.communities.myMemberships.useQuery({}, { enabled: !!user });
  const sendProposal = trpc.proposals.send.useMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [proposeListing, setProposeListing] = useState<any>(null);
  const [detailedListing, setDetailedListing] = useState<any>(null);
  const [swipedCount, setSwipedCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilter, setQuickFilter] = useState("All");
  
  useEffect(() => {
    feedQuery.refetch();
    setCurrentIndex(0);
    // Removed clearing filters to allow Home search to persist
  }, [user?.id]);
  
  useEffect(() => {
    setCurrentIndex(0);
  }, [filters]);
  
  // View toggle: "swipe" or "feed"
  const viewMode = filters.swipesViewMode || "swipe";
  const setViewMode = (mode: "swipe" | "feed") => useAppStore.setState({ filters: { ...filters, swipesViewMode: mode } });

  // Active Filter Chips Logic
  const activeFilterChips = React.useMemo(() => {
    const chips: any[] = [];
    if (filters.category && filters.category !== "All") chips.push({ label: filters.category, key: "category", val: null });
    (filters.categories || []).filter(c => c !== "All").forEach(c => chips.push({ label: c, key: "categories", val: c }));
    (filters.wantedCategories || []).filter(c => c !== "All").forEach(c => chips.push({ label: `Wants ${c}`, key: "wantedCategories", val: c }));
    (filters.conditions || []).filter(c => c !== "Any").forEach(c => chips.push({ label: c, key: "conditions", val: c }));
    if (filters.maxDistanceKm && filters.maxDistanceKm !== "Anywhere") chips.push({ label: `<${filters.maxDistanceKm}km`, key: "maxDistanceKm", val: null });
    if (filters.minEsv) chips.push({ label: `Min ${filters.minEsv.toLocaleString()}`, key: "minEsv", val: null });
    if (filters.maxEsv) chips.push({ label: `Max ${filters.maxEsv.toLocaleString()}`, key: "maxEsv", val: null });
    if (filters.verifiedOnly) chips.push({ label: "Verified", key: "verifiedOnly", val: false });
    if ((filters as any).acceptsCashTopUp) chips.push({ label: "Accepts Cash", key: "acceptsCashTopUp", val: false });
    if (filters.noCashNeeded) chips.push({ label: "Pure Barter", key: "noCashNeeded", val: false });
    if (filters.multiWayAvailable) chips.push({ label: "Multi-Way", key: "multiWayAvailable", val: false });
    return chips;
  }, [filters]);

  const activeFilterCount = activeFilterChips.length;

  const removeFilter = (key: string, val: any) => {
    if (Array.isArray(filters[key as keyof typeof filters])) {
       const curr = (filters[key as keyof typeof filters] as string[]);
       const next = curr.filter(c => c !== val);
       useAppStore.setState({ filters: { ...filters, [key]: next.length ? next : (key === "conditions" ? ["Any"] : ["All"]) } });
    } else {
       useAppStore.setState({ filters: { ...filters, [key]: val } });
    }
  };
  
  let items = feedQuery.data?.items || [];
  
  // Exclude current user's listings
  items = items.filter((item: any) => item.userId?.toString() !== user?.id?.toString());

  // Quick Filter
  if (quickFilter === "Swaps") {
     items = items.filter((item: any) => {
        let wants: string[] = [];
        try { 
           const parsed = Array.isArray(item.wantItems) ? item.wantItems : JSON.parse(item.wantItems || '[]'); 
           wants = Array.isArray(parsed) ? parsed : [parsed];
        } catch(e) {
           wants = item.wantItems ? [item.wantItems] : [];
        }
        return !wants.some((w: any) => typeof w === 'string' && w.includes("FREE / DONATION")) && item.category !== 'donations' && item.condition !== 'free';
     });
  } else if (quickFilter === "Free") {
     items = items.filter((item: any) => {
        let wants: string[] = [];
        try { 
           const parsed = Array.isArray(item.wantItems) ? item.wantItems : JSON.parse(item.wantItems || '[]'); 
           wants = Array.isArray(parsed) ? parsed : [parsed];
        } catch(e) {
           wants = item.wantItems ? [item.wantItems] : [];
        }
        return wants.some((w: any) => typeof w === 'string' && w.includes("FREE / DONATION")) || item.category === 'donations' || item.condition === 'free';
     });
  } else if (quickFilter === "My Campus") {
     const myCampus = filters.campus || user?.metadata?.campus || "JKUAT";
     items = items.filter((item: any) => item.campus === myCampus || item.locationName === myCampus);
  }
  
  // Apply filters from useAppStore
  // The backend TRPC feed route now processes the 100-Point Personalized Feed Algorithm!
  // It handles distance, trust, community, category preferences, and compatibility scoring.
  // See trpc.ts -> path[1] === 'feed'
  if (filters.query) {
    const q = filters.query.toLowerCase();
    items = items.filter((item: any) => 
      (item.title && item.title.toLowerCase().includes(q)) || 
      (item.description && item.description.toLowerCase().includes(q))
    );
  }

  // Bring targeted item to front if ?id= is set
  const searchParams = new URLSearchParams(window.location.search);
  const targetId = searchParams.get('id');
  if (targetId) {
    const targetIdx = items.findIndex((i: any) => i.id?.toString() === targetId);
    if (targetIdx > 0) {
      const target = items[targetIdx];
      items.splice(targetIdx, 1);
      items.unshift(target);
    }
  }

  const remaining = items.slice(currentIndex);

  // ─── Step 9: Feedback Loop (Learning Engine) ─────────────────────────────
  const trackTelemetry = (action: string, item: any) => {
    // In production, this persists to user profile preferences
    console.log(`[Telemetry Engine] ${action}: Adjusting weights for category [${item?.category}] and keywords...`);
  };

  const handleSwipeRight = () => {
    const item = items[currentIndex];
    if (!item) return;
    trackTelemetry("Strong Positive Signal (Saved / Swipe Right)", item);
    if (!isAuthenticated) {
      toast("Login to propose swaps!", { action: { label: "Login", onClick: () => setLocation("/login") } });
      setCurrentIndex(prev => prev + 1);
      return;
    }
    setProposeListing(item);
  };

  const handleSwipeLeft = () => {
    const item = remaining[0];
    if (item) trackTelemetry("Negative Signal (Ignored / Swipe Left)", item);
    setCurrentIndex(prev => prev + 1);
    setSwipedCount(prev => prev + 1);
  };

  const handleSendProposal = (message: string, cashTopUp: number, options?: any) => {
    if (!proposeListing) return;
    trackTelemetry("Very Strong Signal (Proposal Sent)", proposeListing);
    const toastId = toast.loading("Sending proposal...");
    sendProposal.mutate({
      listingId: proposeListing.id,
      userId: user?.id,
      toUserId: proposeListing.userId,
      message,
      cashTopUp,
      ...options
    }, {
      onSuccess: (data: any) => {
        toast.success("Proposal sent!", { id: toastId });
        setProposeListing(null);
        setCurrentIndex(prev => prev + 1);
      },
      onError: () => {
        toast.error("Failed to send proposal", { id: toastId });
      },
    });
  };

  // ─── Step 10: Swap Wishes Notification Engine ─────────────────────────────
  useEffect(() => {
    if (items.length > 0 && swipedCount === 0) {
      const topMatch = items[0];
      if (topMatch._matchScore && topMatch._matchScore >= 95) {
        toast("SwapGuru found something for you!", {
          description: `A perfect match (${topMatch.title}) was just listed nearby!`,
          icon: "🔥",
          duration: 6000,
        });
      }
    }
  }, [items.length]);

  // Generate fallback locations for the map based on the listings if they lack coordinates
  const mapLocations = remaining.map((item: any, idx: number) => {
    let imgUrl = null;
    try {
      const parsedImages = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        imgUrl = parsedImages[0];
      }
    } catch(e) {}
    const customIcon = L.divIcon({
      className: "bg-transparent border-none",
      html: `
        <div class="relative group flex flex-col items-center">
          <div class="w-12 h-12 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white z-10 transition-transform group-hover:scale-110">
            ${imgUrl ? `<img src="${imgUrl}" class="w-full h-full object-cover" />` : `<div class="w-full h-full bg-[#22C55E]"></div>`}
          </div>
          <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-white -mt-1 shadow-sm z-0"></div>
        </div>
      `,
      iconSize: [48, 60],
      iconAnchor: [24, 60],
      popupAnchor: [0, -60],
    });

    const baseLat = filters.coords?.lat || -1.1018;
    const baseLng = filters.coords?.lng || 37.0144;
    
    // Spread markers evenly around the center instead of clumping them in one spot
    const numericId = parseInt(item.id?.toString() || "0", 10) || 0;
    const radius = ((numericId % 15) / 15) * 0.02 + 0.002; // between ~200m and ~2.2km
    const angle = (numericId * 137.5) * (Math.PI / 180); // Golden angle for even distribution
    const latOffset = Math.sin(angle) * radius;
    const lngOffset = Math.cos(angle) * radius;

    return {
      id: item.id?.toString() || Math.random().toString(),
      lat: item.lat ? item.lat + latOffset : (baseLat + latOffset),
      lng: item.lng ? item.lng + lngOffset : (baseLng + lngOffset),
      title: item.title,
      description: item.description,
      imageUrl: imgUrl,
      icon: customIcon,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8FAFC] flex flex-col"
    >
      {/* Header */}
      {viewMode !== "feed" && (
      <>
      <div className="page-header px-4 py-3 flex items-center justify-between z-50 bg-[#F8FAFC] sticky top-0">
        <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-6 h-6 text-[#0F172A]" />
        </button>
        
        {/* Enhanced List/Feed Toggle */}
        <div className="flex bg-gray-100 p-1.5 rounded-full shadow-inner border border-gray-200 flex-1 max-w-[160px] mx-3">
          <button 
            onClick={() => setViewMode("swipe")}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "swipe" ? "bg-white text-[#22C55E] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Swipe
          </button>
          <button 
            onClick={() => setViewMode("feed")}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "feed" ? "bg-white text-[#22C55E] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Feed
          </button>
        </div>

        <div className="relative">
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={() => setShowFilters(true)}
            className="h-10 px-3 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm gap-2"
          >
            <Filter className="w-4 h-4 text-[#0F172A]" />
            {activeFilterCount > 0 && (
               <span className="bg-[#22C55E] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>
            )}
          </motion.button>
          
          <FilterSheet open={showFilters} onOpenChange={setShowFilters} />
        </div>
      </div>
      
      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar -mt-1 relative z-10">
          {activeFilterChips.map((chip: any, i: number) => (
            <div key={i} className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm shrink-0">
               <span className="text-[10px] font-bold text-gray-700">{chip.label}</span>
               <button onClick={() => removeFilter(chip.key, chip.val)} className="text-gray-400 hover:text-red-500 ml-1">
                  <X className="w-3 h-3" />
               </button>
            </div>
          ))}
          <button 
             onClick={() => {
               useAppStore.setState({ 
                 filters: { ...filters, categories: ['All'], wantedCategories: ['All'], conditions: ['Any'], maxDistanceKm: null, minEsv: null, maxEsv: null, verifiedOnly: false, noCashNeeded: false, directSwapOnly: false, multiWayAvailable: false, minTrustRating: null, minCompletedSwaps: null, communityId: null }
               });
             }} 
             className="text-[10px] font-bold text-gray-500 underline ml-2 shrink-0"
          >
             Clear All
          </button>
        </div>
      )}
      </>
      )}

      {viewMode === "feed" ? (
        <div className="fixed inset-0 z-[1000] bg-black">
           <button 
             onClick={() => setViewMode("swipe")}
             className="absolute top-12 left-4 z-[1010] w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white"
           >
              <ChevronLeft className="w-6 h-6" />
           </button>
           <Feed onPropose={(listing) => {
               if (!isAuthenticated) {
                  toast("Login to propose swaps!", { action: { label: "Login", onClick: () => window.location.href = "/login" } });
                  return;
               }
               setProposeListing(listing);
           }} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 overflow-hidden relative">
          {feedQuery.isLoading ? (
            <div className="relative w-full max-w-sm" style={{ height: "65vh", maxHeight: "600px" }}>
              <div className="absolute inset-0 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 flex flex-col pointer-events-none overflow-hidden border border-gray-100 animate-pulse">
                <div className="w-full h-1/2 bg-gray-100 rounded-[24px] mb-4"></div>
                <div className="h-6 bg-gray-100 rounded-full w-2/3 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded-full w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded-full w-4/5 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-8 w-20 bg-gray-100 rounded-full"></div>
                  <div className="h-8 w-24 bg-gray-100 rounded-full"></div>
                </div>
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[14px] bg-gray-100"></div>
                    <div className="space-y-1.5">
                      <div className="w-20 h-3 bg-gray-100 rounded-full"></div>
                      <div className="w-12 h-2.5 bg-gray-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                    <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : remaining.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="font-bold text-[#0F172A] text-lg">No swaps found!</h3>
              <p className="text-gray-400 text-sm mt-1">Check back later for new listings</p>
              {items.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentIndex(0)}
                  className="mt-4 gradient-green text-white font-semibold px-6 py-2.5 rounded-[24px] text-sm shadow-md hover:shadow-lg transition-all"
                >
                  Start Over
                </motion.button>
              )}
            </div>
          ) : (
            <>
              {/* Card stack */}
              <div className="relative w-full max-w-sm" style={{ height: "65vh", maxHeight: "600px" }}>
                <AnimatePresence>
                  {remaining.slice(0, 3).map((item: any, i: number) => (
                    <SwipeCard
                      key={item.id}
                      item={item}
                      isTop={i === 0}
                      index={i}
                      onSwipeRight={handleSwipeRight}
                      onSwipeLeft={handleSwipeLeft}
                      onTap={() => {}}
                      cycleCount={(cyclesQuery.data?.cycles || []).filter((c: any) => c.legs.some((l: any) => l.id?.toString() === item.id?.toString()) && c.legs.some((l: any) => l.userId === user?.id)).length}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-6 mt-6 pb-24">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleSwipeLeft}
                  className="w-16 h-16 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-center border border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-8 h-8 text-red-500" strokeWidth={2.5} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => remaining[0]?.id && toggleSavedItem(remaining[0].id.toString())}
                  className="w-12 h-12 bg-white rounded-[18px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] flex items-center justify-center border border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <Star className={`w-6 h-6 ${remaining[0]?.id && Array.isArray(savedItemIds) && savedItemIds.includes(remaining[0].id.toString()) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleSwipeRight}
                  className="w-16 h-16 rounded-[24px] shadow-[0_8px_25px_rgba(34,197,94,0.3)] flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)" }}
                >
                  <Repeat2 className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Propose Swap Modal */}
      <AnimatePresence>
        {proposeListing && (
          <ProposeSwapModal
            listing={proposeListing}
            onClose={() => { setProposeListing(null); if (viewMode === "swipe") setCurrentIndex(prev => prev + 1); }}
            onSend={handleSendProposal}
          />
        )}
      </AnimatePresence>

      {/* Detailed View Modal (Removed in favor of card flip) */}
    </motion.div>
  );
}
