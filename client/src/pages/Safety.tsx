import { motion } from "framer-motion";
import { ChevronLeft, Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Safety() {
  const [, navigate] = useLocation();

  const tips = [
    {
      icon: <CheckCircle className="text-green-500" size={20} />,
      title: "Meet in Public Spaces",
      desc: "Always arrange swaps in well-lit, highly populated public areas. Campus cafeterias, libraries, or near security stations during daylight hours are the safest spots. Never agree to meet at someone's private residence or in secluded locations."
    },
    {
      icon: <AlertTriangle className="text-orange-500" size={20} />,
      title: "Verify the Item Thoroughly",
      desc: "Take time to inspect the item before handing yours over. For electronics, turn them on, check battery health, and test ports. For clothing, check for undisclosed tears or stains. Don't let anyone rush you during the inspection."
    },
    {
      icon: <Shield className="text-blue-500" size={20} />,
      title: "Protect Your Privacy",
      desc: "Keep all communication strictly within the SwapSoko app chat. Do not share your personal phone number, home address, social media accounts, or financial details with strangers."
    },
    {
      icon: <Info className="text-purple-500" size={20} />,
      title: "Trust Your Instincts",
      desc: "If a deal feels too good to be true, or if the other party acts aggressively, changes the meeting location at the last minute, or refuses to let you inspect the item, walk away immediately. Your safety is worth more than any swap."
    },
    {
      icon: <CheckCircle className="text-emerald-500" size={20} />,
      title: "Bring a Friend",
      desc: "Whenever possible, bring a friend along to the swap. If you must go alone, inform someone you trust about where you are going, who you are meeting, and what time you expect to be back."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-b-[32px]">
        <button onClick={() => navigate("/")} className="w-10 h-10 flex items-center justify-center rounded-[20px] bg-gray-50 hover:bg-gray-100 transition-colors">
          <ChevronLeft size={24} className="text-[#0F172A]" />
        </button>
        <h1 className="text-lg font-black text-[#0F172A]">Safety First</h1>
      </div>

      <div className="p-4 pb-28 space-y-6">
        <motion.div 
          className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-black text-[#0F172A] mb-2">Your Safety Matters</h2>
          <p className="text-sm text-gray-500">
            SwapSoko is a community built on trust. Follow these guidelines to ensure every swap is safe, secure, and successful.
          </p>
        </motion.div>

        <div className="space-y-4">
          {tips.map((tip, idx) => (
            <motion.div 
              key={idx}
              className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 flex gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="shrink-0 mt-1">{tip.icon}</div>
              <div>
                <h3 className="font-bold text-[#0F172A] mb-1">{tip.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{tip.desc}</p>
              </div>
            </motion.div>
          ))}
          
          <motion.div 
            className="bg-[#EFF6FF] rounded-[32px] p-5 border border-[#BFDBFE] flex gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="shrink-0 mt-1"><Info className="text-blue-500" size={20} /></div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Use In-App Chat Only</h3>
              <p className="text-xs text-blue-800 leading-relaxed">Keep all communications on SwapSoko to ensure you have a record of the transaction in case of disputes.</p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
