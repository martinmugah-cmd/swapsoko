import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, Shield, AlertTriangle, Eye, Lock, Users, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";

export default function Safety() {
  const [, navigate] = useLocation();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const tips = [
    {
      icon: <Users className="text-emerald-400" size={24} />,
      title: "Public Spaces Only",
      desc: "Always arrange swaps in well-lit, highly populated public areas. Campus cafeterias or libraries are the safest spots. Never agree to meet at someone's private residence.",
      color: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/20"
    },
    {
      icon: <Eye className="text-blue-400" size={24} />,
      title: "Inspect Everything",
      desc: "Take time to inspect the item before handing yours over. Test electronics, check for tears or stains. Don't let anyone rush you during the inspection.",
      color: "from-blue-500/20 to-blue-500/5",
      border: "border-blue-500/20"
    },
    {
      icon: <Lock className="text-purple-400" size={24} />,
      title: "Guard Your Privacy",
      desc: "Keep all communication strictly within the SwapSoko app chat. Do not share your personal phone number, home address, or social media accounts with strangers.",
      color: "from-purple-500/20 to-purple-500/5",
      border: "border-purple-500/20"
    },
    {
      icon: <AlertTriangle className="text-rose-400" size={24} />,
      title: "Trust Your Gut",
      desc: "If a deal feels too good to be true, or if the other party acts aggressively, walk away immediately. Your safety is worth infinitely more than any swap.",
      color: "from-rose-500/20 to-rose-500/5",
      border: "border-rose-500/20"
    },
    {
      icon: <MessageSquare className="text-indigo-400" size={24} />,
      title: "Keep it on App",
      desc: "Use the in-app chat only. This ensures you have a record of the transaction in case of disputes, and protects you from phishing.",
      color: "from-indigo-500/20 to-indigo-500/5",
      border: "border-indigo-500/20"
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#09090B] relative overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Background Ambient Orbs */}
      <motion.div style={{ y: y1 }} className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <motion.div style={{ y: y2 }} className="absolute top-[40%] -right-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate("/")} 
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xl shadow-lg transition-all"
        >
          <ChevronLeft size={24} className="text-white -ml-0.5" />
        </button>
      </div>

      <div className="px-5 pt-2 pb-32 relative z-10 max-w-[800px] mx-auto">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center mb-12 mt-4"
        >
          <div className="relative mb-6">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-full blur-2xl opacity-40"
            />
            <div className="w-24 h-24 rounded-[32px] bg-slate-900/80 backdrop-blur-xl border border-white/20 flex items-center justify-center relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <Shield size={44} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3 drop-shadow-md">
            Safety <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">First</span>
          </h1>
          <p className="text-slate-400 text-[15px] max-w-[280px] mx-auto leading-relaxed font-medium">
            SwapSoko is built on trust. Follow these golden rules to ensure your trades are completely secure.
          </p>
        </motion.div>

        {/* Tips List */}
        <div className="space-y-4">
          {tips.map((tip, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`bg-white/5 backdrop-blur-xl rounded-[28px] p-1 shadow-lg border border-white/10 relative overflow-hidden group cursor-default`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tip.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="bg-slate-900/95 rounded-[24px] p-5 relative z-10 flex gap-5 border border-white/5 h-full">
                <div className={`w-12 h-12 rounded-[16px] bg-slate-800/50 flex items-center justify-center shrink-0 border ${tip.border} shadow-inner group-hover:bg-slate-800 transition-colors`}>
                  {tip.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-[16px] mb-1.5 tracking-tight group-hover:text-emerald-300 transition-colors">{tip.title}</h3>
                  <p className="text-[13px] text-slate-400 leading-[1.6] font-medium">{tip.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.5 }}
           className="mt-14 text-center"
        >
           <p className="text-[10px] font-black text-slate-600 tracking-[0.25em] uppercase drop-shadow-sm">SwapSoko Secure Trading</p>
        </motion.div>

      </div>
    </div>
  );
}
