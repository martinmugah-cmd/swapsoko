import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, Send, Sparkles, Package, RotateCcw } from "lucide-react";
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
      <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-white/10 mb-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />
        <ThinkingOrb state={state === "working" ? "weaving" : state} size={20} theme="dark" />
      </div>
      <div className="bg-white border border-slate-200 text-slate-800 px-5 py-3.5 rounded-[24px] rounded-bl-sm max-w-[75%] relative flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <ThinkingOrb state={state} size={20} theme="light" />
        <span className="text-[14px] font-medium tracking-wide">
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
            ? "bg-slate-900 text-white rounded-br-[4px] shadow-[0_8px_20px_rgba(0,0,0,0.1)] border border-slate-800"
            : "bg-white/90 backdrop-blur-xl text-slate-800 rounded-bl-[4px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60"
        }`}
      >
        
        {isUser ? (
          <p className="font-medium relative z-10">{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-slate-800 prose-p:leading-[24px] relative z-10 prose-strong:text-slate-900 prose-strong:font-bold prose-a:text-emerald-500">
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
                     <div key={i} className="flex items-center bg-slate-50 p-2 rounded-[20px] border border-slate-100 shadow-sm gap-3">
                        <div className="w-12 h-12 rounded-[14px] overflow-hidden bg-slate-100 shrink-0 border border-slate-200/50">
                           {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-slate-400"/></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[13px] font-bold text-slate-900 truncate">{l.title}</p>
                           <p className="text-[11px] font-medium text-slate-500 truncate">By {l.profiles?.name || 'User'}</p>
                        </div>
                        <motion.button 
                           whileTap={{ scale: 0.95 }}
                           onClick={() => onPropose(l)} 
                           className="text-[11px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-full shrink-0 transition-colors border border-emerald-100"
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
    let username = "there";
    try {
      const desc = JSON.parse(user?.university || "{}");
      username = desc.username || (user?.name ? user.name.split(" ")[0] : "there");
    } catch {
      username = user?.name ? user.name.split(" ")[0] : "there";
    }

    const greetings = [
      // English
      "Hey {name}! Ready to hunt for some deals?",
      "Welcome back {name}! What are we analyzing today?",
      "Greetings {name}! I'm Swap Guru, your ultimate trading assistant.",
      "Hello {name}! Let's find you the perfect swap.",
      // Gikomba Slang
      "Karibu kastoma, camera mkononi, bei ni maelewano!",
      "Oya mbogi, hapa tunaosha macho na mali safi!",
      "Sasa kiongozi! Mali ni wewe na mdomo wako!",
      "Rada {name}! Hapa ni bei ya jioni na mali ya asubuhi!",
      "Vipi {name}, mali imefika na ni ile safi. Una swapa nini leo?"
    ];
    
    let randomG = greetings[Math.floor(Math.random() * greetings.length)];
    randomG = randomG.replace("{name}", username);
    
    return `${randomG}\n\nI am **Swap Guru**. How can I help you today?`;
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
      
      {/* Dynamic Floating Header */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-2">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex items-center justify-between bg-white/70 backdrop-blur-3xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[24px] px-4 py-3 max-w-[800px] mx-auto w-full"
        >
          <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200/80 transition-colors text-slate-900">
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
          
          <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
            <h1 className="font-extrabold text-slate-900 text-[18px] flex items-center justify-center gap-1.5 tracking-tight">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Swap Guru
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">AI Assistant</p>
          </div>

          <button onClick={() => setMessages([{ role: "guru", content: getGreeting() }])} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200/80 transition-colors text-slate-900">
            <RotateCcw className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 w-full max-w-[800px] mx-auto relative z-10" style={{ paddingBottom: "120px" }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onPropose={(l) => setProposeListing(l)} />
          ))}
        </AnimatePresence>
        {isLoading && <GuruLoader state={orbState} />}
        <div ref={bottomRef} />
      </div>

      {/* Glassmorphic Input Bar */}
      <div className="fixed bottom-6 left-4 right-4 z-40 max-w-[800px] md:mx-auto">
        <motion.div 
          animate={isLoading ? {
            boxShadow: ["0px 12px 40px rgba(0,0,0,0.06)", "0px 12px 50px rgba(16,185,129,0.2)", "0px 12px 40px rgba(0,0,0,0.06)"],
            borderColor: ["rgba(255,255,255,0.4)", "rgba(16,185,129,0.5)", "rgba(255,255,255,0.4)"]
          } : {
            boxShadow: "0px 12px 40px rgba(0,0,0,0.08)",
            borderColor: "rgba(255,255,255,0.6)"
          }}
          transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "easeInOut" }}
          className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-2 flex items-center gap-2 border shadow-sm relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
          
          <div className="flex-1 bg-white/70 rounded-full flex items-center px-5 py-2.5 border border-white/80 shadow-inner relative z-10">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={isLoading ? "Swap Guru is thinking..." : "Message Swap Guru..."}
              disabled={isLoading}
              className="flex-1 bg-transparent text-[15px] font-semibold text-slate-800 placeholder-slate-400 outline-none w-full disabled:opacity-50 py-1"
            />
          </div>
          
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all relative z-10 ${
              input.trim() && !isLoading 
                ? "bg-gradient-to-br from-green-400 to-emerald-600 shadow-[0_4px_16px_rgba(16,185,129,0.4)] text-white border border-emerald-400/20" 
                : "bg-white border border-gray-200 text-gray-400"
            }`}
          >
            <Send className={`w-[18px] h-[18px] ml-0.5`} strokeWidth={2.5} />
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
