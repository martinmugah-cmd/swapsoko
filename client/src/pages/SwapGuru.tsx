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
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex gap-3 mb-6 items-end"
    >
      <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-white mb-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
        <ThinkingOrb state={state === "working" ? "weaving" : state} size={20} theme="light" />
      </div>
      <div className="bg-white/70 backdrop-blur-xl border border-white/90 text-slate-800 px-5 py-4 rounded-3xl rounded-bl-sm max-w-[75%] relative flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none rounded-3xl rounded-bl-sm" />
        <ThinkingOrb state={state} size={20} theme="light" />
        <span className="text-[15px] font-semibold text-slate-700">
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
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[75%] px-5 py-3.5 rounded-[24px] text-[15px] leading-[22px] shadow-sm relative overflow-hidden ${
          isUser
            ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-br-sm shadow-[0_8px_20px_rgba(52,211,153,0.25)] border border-white/20"
            : "bg-white/70 backdrop-blur-xl text-slate-800 rounded-bl-sm shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/90"
        }`}
      >
        {!isUser && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none rounded-[24px] rounded-bl-sm" />}
        
        {isUser ? (
          <p className="font-medium relative z-10">{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-slate-800 prose-p:leading-[24px] relative z-10 prose-strong:text-slate-900 prose-strong:font-bold">
            <Streamdown>{msg.content}</Streamdown>
            
            {/* Render tagged listings if they exist */}
            {msg.listings && msg.listings.length > 0 && (
              <div className="mt-4 space-y-2">
                {msg.listings.map((l, i) => {
                   let imgs: string[] = [];
                   if (Array.isArray(l.images)) imgs = l.images;
                   else if (typeof l.images === 'string') { try { imgs = JSON.parse(l.images); } catch(e) { imgs = [l.images]; } }
                   const img = imgs[0] || null;
                   
                   return (
                     <div key={i} className="flex items-center bg-white/80 p-2 rounded-[20px] border border-white/50 shadow-sm gap-3 backdrop-blur-md">
                        <div className="w-12 h-12 rounded-[14px] overflow-hidden bg-gray-100 shrink-0">
                           {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-400"/></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[13px] font-bold text-slate-900 truncate">{l.title}</p>
                           <p className="text-[11px] font-medium text-slate-500 truncate">By {l.profiles?.name || 'User'}</p>
                        </div>
                        <motion.button 
                           whileTap={{ scale: 0.95 }}
                           onClick={() => onPropose(l)} 
                           className="text-[11px] bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-bold px-3 py-1.5 rounded-full shrink-0 transition-colors"
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
    <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      
      {/* Subtle Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-emerald-400/20 rounded-full blur-[80px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-blue-400/10 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* VisionOS-style Frosted Header */}
      <div className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] pt-2 pb-2 px-4 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
        <div className="flex items-center justify-between pt-2 max-w-[800px] mx-auto w-full relative z-10">
          <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 border border-white shadow-sm transition-all text-slate-600">
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
          
          <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full border border-white shadow-sm mb-0.5">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-600">AI Guru</span>
            </div>
          </div>

          <button onClick={() => setMessages([{ role: "guru", content: getGreeting() }])} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 border border-white shadow-sm transition-all text-slate-600">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 w-full max-w-[800px] mx-auto relative z-10" style={{ paddingBottom: "120px" }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onPropose={(l) => setProposeListing(l)} />
          ))}
        </AnimatePresence>
        {isLoading && <GuruLoader state={orbState} />}
        <div ref={bottomRef} />
      </div>

      {/* Floating Glass Input Bar */}
      <div className="fixed bottom-6 left-4 right-4 z-40 max-w-[800px] md:mx-auto">
        <motion.div 
          animate={isLoading ? {
            boxShadow: ["0px 12px 40px rgba(0,0,0,0.06)", "0px 12px 50px rgba(52,211,153,0.2)", "0px 12px 40px rgba(0,0,0,0.06)"],
            borderColor: ["rgba(255,255,255,0.8)", "rgba(255,255,255,1)", "rgba(255,255,255,0.8)"]
          } : {
            boxShadow: "0px 12px 40px rgba(0,0,0,0.06)",
            borderColor: "rgba(255,255,255,0.8)"
          }}
          transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "easeInOut" }}
          className="bg-white/70 backdrop-blur-2xl rounded-full p-2 flex items-center gap-2 border shadow-sm relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none" />
          <div className="flex-1 bg-white/60 rounded-full flex items-center px-5 py-2 border border-white/50 shadow-inner relative z-10">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={isLoading ? "Swap Guru is thinking..." : "Message Swap Guru..."}
              disabled={isLoading}
              className="flex-1 bg-transparent text-[15px] font-medium text-slate-800 placeholder-slate-400 outline-none w-full disabled:opacity-50 py-1"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all relative z-10 ${
              input.trim() && !isLoading 
                ? "bg-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.4)] text-white" 
                : "bg-white border border-gray-200 text-gray-400"
            }`}
          >
            <Send className={`w-[18px] h-[18px] ml-0.5`} />
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
