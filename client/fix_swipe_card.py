with open('/home/m3/ssok0/client/src/pages/Swipes.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('function SwipeCard({')
end_idx = content.find('// ─── Filter & Map Controls', start_idx)

if end_idx == -1:
    end_idx = content.find('export default function SwipesPage()', start_idx)

swipe_card_code = """function SwipeCard({ 
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
    
    // Phase 4: Fluid Gestures (Velocity-based)
    const threshold = 120;
    const velocityX = info.velocity.x;
    
    if (info.offset.x > threshold || velocityX > 500) {
      await controls.start({ x: window.innerWidth, opacity: 0, rotate: 20, transition: { type: "spring", stiffness: 300, damping: 20 } });
      onSwipeRight();
    } else if (info.offset.x < -threshold || velocityX < -500) {
      await controls.start({ x: -window.innerWidth, opacity: 0, rotate: -20, transition: { type: "spring", stiffness: 300, damping: 20 } });
      onSwipeLeft();
    } else {
      // Phase 4: Heavy spring snap back
      controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 400, damping: 25 } });
    }
  };

  if (!isTop) {
    // Phase 4: Card Stacking Depth (VisionOS style)
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
      onTap={(e) => { 
        if (isDragging.current) return;
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('.no-flip')) return;
        setFlipped(!flipped); 
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
            
            {/* Rich Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

            {/* SWAP indicator */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-12 left-8 px-8 py-3 rounded-full rotate-[-12deg] z-10 bg-[#34C759]/90 backdrop-blur-3xl shadow-[0_12px_40px_rgba(52,199,89,0.5)] flex items-center justify-center border-none"
            >
              <span className="text-white font-black text-4xl tracking-widest drop-shadow-sm">SWAP</span>
            </motion.div>

            {/* NOPE indicator */}
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-12 right-8 px-8 py-3 rounded-full rotate-[12deg] z-10 bg-[#FF3B30]/90 backdrop-blur-3xl shadow-[0_12px_40px_rgba(255,59,48,0.5)] flex items-center justify-center border-none"
            >
              <span className="text-white font-black text-4xl tracking-widest drop-shadow-sm">NOPE</span>
            </motion.div>
          </div>

          {/* Bottom Content Area */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end z-10 pointer-events-none">
            
            <div className="flex justify-between items-end gap-2">
              <div className="flex-1 pointer-events-auto">
                <h3 className="text-3xl font-extrabold text-white leading-tight drop-shadow-lg mb-1">{item.title}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                    <span className="text-[13px] font-bold text-white tracking-wide">
                      @{(() => {
                        const n = item.profiles?.name;
                        let desc: any = {};
                        let uni: any = {};
                        try { desc = JSON.parse(item.profiles?.description || "{}"); } catch(e) {}
                        try { uni = JSON.parse(item.profiles?.university || "{}"); } catch(e) {}
                        let un = desc.username || uni.username;
                        if (un) return un;
                        return n && n !== "SwapSoko User" ? n.toLowerCase().replace(/\s+/g, '') : "user";
                      })()}
                    </span>
                    {item.profiles?.isStudentVerified && (
                      <GraduationCap className="w-4 h-4 text-[#32ADE6]" />
                    )}
                  </div>
                  
                  {item.distanceKm !== undefined && (
                    <div className="bg-black/30 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1 shadow-sm">
                      <MapPin className="w-3 h-3 text-white/80" />
                      {item.distanceKm > 1000 ? "+1000 km" : item.distanceKm < 1 ? `${Math.round(item.distanceKm * 1000)} m` : `${item.distanceKm} km`}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-2">
                    {(() => {
                      if (wantItems.length > 0) {
                        return wantItems.slice(0, 2).map((w, idx) => (
                           <div key={idx} className="bg-white/20 backdrop-blur-xl text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-sm flex items-center gap-1">
                             <Repeat2 className="w-3 h-3 opacity-80" /> <span className="truncate max-w-[100px]">{w}</span>
                           </div>
                        ));
                      }
                      if (item.category?.name) {
                        return (
                          <div className="bg-[#34C759]/20 backdrop-blur-xl text-[#34C759] text-xs font-bold px-3 py-1.5 rounded-full border border-[#34C759]/30 shadow-sm">
                            {item.category.name}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  
                  <div className="flex items-center gap-2 relative z-50">
                    <ChameleonScore item={item} />
                    
                    {/* Info button triggers flip */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="no-flip w-9 h-9 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg hover:bg-white/30 transition-colors"
                      title="See Details"
                    >
                      <Info className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
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
        className="absolute inset-0 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.2)] flex flex-col pointer-events-auto overflow-hidden bg-black group"
      >
        {/* Background Image with heavy blur */}
        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
           <img src={img} className="absolute inset-0 w-full h-full object-cover blur-[40px] opacity-60 scale-125 saturate-150" />
           <div className="absolute inset-0 bg-black/40 backdrop-blur-[20px]" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-32 flex flex-col justify-start pt-8 relative z-10">
          
          <div className="flex items-start justify-between mb-6">
            <h3 className="font-extrabold text-white text-[32px] leading-tight drop-shadow-md text-center flex-1">{item.title}</h3>
            {/* Report button */}
            <button 
              onClick={(e) => { e.stopPropagation(); onReport?.(); }}
              onPointerDown={(e) => e.stopPropagation()}
              title="Report Listing"
              className="no-flip w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors shrink-0 ml-4"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {item.description && item.description.replace(/<!--[\s\S]*?-->/g, '').trim().length > 0 && (
            <div className="mb-6 px-2 text-center">
               {renderSpecialDetails(item.description, true)}
            </div>
          )}

          <div className="mb-6 flex justify-center">
            {(() => {
               const c = item.condition?.toLowerCase() || "";
               let bg = "bg-white/10", text = "text-white", border = "border-white/20";
               if (c.includes("new") || c.includes("mint")) { bg = "bg-[#34C759]/20"; text = "text-[#34C759]"; border = "border-[#34C759]/30"; }
               else if (c.includes("good") || c.includes("fair")) { bg = "bg-[#32ADE6]/20"; text = "text-[#32ADE6]"; border = "border-[#32ADE6]/30"; }
               else if (c.includes("used") || c.includes("poor")) { bg = "bg-[#FF9500]/20"; text = "text-[#FF9500]"; border = "border-[#FF9500]/30"; }
               return (
                 <div className="flex items-center gap-2 bg-white/5 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: text.replace('text-[', '').replace(']', '') === 'text-white' ? '#fff' : text.replace('text-', '') }} />
                   <span className={`text-[13px] font-bold tracking-wide uppercase ${text}`}>
                     Condition: {item.condition || "Not specified"}
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
                   <img src={imgUrl} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
                 </div>
              ))}
            </div>
          )}
          
        </div>

        {/* Unified Floating Action Bar (Spatial UI) */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-center">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-[30px] p-2 rounded-[2.5rem] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.3)] w-full max-w-sm">
            <button 
              onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="no-flip w-[60px] h-[60px] bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95 rounded-full font-bold flex items-center justify-center shrink-0 border border-transparent hover:border-white/20"
            >
              <Repeat2 className="w-6 h-6 opacity-80" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setFlipped(false); onSwipeRight(); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="no-flip flex-1 h-[60px] bg-[#34C759] text-white transition-all hover:brightness-110 active:scale-95 rounded-full font-extrabold shadow-[0_8px_20px_rgba(52,199,89,0.3)] flex items-center justify-center gap-2 text-[17px] tracking-tight"
            >
              <MessageCircle className="w-5 h-5 fill-white/20" /> Propose Swap
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);
}
"""

new_content = content[:start_idx] + swipe_card_code + content[end_idx:]

# Additionally, add Image Preview rendering at the bottom if missing
if "{/* Image Preview Overlay */}" not in new_content:
    closing_tag_idx = new_content.rfind('</motion.div>\n  );\n}')
    if closing_tag_idx != -1:
        overlay_code = """
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
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-0 sm:p-8 cursor-zoom-out"
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
              className="w-full h-full object-contain sm:rounded-[20px] shadow-2xl max-w-[95vw] max-h-[95vh]"
            />
          </motion.div>
        )}
      </AnimatePresence>
"""
        new_content = new_content[:closing_tag_idx] + overlay_code + new_content[closing_tag_idx:]

with open('/home/m3/ssok0/client/src/pages/Swipes.tsx', 'w') as f:
    f.write(new_content)
