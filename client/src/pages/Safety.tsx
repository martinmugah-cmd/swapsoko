import { useState, useCallback } from "react";
import { ChevronLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { Liquid } from "liquid-gooey";
import { motion, AnimatePresence } from "framer-motion";
import { safetyTips } from "./safetyTips";

export default function Safety() {
  const [, navigate] = useLocation();
  const [tipOpen, setTipOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState(safetyTips[0]);

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
    <div className="min-h-[100dvh] bg-[#F5F5F7] font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Sleek Minimalist Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-black/[0.04] px-4 py-3 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => navigate("/")} 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
        >
          <ChevronLeft size={24} className="text-black -ml-0.5" />
        </button>
        <h1 className="text-[17px] font-semibold text-black tracking-tight">Trust & Safety</h1>
        <div className="w-10 h-10" />
      </div>

      <div className="flex flex-col items-center justify-center h-[calc(100dvh-140px)] relative">
        <div className="text-center mb-16 px-6 relative z-10">
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }} 
             animate={{ scale: 1, opacity: 1 }} 
             transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
             className="w-16 h-16 rounded-[20px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center mx-auto mb-5 border border-black/[0.04]"
          >
             <ShieldCheck size={32} strokeWidth={2} className="text-emerald-500" />
          </motion.div>
          <h2 className="text-[28px] font-semibold text-black tracking-tight mb-2">Safety Core</h2>
          <p className="text-[15px] text-[#86868B] max-w-[280px] mx-auto leading-relaxed">
            Tap the core to extract vital security guidelines for a perfect trade.
          </p>
        </div>

        {/* Gooey Interaction Area */}
        <div className="relative w-full max-w-[400px] h-[300px] flex items-end justify-center pb-10">
          {/* We use liquid-gooey with a beautiful sleek black look */}
          <Liquid blur={12} contrast={24} fill="#111111" shadow="0 16px 40px rgba(0,0,0,0.2)">
            
            {/* The Modal Droplet */}
            <Liquid.Item 
               morph={{ shape: true }}
               x={0} 
               y={tipOpen ? -140 : 0} 
               transition={{ type: "spring", stiffness: 280, damping: 25, mass: 1.2 }}
               className="pointer-events-auto"
            >
              <div 
                className={`relative flex flex-col items-center justify-center overflow-hidden transition-all duration-[600ms] ${
                  tipOpen ? 'w-[320px] h-[220px] rounded-[40px]' : 'w-[80px] h-[80px] rounded-full'
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                <AnimatePresence>
                  {tipOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="absolute inset-0 flex flex-col p-8 text-center"
                    >
                      <h3 className="text-[20px] font-bold text-white mb-3 tracking-tight">{currentTip.title}</h3>
                      <p className="text-[14px] text-white/80 leading-relaxed font-medium mb-auto">
                        {currentTip.desc}
                      </p>
                      
                      <button 
                        onClick={handleNext}
                        className="mx-auto mt-4 w-12 h-12 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full flex items-center justify-center transition-colors border border-white/10"
                      >
                        <RefreshCw size={20} className="text-white" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Liquid.Item>

            {/* The Base Core */}
            <Liquid.Item x={0} y={0}>
               <button 
                 onClick={handleTap}
                 className="w-[100px] h-[100px] rounded-full relative active:scale-95 transition-transform duration-300"
               >
                  <AnimatePresence>
                    {!tipOpen && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="text-white text-[13px] font-bold tracking-widest uppercase">Tap</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </button>
            </Liquid.Item>
            
          </Liquid>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <p className="text-[11px] font-semibold text-[#86868B] tracking-[0.2em] uppercase">SwapSoko Secure Trading</p>
      </div>
    </div>
  );
}
