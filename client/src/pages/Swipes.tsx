import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import { Sparkles, MapPin, Navigation, Compass, ChevronLeft, Search, Filter, MessageCircle, RefreshCw, Layers, Zap, Info, Shield, Plus, Heart, X, CheckCircle, Star, Clock, Gift, Flame, Tag, Repeat2, GraduationCap, AlertTriangle, Coins } from "lucide-react";
import { FilterSheet } from "@/components/FilterSheet";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { ReportModal } from "@/components/ReportModal";


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
      className="fixed-overlay bg-black/20 backdrop-blur-sm z-[1050] flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full max-w-[480px] bg-white rounded-t-[32px] p-7 pb-28 shadow-[0_-20px_60px_rgba(0,0,0,0.08)] relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
        <h3 className="font-semibold text-gray-900 text-[22px] tracking-tight">{isDonation ? "Claim Donation" : "Propose Swap"}</h3>
        <p className="text-gray-500 text-[14px] mt-1 flex items-center gap-1.5 font-medium">
          <Repeat2 className="w-4 h-4 text-gray-400" />
          For: <span className="font-semibold text-gray-900 truncate max-w-[240px]">{listing.title}</span>
        </p>

        <div className="mt-8 space-y-5">
          {!isDonation && (
            <div>
              <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">What you're offering</label>
              <input
                value={offerItems}
                onChange={e => setOfferItems(e.target.value)}
                placeholder="e.g. iPhone 11, Laptop..."
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-gray-900 placeholder:text-gray-400"
              />
            </div>
          )}

          <div>
            <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">Message (optional)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={isDonation ? "Introduce yourself and why you'd like this..." : "Add a friendly note to your proposal..."}
              rows={2}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all resize-none font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {!isDonation && (
            <div className="bg-[#FCFCFD] border border-gray-200 rounded-2xl p-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#E6F4EA] rounded-full flex items-center justify-center">
                    <span className="text-[#137333] text-xs font-bold tracking-tight">M</span>
                  </div>
                  <span className="text-[15px] font-semibold text-gray-900">M-Pesa Top-Up</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMpesaEnabled(!mpesaEnabled)}
                  className={`w-[44px] h-[24px] rounded-full transition-colors flex items-center px-0.5 ${mpesaEnabled ? "bg-emerald-500" : "bg-gray-200"}`}
                >
                  <motion.div
                    animate={{ x: mpesaEnabled ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-sm"
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
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[13px] font-medium text-gray-600">Cash amount (KES)</label>
                        {listing?.cashTopUpAmount > 0 && (
                          <button 
                            onClick={() => setCashTopUp(listing.cashTopUpAmount)}
                            className="text-[11px] bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full font-semibold border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            Auto-fill: {listing.cashTopUpAmount}
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-400">KES</span>
                        <input
                          type="number"
                          value={cashTopUp || ''}
                          onChange={e => setCashTopUp(Number(e.target.value))}
                          placeholder={listing?.cashTopUpAmount > 0 ? `${listing.cashTopUpAmount}` : "0"}
                          className="w-full bg-white border border-gray-200 rounded-2xl pl-14 pr-4 py-3.5 text-[16px] font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
                        />
                      </div>
                      <p className="text-[12px] text-gray-500 mt-2 flex justify-between font-medium">
                        <span>Paid via M-Pesa at meetup</span>
                        {listing?.cashTopUpAmount > 0 && <span className="text-gray-900">Target: ~KES {listing.cashTopUpAmount}</span>}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {listing.lat && listing.lng && (
            <div className="flex gap-2 pt-1">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`} target="_blank" rel="noreferrer" className="flex-1 py-3 text-[13px] font-semibold text-center bg-gray-50 rounded-2xl text-gray-700 hover:bg-gray-100 transition-colors">
                Google Maps
              </a>
              <a href={`https://waze.com/ul?ll=${listing.lat},${listing.lng}&navigate=yes`} target="_blank" rel="noreferrer" className="flex-1 py-3 text-[13px] font-semibold text-center bg-gray-50 rounded-2xl text-gray-700 hover:bg-gray-100 transition-colors">
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
            className="w-full mt-2 bg-slate-900 text-white font-semibold text-[15px] py-4 rounded-2xl shadow-md hover:bg-slate-800 active:bg-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isDonation ? "Claim Free" : "Send Proposal"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Chameleon Score Badge ───────────────────────────────────────────────────
function ChameleonScore({ item }: { item: any }) {
  const score = item._matchScore || 0;
  let color = "#EF4444"; // red < 50
  let label = "Weak Match";

  if (score >= 95) {
    color = "#10B981"; // emerald
    label = "Excellent Match";
  } else if (score >= 85) {
    color = "#22C55E"; // green
    label = "Strong Match";
  } else if (score >= 70) {
    color = "#EAB308"; // yellow
    label = "Good Match";
  } else if (score >= 50) {
    color = "#F97316"; // orange
    label = "Possible Match";
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const reasons = item._matchReasons && item._matchReasons.length > 0 
      ? item._matchReasons.join(", ") 
      : "Our algorithm found some similarities based on your preferences.";
    
    toast.custom((t) => (
      <div className="flex items-center gap-3 w-full">
        <div className="w-10 h-10 rounded-full bg-white/50 shadow-sm flex items-center justify-center shrink-0 border border-slate-200/50">
          <div 
            className="w-[22px] h-[22px]"
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
        <div className="flex flex-col justify-center flex-1">
          <h3 className="font-bold text-slate-900 text-[14px] tracking-tight leading-none mb-1">{label} ({Math.round(score)}%)</h3>
          <p className="text-[12px] text-slate-500 font-medium leading-tight max-w-[220px] truncate">{reasons}</p>
        </div>
      </div>
    ), { duration: 4000 });
  };

  return (
    <button 
      onClick={handleClick}
      onPointerDown={(e) => e.stopPropagation()}
      className="no-flip flex items-center justify-center p-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 hover:bg-black/30 transition-colors shadow-sm"
      title="Click to see match details"
    >
      <div 
        className="w-7 h-7"
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
    </button>
  );
}

// ─── Special Details Parser ──────────────────────────────────────────────────
function renderSpecialDetails(desc: string, isFull: boolean = false) {
  if (!desc.startsWith('[Service Details]') && !desc.startsWith('[Donation Details]')) {
    return <p className={`text-white/90 font-medium leading-relaxed drop-shadow-sm ${isFull ? 'text-[15px]' : 'text-[13px] line-clamp-2'}`}>{desc.replace(/<!--[\s\S]*?-->/g, '').trim()}</p>;
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
    <div className="space-y-2">
       <div className={`bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 grid grid-cols-2 gap-2 ${isFull ? 'text-sm' : 'text-xs'}`}>
         {fields.map((f: any, i: number) => (
           <div key={i} className="flex flex-col">
             <span className="text-white/60 font-medium">{f.key}</span>
             <span className="text-white font-semibold truncate" title={f.val}>{f.val}</span>
           </div>
         ))}
       </div>
       {actualDesc && (
         <p className={`text-white/90 font-medium leading-relaxed drop-shadow-sm ${isFull ? 'text-[15px]' : 'text-[13px] line-clamp-2'}`}>{actualDesc}</p>
       )}
    </div>
  );
}

// ─── Swipe Card Component ────────────────────────────────────────────────────
function SwipeCard({ 
  item, 
  isTop, 
  onSwipeRight, 
  onSwipeLeft, 
  index,
  onTap,
  cycleCount,
  onReport,
  onImageClick
}: {
  item: any;
  isTop: boolean;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  index: number;
  onTap?: (item: any) => void;
  cycleCount: number;
  onReport?: () => void;
  onImageClick?: (url: string) => void;
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
    const velocityX = info.velocity.x;
    
    if (info.offset.x > threshold || velocityX > 500) {
      await controls.start({ x: window.innerWidth, opacity: 0, rotate: 20, transition: { type: "spring", stiffness: 300, damping: 20 } });
      onSwipeRight();
    } else if (info.offset.x < -threshold || velocityX < -500) {
      await controls.start({ x: -window.innerWidth, opacity: 0, rotate: -20, transition: { type: "spring", stiffness: 300, damping: 20 } });
      onSwipeLeft();
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 400, damping: 25 } });
    }
  };

  if (!isTop) {
    return (
      <motion.div
        style={{ 
          scale: 1 - index * 0.05, 
          y: index * 16, 
          opacity: 1 - index * 0.2,
          zIndex: 10 - index,
          transformOrigin: "bottom center"
        }}
        className="absolute inset-0 bg-background rounded-[2rem] card-shadow-md"
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
      onTap={(e: any) => { 
        if (e.target && typeof e.target.closest === 'function' && e.target.closest('.no-flip')) return;
        if (!isDragging.current) setFlipped(!flipped); 
      }}
      className={`absolute inset-0 rounded-3xl overflow-visible swipe-card touch-none ${flipped ? '' : 'cursor-grab active:cursor-grabbing'}`}
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
          className="absolute inset-0 bg-black rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col group"
        >
          {/* Full Bleed Image */}
          <div className="absolute inset-0 bg-slate-900">
            <img src={img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
            
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-10 left-6 z-20 pointer-events-none"
            >
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full px-5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                <div className="w-7 h-7 rounded-full bg-[#22C55E]/20 flex items-center justify-center border border-[#22C55E]/30">
                  <Repeat2 className="w-4 h-4 text-[#22C55E]" strokeWidth={2.5} />
                </div>
                <span className="text-white text-[13px] font-bold tracking-[0.15em] uppercase pr-2">Swap</span>
              </div>
            </motion.div>

            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-10 right-6 z-20 pointer-events-none"
            >
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full px-5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                <span className="text-white text-[13px] font-bold tracking-[0.15em] uppercase pl-2">Nope</span>
                <div className="w-7 h-7 rounded-full bg-[#EF4444]/20 flex items-center justify-center border border-[#EF4444]/30">
                  <X className="w-4 h-4 text-[#EF4444]" strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Content Area */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end z-10 pointer-events-auto">
            <div className="flex items-end justify-between mb-3">
              <div className="pr-4">
                <h3 className="font-bold text-white text-[28px] leading-tight tracking-tight drop-shadow-md mb-1">{item.title}</h3>
                <p className="text-white/80 text-[13px] font-medium flex items-center gap-1.5 drop-shadow-md"><MapPin className="w-4 h-4 text-white/90" /> 
                  {(() => {
                      let text = item.locationName || item.campus || "Unknown";
                      try {
                         const l = JSON.parse(text);
                         if (l.town || l.county) return `${l.town || ''}, ${l.county || ''}`.replace(/^, | ,$/, '').trim();
                      } catch(e) {}
                      return text;
                  })()}
                </p>
                {(item.distanceKm !== undefined && !isNaN(item.distanceKm)) && (
                  <div className="mt-1.5 flex items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/90 text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.distanceKm > 1000 ? "+1000 km" : item.distanceKm < 1 ? `${Math.round(item.distanceKm * 1000)} m` : `${item.distanceKm} km`}
                    </span>
                  </div>
                )}
              </div>
              {item._matchScore !== undefined && (
                <div className="shrink-0 mb-1">
                  <ChameleonScore item={item} />
                </div>
              )}
            </div>

            {/* Context Row: Wants & Explainability */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Cash badge / Donation badge */}
              {(wantItems.includes("FREE / DONATION")) ? (
                <div className="inline-flex items-center gap-1.5 bg-[#FF2D55]/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                  <Heart className="w-4 h-4 text-white fill-white" />
                  <span className="text-white text-[11px] font-bold tracking-wide uppercase">Donation</span>
                </div>
              ) : item.cashTopUpAllowed && item.cashTopUpAmount > 0 ? (
                <div className="inline-flex items-center gap-1.5 bg-[#34C759]/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                  <Coins className="w-4 h-4 text-white" />
                  <span className="text-white text-[11px] font-bold tracking-wide uppercase">+ KES {item.cashTopUpAmount.toLocaleString()}</span>
                </div>
              ) : null}

              {wantItems.slice(0, 2).map((w: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white border border-white/20 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">{w}</span>
              ))}
              {wantItems.length > 2 && <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white/90 border border-white/10 text-[11px] font-bold px-3 py-1.5 rounded-full">+{wantItems.length - 2}</span>}

              {/* Insight Badges (ESV + MultiSwap) */}
              {item._esv && (
                <div className="inline-flex items-center gap-1.5 bg-[#34C759]/30 backdrop-blur-md text-white border border-[#34C759]/40 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-sm">
                  <Tag className="w-3.5 h-3.5 text-[#34C759]" />
                  KES {item._esv.toLocaleString()}
                </div>
              )}
              {cycleCount > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-[#007AFF]/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                  <Star className="w-4 h-4 text-white fill-white" />
                  <span className="text-white text-[11px] font-bold tracking-wide uppercase">{cycleCount} Way Swap</span>
                </div>
              )}
            </div>
            
            {/* Minimal Profile Bar */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md overflow-hidden border border-white/20 flex shrink-0 shadow-md">
                  {(() => {
                    let avatar = item.profiles?.avatarUrl || item.user?.avatarUrl;
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
                    if (avatar) return <img src={avatar} className="w-full h-full object-cover" />;
                    return (
                      <div className="w-full h-full gradient-green flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{(item.profiles?.name || item.user?.name || "U").charAt(0).toUpperCase()}</span>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-bold text-white drop-shadow-md">@{(() => {
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
                      <GraduationCap className="w-4 h-4 text-[#32ADE6] drop-shadow-md"/>
                    )}
                  </div>
                </div>
              </div>

              {/* Report button */}
              <button 
                onClick={(e) => { e.stopPropagation(); onReport?.(); }}
                onPointerDown={(e) => e.stopPropagation()}
                title="Report Listing"
                className="no-flip w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-white" />
              </button>
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
        className="absolute inset-0 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.2)] flex flex-col pointer-events-auto overflow-hidden bg-black group"
      >
        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
           <img src={img} className="absolute inset-0 w-full h-full object-cover blur-[40px] opacity-60 scale-125 saturate-150" />
           <div className="absolute inset-0 bg-black/40 backdrop-blur-[20px]" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-32 flex flex-col justify-start pt-8 relative z-10 pointer-events-auto">
          
          <h3 className="font-extrabold text-white text-[32px] leading-tight mb-6 drop-shadow-md text-center">{item.title}</h3>
          
          {item.description && item.description.replace(/<!--[\s\S]*?-->/g, '').trim().length > 0 && (
            <div className="mb-6 px-2 text-center">
               {renderSpecialDetails(item.description, true)}
            </div>
          )}

          <div className="mb-8 flex justify-center">
            {(() => {
               const c = item.condition?.toLowerCase() || "";
               let color = "#FFFFFF";
               if (c.includes("new") || c.includes("mint")) { color = "#34C759"; }
               else if (c.includes("good") || c.includes("fair")) { color = "#32ADE6"; }
               else if (c.includes("used") || c.includes("poor")) { color = "#FF9500"; }
               return (
                 <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-colors shadow-sm">
                   <div className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                   <span className="text-[11px] font-medium tracking-[0.1em] text-white/90 uppercase">
                     CONDITION: {item.condition || "Not specified"}
                   </span>
                 </div>
               );
            })()}
          </div>
          
          {images && images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {images.slice(0, 4).map((imgUrl: string, idx: number) => (
                 <div 
                   key={idx} 
                   onClick={(e) => { e.stopPropagation(); onImageClick?.(imgUrl); }}
                   onPointerDown={(e) => e.stopPropagation()}
                   className={`no-flip w-full overflow-hidden rounded-[20px] shadow-lg border border-white/15 cursor-pointer ${images.length === 1 ? 'h-64 col-span-2' : 'h-36'}`}
                 >
                   <img src={imgUrl} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300 pointer-events-none" />
                 </div>
              ))}
            </div>
          )}
          
        </div>

        {/* Unified Floating Action Bar (Minimalist) */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-14 h-14 bg-white/10 backdrop-blur-2xl text-white transition-all hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center border border-white/10 shadow-lg"
          >
            <Repeat2 className="w-6 h-6 text-white/90" strokeWidth={2} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setFlipped(false); onSwipeRight(); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 h-14 bg-white text-slate-900 transition-all hover:bg-gray-50 active:scale-95 rounded-full font-semibold shadow-lg flex items-center justify-center gap-2 text-[15px]"
          >
            <MessageCircle className="w-5 h-5 text-slate-900" strokeWidth={2.5} /> Propose Swap
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
  const { filters, toggleSavedItem, savedItemIds, watchedCategoryIds, toggleWatchedCategory, coords, setCoords } = useAppStore();
  
  const feedQuery = trpc.listings.feed.useQuery({ limit: 50, filters, coords });
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
  const [reportingItem, setReportingItem] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const updateProfileMutation = trpc.profiles.update.useMutation();

  useEffect(() => {
    // Only ask for location once on mount
    if (navigator.geolocation && !coords) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
           setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
           if (user) {
              // Update user profile with exact coordinates
              updateProfileMutation.mutate({
                 lat: pos.coords.latitude,
                 lng: pos.coords.longitude
              });
           }
        },
        (err) => console.log('Location not available:', err),
        { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true }
      );
    }
  }, [user]);
  
  useEffect(() => {
    feedQuery.refetch();
    setCurrentIndex(0);
    // Removed clearing filters to allow Home search to persist
  }, [user?.id]);
  
  useEffect(() => {
    setCurrentIndex(0);
  }, [filters]);
  
  // View toggle: "swipe" or "feed"
  const viewMode = (filters.swipesViewMode as string) || "swipe";
  const setViewMode = (mode: "swipe" | "map" | "feed") => useAppStore.setState({ filters: { ...filters, swipesViewMode: mode } });

  useEffect(() => {
    if (previewImage) {
      document.body.classList.add('preview-open');
    } else {
      document.body.classList.remove('preview-open');
    }
    return () => document.body.classList.remove('preview-open');
  }, [previewImage]);

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
            ${imgUrl ? `<img src="${imgUrl}" class="w-full h-full object-cover" />` : `<div class="w-full h-full bg-green-500"></div>`}
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
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </button>
        
        {/* Enhanced List/Feed Toggle */}
        <div className="flex bg-gray-100 p-1.5 rounded-full shadow-inner border border-gray-200 flex-1 max-w-[160px] mx-3">
          <button 
            onClick={() => setViewMode("swipe")}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "swipe" ? "bg-white text-green-500 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Swipe
          </button>
          <button 
            onClick={() => setViewMode("feed")}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "feed" ? "bg-white text-green-500 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
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
            <Filter className="w-4 h-4 text-slate-900" />
            {activeFilterCount > 0 && (
               <span className="bg-green-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>
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
               <span className="text-xs font-bold text-gray-700">{chip.label}</span>
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
             className="text-xs font-bold text-gray-500 underline ml-2 shrink-0"
          >
             Clear All
          </button>
        </div>
      )}
      </>
      )}

      {viewMode === "feed" ? (
        <div className="fixed-overlay z-[1000] bg-black">
           <button 
             onClick={() => setViewMode("swipe")}
             className="absolute top-12 left-4 z-[1010] w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white"
           >
              <ChevronLeft className="w-6 h-6" />
           </button>
           <Feed 
               coords={coords}
               onPropose={(listing) => {
                   if (!isAuthenticated) {
                      toast("Login to propose swaps!", { action: { label: "Login", onClick: () => window.location.href = "/login" } });
                      return;
                   }
                   setProposeListing(listing);
               }}
               onReport={(listing) => setReportingItem(listing)}
           />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 overflow-hidden relative">
          {feedQuery.isLoading ? (
            <div className="relative w-full max-w-sm" style={{ height: "65vh", maxHeight: "600px" }}>
              <div className="absolute inset-0 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 flex flex-col pointer-events-none overflow-hidden border border-gray-100 animate-pulse">
                <div className="w-full h-1/2 bg-gray-100 rounded-2xl mb-4"></div>
                <div className="h-6 bg-gray-100 rounded-full w-2/3 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded-full w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded-full w-4/5 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-8 w-20 bg-gray-100 rounded-full"></div>
                  <div className="h-8 w-24 bg-gray-100 rounded-full"></div>
                </div>
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gray-100"></div>
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
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full min-h-[50vh] px-8 text-center"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-swap-green/20 blur-2xl rounded-full scale-[1.8]"></div>
                <div className="relative w-20 h-20 bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] flex items-center justify-center rotate-3 transform-gpu">
                  <Search className="w-8 h-8 text-slate-700 -rotate-3" strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 text-[22px] tracking-tight mb-2.5">You're all caught up</h3>
              <p className="text-slate-500 text-[15px] max-w-[260px] leading-relaxed">
                You've seen all the latest listings nearby. Check back later for new items.
              </p>
              {items.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentIndex(0)}
                  className="mt-8 bg-slate-900 text-white font-semibold px-8 py-3.5 rounded-full text-[15px] shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Start Over
                </motion.button>
              )}
            </motion.div>
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
                      onReport={() => setReportingItem(item)}
                      onImageClick={(url) => setPreviewImage(url)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Action buttons (Minimalist Professional Floating Dock) */}
              <div className="swipes-action-buttons flex items-center justify-center mt-6 pb-24 relative z-50">
                <div className="flex items-center gap-1 p-2 bg-white/80 backdrop-blur-3xl border border-slate-200/80 rounded-full shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSwipeLeft}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50/80 transition-colors"
                  >
                    <X className="w-6 h-6" strokeWidth={2.5} />
                  </motion.button>

                  <div className="w-px h-6 bg-slate-200 mx-1" />

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => remaining[0]?.id && toggleSavedItem(remaining[0].id.toString())}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100/80"
                  >
                    <Star className={`w-5 h-5 ${remaining[0]?.id && Array.isArray(savedItemIds) && savedItemIds.includes(remaining[0].id.toString()) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400 hover:text-slate-900'}`} strokeWidth={2.5} />
                  </motion.button>

                  <div className="w-px h-6 bg-slate-200 mx-1" />

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSwipeRight}
                    className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 shadow-[0_4px_12px_rgba(34,197,94,0.25)] transition-all"
                  >
                    <Repeat2 className="w-6 h-6" strokeWidth={2.5} />
                  </motion.button>
                </div>
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
      
      {/* Report Modal */}
      {reportingItem && (
        <ReportModal
          isOpen={!!reportingItem}
          onClose={() => setReportingItem(null)}
          targetType="listing"
          targetId={reportingItem.id.toString()}
        />
      )}

      {/* Image Preview Overlay */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed-overlay z-[1100] bg-black/40 backdrop-blur-3xl flex items-center justify-center p-0 sm:p-4 cursor-zoom-out"
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md text-white hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain sm:rounded-[20px] shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed View Modal (Removed in favor of card flip) */}
    </motion.div>
  );
}
