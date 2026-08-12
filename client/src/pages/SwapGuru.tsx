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
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      className="flex gap-4 mb-10 items-end relative z-10"
    >
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-100 mb-1 relative overflow-hidden">
        <ThinkingOrb state={state === "working" ? "weaving" : state} size={24} theme="light" />
      </div>
      <div className="p-1.5 rounded-[2rem] rounded-bl-xl bg-black/5 backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] max-w-[75%] border border-white/60">
        <div className="bg-white/90 px-6 py-4 rounded-[1.6rem] rounded-bl-[8px] relative flex items-center gap-3 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
          <ThinkingOrb state={state} size={20} theme="light" />
          <span className="text-[15px] font-semibold tracking-tight text-slate-600">
            {state === "working" ? "Calculating valuation..." : "Thinking deeply..."}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onPropose }: { msg: { role: "user" | "guru"; content: string; listings?: any[] }, onPropose: (l: any) => void }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-8 relative z-10`}
    >
      {isUser ? (
        <div className="p-1.5 rounded-[2rem] rounded-br-xl bg-emerald-500/10 backdrop-blur-2xl shadow-[0_16px_40px_rgba(52,211,153,0.15)] max-w-[80%] border border-emerald-500/20">
          <div className="bg-gradient-to-br from-emerald-400 to-green-500 text-white px-6 py-4 rounded-[1.6rem] rounded-br-[8px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <p className="font-semibold text-[15px] leading-[24px] tracking-tight">{msg.content}</p>
          </div>
        </div>
      ) : (
        <div className="p-1.5 rounded-[2.5rem] rounded-bl-xl bg-black/[0.03] backdrop-blur-3xl shadow-[0_24px_50px_rgba(0,0,0,0.06)] max-w-[85%] border border-white/60">
          <div className="bg-white/95 px-7 py-6 rounded-[2.1rem] rounded-bl-[8px] shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
            <div className="prose prose-sm max-w-none text-slate-700 prose-p:leading-[28px] prose-p:text-[15px] prose-p:tracking-tight prose-strong:text-slate-900 prose-strong:font-extrabold prose-a:text-emerald-500 prose-a:font-bold prose-a:no-underline">
              <Streamdown>{msg.content}</Streamdown>
              
              {msg.listings && msg.listings.length > 0 && (
                <div className="mt-6 space-y-3">
                  {msg.listings.map((l, i) => {
                     let imgs: string[] = [];
                     if (Array.isArray(l.images)) imgs = l.images;
                     else if (typeof l.images === 'string') { try { imgs = JSON.parse(l.images); } catch(e) { imgs = [l.images]; } }
                     const img = imgs[0] || null;
                     
                     return (
                       <div key={i} className="p-1 rounded-[1.5rem] bg-black/[0.02] border border-black/[0.04]">
                         <div className="flex items-center bg-white p-2 rounded-[1.2rem] shadow-sm gap-4">
                            <div className="w-16 h-16 rounded-[1rem] overflow-hidden bg-slate-50 shrink-0 border border-black/[0.04]">
                               {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300"/></div>}
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                               <p className="text-[14px] font-bold text-slate-900 truncate tracking-tight">{l.title}</p>
                               <p className="text-[12px] font-medium text-slate-400 truncate mt-0.5">By {l.profiles?.name || 'User'}</p>
                            </div>
                            <button 
                               onClick={() => onPropose(l)} 
                               className="group p-1 rounded-full bg-black/5 hover:bg-black/10 transition-colors mr-1"
                            >
                               <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(52,211,153,0.3)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-active:scale-90 group-hover:scale-105">
                                 <ChevronLeft className="w-5 h-5 rotate-180" strokeWidth={2.5} />
                               </div>
                            </button>
                         </div>
                       </div>
                     );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
    <div className="min-h-[100dvh] bg-[#F9FAFB] flex flex-col font-sans selection:bg-emerald-500/20 relative overflow-hidden">
      
      {/* Soft Structuralism Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-white rounded-full blur-[100px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[20%] left-[-10%] w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] bg-emerald-50/50 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Floating Glass Island Header */}
      <div className="sticky top-4 z-40 px-4 max-w-[800px] mx-auto w-full">
        <motion.div 
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
          className="p-1.5 rounded-[2.5rem] bg-black/[0.03] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-white/60 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
          <div className="bg-white/80 px-4 py-3 rounded-[2.1rem] flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,1)] relative z-10">
            
            <button 
              onClick={() => window.history.back()} 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors text-slate-600 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 -ml-0.5" strokeWidth={2.5} />
            </button>
            
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-full px-4 py-1.5 bg-emerald-50 text-[10px] font-black tracking-[0.2em] uppercase text-emerald-600 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> AI Assistant
              </div>
              <h1 className="text-[18px] font-extrabold text-slate-900 tracking-tight leading-none">Swap Guru</h1>
            </div>

            <button 
              onClick={() => setMessages([{ role: "guru", content: getGreeting() }])} 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors text-slate-600 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
            </button>

          </div>
        </motion.div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-12 w-full max-w-[800px] mx-auto relative z-10" style={{ paddingBottom: "160px" }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onPropose={(l) => setProposeListing(l)} />
          ))}
        </AnimatePresence>
        {isLoading && <GuruLoader state={orbState} />}
        <div ref={bottomRef} className="h-10" />
      </div>

      {/* Double-Bezel Floating Input Island */}
      <div className="fixed bottom-6 left-4 right-4 z-40 max-w-[800px] md:mx-auto">
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
          className="p-2 bg-white/40 backdrop-blur-[32px] rounded-[3rem] shadow-[0_24px_50px_rgba(0,0,0,0.06)] border border-white/60 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
          
          <div className="bg-white rounded-[2.5rem] flex items-center px-4 py-2 border border-black/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] relative z-10 transition-colors duration-500 group-focus-within:border-black/10">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={isLoading ? "Swap Guru is calculating..." : "Ask Swap Guru to find or evaluate..."}
              disabled={isLoading}
              className="flex-1 bg-transparent text-[16px] font-semibold tracking-tight text-slate-900 placeholder-slate-400 outline-none w-full disabled:opacity-50 py-3 px-3"
            />
            
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="group/btn p-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors shrink-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-active/btn:scale-[0.85] group-hover/btn:scale-[1.05] ${
                input.trim() && !isLoading 
                  ? "bg-slate-900 text-white shadow-slate-900/30" 
                  : "bg-slate-200 text-slate-400 shadow-none"
              }`}>
                <Send className="w-5 h-5 ml-1 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" strokeWidth={2.5} />
              </div>
            </button>

          </div>
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
