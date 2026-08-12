import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, Send, Package, RotateCcw, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ThinkingOrb } from "thinking-orbs";
import { Streamdown } from "streamdown";
import { ProposeSwapModal } from "./Swipes";

function GuruLoader({ state }: { state: "working" | "solving" | "searching" | "composing" | "weaving" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex gap-3 mb-8 items-end relative z-10"
    >
      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(52,211,153,0.15)] border border-white/10 mb-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-50" />
        <ThinkingOrb state={state === "working" ? "weaving" : state} size={24} theme="dark" />
      </div>
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 text-white px-5 py-4 rounded-[24px] rounded-bl-sm max-w-[75%] relative flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
        <ThinkingOrb state={state} size={20} theme="dark" />
        <span className="text-[15px] font-medium tracking-wide text-white/90">
          {state === "working" ? "Calculating valuation..." : "Swap Guru is thinking..."}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onPropose }: { msg: { role: "user" | "guru"; content: string; listings?: any[] }, onPropose: (l: any) => void }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6 relative z-10`}
    >
      <div
        className={`max-w-[80%] px-5 py-4 rounded-[28px] text-[15px] leading-[24px] shadow-lg relative overflow-hidden ${
          isUser
            ? "bg-gradient-to-br from-emerald-400 to-green-500 text-[#022c22] rounded-br-[8px] shadow-[0_10px_30px_rgba(52,211,153,0.3)] border border-emerald-300"
            : "bg-[#18181B]/60 backdrop-blur-2xl text-white rounded-bl-[8px] shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-white/10"
        }`}
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none" />
        
        {isUser ? (
          <p className="font-semibold relative z-10">{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-200 prose-p:leading-[26px] relative z-10 prose-strong:text-white prose-strong:font-bold prose-a:text-emerald-400">
            <Streamdown>{msg.content}</Streamdown>
            
            {msg.listings && msg.listings.length > 0 && (
              <div className="mt-5 space-y-3">
                {msg.listings.map((l, i) => {
                   let imgs: string[] = [];
                   if (Array.isArray(l.images)) imgs = l.images;
                   else if (typeof l.images === 'string') { try { imgs = JSON.parse(l.images); } catch(e) { imgs = [l.images]; } }
                   const img = imgs[0] || null;
                   
                   return (
                     <div key={i} className="flex items-center bg-black/40 p-2.5 rounded-[22px] border border-white/10 shadow-inner gap-3 backdrop-blur-md">
                        <div className="w-14 h-14 rounded-[16px] overflow-hidden bg-gray-900 shrink-0 border border-white/5">
                           {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-600"/></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[14px] font-bold text-white truncate">{l.title}</p>
                           <p className="text-[12px] font-medium text-gray-400 truncate">By {l.profiles?.name || 'User'}</p>
                        </div>
                        <motion.button 
                           whileTap={{ scale: 0.9 }}
                           onClick={() => onPropose(l)} 
                           className="text-[12px] bg-gradient-to-r from-emerald-500 to-green-500 shadow-[0_0_15px_rgba(52,211,153,0.3)] text-[#022c22] font-black px-4 py-2 rounded-full shrink-0 transition-transform"
                        >
                           Propose
                        </motion.button>
                     </div>
                   );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SwapGuruPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Array<{ role: "user" | "guru"; content: string; listings?: any[] }>>([]);

  const getGreeting = useCallback(() => {
    const greetings = ["Rada", "Mambo", "Uko fiti", "Niambie", "Vipi", "Sasa"];
    const name = user?.name ? user.name.split(" ")[0] : "there";
    const randomG = greetings[Math.floor(Math.random() * greetings.length)];
    return `${randomG} ${name}! I'm **Swap Guru**.\n\nWhat would you like to swap today?`;
  }, [user]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "guru", content: getGreeting() }]);
    }
  }, [user, messages.length, getGreeting]);

  const [proposeListing, setProposeListing] = useState<any>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orbState, setOrbState] = useState<"working" | "solving" | "searching" | "composing">("solving");
  const bottomRef = useRef<HTMLDivElement>(null);

  const askMutation = trpc.swapGuru.ask.useMutation();
  const sendProposal = trpc.proposals.send.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && messages.length <= 1 && !isLoading) {
       handleSend(q);
    }
  }, [messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const prompt = text || input.trim();
    if (!prompt || isLoading) return;

    if (!user) {
      setMessages(prev => [...prev,
        { role: "user", content: prompt },
        { role: "guru", content: "**Login required**\n\nPlease [login](/login) to use Swap Guru AI." }
      ]);
      return;
    }

    const lower = prompt.toLowerCase();
    const isCalculating = lower.includes("value") || lower.includes("worth") || lower.includes("price") || lower.includes("calculate");
    setOrbState(isCalculating ? "working" : "solving");

    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await askMutation.mutateAsync({ prompt });
      setMessages(prev => [...prev, { role: "guru" as const, content: String(result.response), listings: result.listings as any[] }]);
    } catch {
      setMessages(prev => [...prev, { role: "guru", content: "Sorry, I couldn't process that. Please try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#09090B] flex flex-col font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      
      {/* Hyper-vibrant Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-emerald-500/30 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] left-[-20%] w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] bg-indigo-600/20 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      </div>

      {/* VisionOS-style Frosted Header (Dark) */}
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-[32px] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] pt-2 pb-2 px-4 relative">
        <div className="flex items-center justify-between pt-2 max-w-[800px] mx-auto w-full relative z-10">
          <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 shadow-sm transition-all text-white">
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
          
          <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1.5 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 shadow-inner mb-0.5 backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]" />
              <span className="text-[11px] font-black tracking-widest uppercase text-emerald-400 drop-shadow-md">Swap Guru AI</span>
            </div>
          </div>

          <button onClick={() => setMessages([{ role: "guru", content: getGreeting() }])} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 shadow-sm transition-all text-white">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 w-full max-w-[800px] mx-auto relative z-10" style={{ paddingBottom: "130px" }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onPropose={(l) => setProposeListing(l)} />
          ))}
        </AnimatePresence>
        {isLoading && <GuruLoader state={orbState} />}
        <div ref={bottomRef} />
      </div>

      {/* Floating Glowing Input Bar */}
      <div className="fixed bottom-6 left-4 right-4 z-40 max-w-[800px] md:mx-auto">
        <motion.div 
          animate={isLoading ? {
            boxShadow: ["0px 12px 40px rgba(0,0,0,0.5)", "0px 12px 60px rgba(52,211,153,0.3)", "0px 12px 40px rgba(0,0,0,0.5)"],
            borderColor: ["rgba(255,255,255,0.1)", "rgba(52,211,153,0.5)", "rgba(255,255,255,0.1)"]
          } : {
            boxShadow: "0px 12px 50px rgba(0,0,0,0.6)",
            borderColor: "rgba(255,255,255,0.1)"
          }}
          transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "easeInOut" }}
          className="bg-[#18181B]/80 backdrop-blur-[32px] rounded-[32px] p-2 flex items-center gap-2 border shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
          <div className="flex-1 bg-black/40 rounded-[28px] flex items-center px-5 py-3 border border-white/5 shadow-inner relative z-10">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={isLoading ? "Swap Guru is thinking..." : "Message Swap Guru..."}
              disabled={isLoading}
              className="flex-1 bg-transparent text-[16px] font-medium text-white placeholder-gray-500 outline-none w-full disabled:opacity-50 py-1"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-14 h-14 shrink-0 rounded-[24px] flex items-center justify-center transition-all relative z-10 ${
              input.trim() && !isLoading 
                ? "bg-gradient-to-br from-emerald-400 to-green-500 shadow-[0_0_25px_rgba(52,211,153,0.5)] text-[#022c22]" 
                : "bg-white/5 border border-white/5 text-gray-500"
            }`}
          >
            <Send className={`w-[20px] h-[20px] ml-0.5`} strokeWidth={2.5} />
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {proposeListing && (
          <ProposeSwapModal listing={proposeListing} onClose={() => setProposeListing(null)} onSend={(msg, cash, opts) => {
             const toastId = toast.loading("Sending proposal...");
             sendProposal.mutate({
                listingId: proposeListing.id,
                userId: user?.id,
                toUserId: proposeListing.userId,
                message: msg,
                cashTopUp: cash,
                offerItems: opts?.offerItems || "",
             }, {
                onSuccess: () => {
                   toast.success("Proposal sent successfully!", { id: toastId });
                   let offerStr = opts?.offerItems ? ` offering **${opts.offerItems}**` : "";
                   let bridgeStr = cash > 0 ? ` with a KES ${cash} cash bridge` : "";
                   setMessages(prev => [...prev, { role: "guru", content: `Awesome! I've sent your proposal for **${proposeListing.title}**${offerStr}${bridgeStr}. They will receive a notification shortly.` }]);
                   setProposeListing(null);
                },
                onError: (err: any) => {
                   toast.error(err.message || "Failed to send proposal", { id: toastId });
                }
             });
          }} />
        )}
      </AnimatePresence>
    </div>
  );
}
