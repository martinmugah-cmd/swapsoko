import re

with open('/home/m3/ssok0/client/src/pages/Swipes.tsx', 'r') as f:
    content = f.read()

# Fix NOPE indicator
content = re.sub(
    r'<motion\.div[^>]+opacity: nopeOpacity[^>]+>.*?<span[^>]+>NOPE</span>\s*</motion\.div>',
    r'''<motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-12 right-8 px-8 py-3 rounded-full rotate-[12deg] z-10 bg-[#FF3B30]/90 backdrop-blur-3xl shadow-[0_12px_40px_rgba(255,59,48,0.5)] flex items-center justify-center border-none"
            >
              <span className="text-white font-black text-4xl tracking-widest drop-shadow-sm">NOPE</span>
            </motion.div>''',
    content,
    flags=re.DOTALL
)

# Fix backface logic
content = re.sub(
    r'\{/\* Report button \*/\}.*?\{/\* Floating Action Buttons \*/\}.*?</button>\s+</div>\s+</div>',
    r'''{/* Report button */}
              <button 
                onClick={(e) => { e.stopPropagation(); onReport?.(); }}
                onPointerDown={(e) => e.stopPropagation()}
                title="Report Listing"
                className="no-flip w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors"
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
        {/* Background Image with heavy blur */}
        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
           <img src={img} className="absolute inset-0 w-full h-full object-cover blur-[40px] opacity-60 scale-125 saturate-150" />
           <div className="absolute inset-0 bg-black/40 backdrop-blur-[20px]" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-32 flex flex-col justify-start pt-8 relative z-10">
          
          <h3 className="font-extrabold text-white text-[32px] leading-tight mb-6 drop-shadow-md text-center">{item.title}</h3>
          
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
      </div>''',
    content,
    flags=re.DOTALL
)

# Add onReport and onImageClick to SwipeCard usage in SwipesPage
content = re.sub(
    r'cycleCount=\{([^}]+)\}\s+/>\s+\)\)\}\s+</AnimatePresence>',
    r'''cycleCount={\1}
                      onReport={() => setReportingItem(item)}
                      onImageClick={(url) => setPreviewImage(url)}
                    />
                  ))}
                </AnimatePresence>''',
    content
)

# Add ReportModal and ImagePreview modal at the end
content = re.sub(
    r'<FilterSheet([^>]+)/>\s+</motion\.div>\s+\);\s+\}',
    r'''<FilterSheet\1/>
      
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
              className="w-full h-full object-contain sm:rounded-[20px] shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}''',
    content
)

with open('/home/m3/ssok0/client/src/pages/Swipes.tsx', 'w') as f:
    f.write(content)
