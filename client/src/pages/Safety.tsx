import { useState, useCallback, useRef } from "react";
import { ChevronLeft, ShieldCheck, RefreshCw, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { Liquid } from "liquid-gooey";
import { motion, AnimatePresence } from "framer-motion";
import { safetyTips } from "./safetyTips";

export default function Safety() {
  const [, navigate] = useLocation();
  const [tipOpen, setTipOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState(safetyTips[0]);
  const constraintsRef = useRef(null);

  const handleTap = useCallback(() => {
    if (tipOpen) {
      setTipOpen(false);
      setTimeout(() => {
        setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]);
      }, 300);
    } else {
      setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]);
      setTipOpen(true);
    }
  }, [tipOpen]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTipOpen(false);
    setTimeout(() => {
      setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]);
      setTipOpen(true);
    }, 400);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] font-sans selection:bg-emerald-500/30 overflow-hidden relative flex flex-col">
      {/* Webapp Theme Dark Squircle Header */}
      <div 
        className="sticky top-4 z-50 mx-4 rounded-3xl px-4 py-4 border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden mb-8"
        style={{ background: "linear-gradient(145deg, #09090B 0%, #18181B 100%)", backdropFilter: "blur(24px)" }}
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
        <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }} 
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
           className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500 rounded-full blur-[40px] pointer-events-none" 
        />
        
        <div className="flex items-center justify-between relative z-10 max-w-[800px] mx-auto w-full">
          <button onClick={() => navigate("/")} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 shadow-sm transition-all text-white">
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
          
          <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
            <h1 className="font-extrabold text-white text-lg flex items-center justify-center gap-1.5 drop-shadow-md tracking-tight">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Safety
            </h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Guidelines</p>
          </div>

          <div className="w-10 h-10" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10" ref={constraintsRef}>
        
        {/* Animated Title */}
        <div className="text-center mb-10 px-6 absolute top-10 pointer-events-none z-0">
          <h2 className="text-[32px] font-black text-slate-900 tracking-tight mb-2 drop-shadow-sm">Protect Your Trade</h2>
          <p className="text-[15px] text-slate-500 max-w-[280px] mx-auto leading-relaxed font-medium">
            Drag the core. Tap to reveal a vital safety tip.
          </p>
        </div>

        {/* Gooey Interaction Area - Expanded for dragging */}
        <div className="fixed inset-0 top-24 bottom-10 flex items-center justify-center overflow-visible pointer-events-none">
          {/* We use liquid-gooey with a beautiful emerald gradient/color */}
          <Liquid blur={14} contrast={24} fill="#0f172a" shadow="0 24px 50px -12px rgba(15,23,42,0.5)" className="w-full h-full pointer-events-none absolute inset-0 flex items-center justify-center">
            
            {/* The Draggable Base Core */}
            <Liquid.Item morph={{ shape: true }}>
               <motion.div
                 drag
                 dragConstraints={constraintsRef}
                 dragElastic={0.2}
                 whileTap={{ scale: 0.9 }}
                 whileDrag={{ scale: 1.1 }}
                 onClick={handleTap}
                 className="w-20 h-20 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-auto"
               >
                  <AnimatePresence>
                    {!tipOpen && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Zap size={28} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
               </motion.div>
            </Liquid.Item>

            {/* The Modal Droplet that morphs out of the core */}
            <Liquid.Item 
               morph={{ shape: true }}
               x={0} 
               y={tipOpen ? -130 : 0} 
               transition={{ stiffness: 350, damping: 25, mass: 1.2 }}
               className="pointer-events-auto z-50"
            >
              <div 
                className={`relative flex flex-col items-center justify-center overflow-hidden transition-all duration-[500ms] ${
                  tipOpen ? 'w-[320px] h-[220px] rounded-[36px]' : 'w-[80px] h-[80px] rounded-full scale-0'
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.2, 1, 0.3, 1)" }}
              >
                <AnimatePresence>
                  {tipOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="absolute inset-0 flex flex-col p-6 text-center"
                    >
                      <h3 className="text-[18px] font-black text-white mb-2 tracking-tight leading-tight">{currentTip.title}</h3>
                      <p className="text-[14px] text-slate-300 leading-relaxed font-medium mb-auto px-2">
                        {currentTip.desc}
                      </p>
                      
                      <div className="flex gap-3 justify-center mt-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setTipOpen(false); }}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 active:bg-white/20 rounded-full text-white text-[13px] font-bold transition-colors border border-white/10"
                        >
                          Close
                        </button>
                        <button 
                          onClick={handleNext}
                          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 rounded-full text-white text-[13px] font-bold transition-colors shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                        >
                          Next Tip
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Liquid.Item>

          </Liquid>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase drop-shadow-sm">SwapSoko Secure Trading</p>
      </div>
    </div>
  );
}
