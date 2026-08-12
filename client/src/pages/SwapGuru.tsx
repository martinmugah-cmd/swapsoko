import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence, useAnimation, useCycle } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Send, Mic, RotateCcw, Sparkles, ArrowRight, Lock, Package, RefreshCw, Scale } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ThinkingOrb } from "thinking-orbs";
import { Streamdown } from "streamdown";
import { getLoginUrl } from "@/const";
import { ProposeSwapModal } from "./Swipes";

function GuruLoader({ state }: { state: "working" | "solving" | "searching" | "composing" | "weaving" }) {
  return (
    <div className="flex gap-3 mb-6">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 self-end mb-1 border border-white/10 shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
        <ThinkingOrb state={state === "working" ? "weaving" : state} size={20} theme="dark" />
      </div>
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl rounded-bl-[4px] px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-w-[80%] flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />
        <div className="flex items-center gap-2">
          <ThinkingOrb state={state} size={20} theme="dark" />
          <span className="text-[14px] font-medium text-white/90">
            {state === "working" ? "Calculating value..." : "Swap Guru is thinking..."}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onPropose }: { msg: { role: "user" | "guru"; content: string; listings?: any[] }, onPropose: (l: any) => void }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full gradient-green flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
          isUser
            ? "gradient-green text-white rounded-br-[4px]"
            : "apple-glass-dark text-white rounded-bl-[4px]"
        }`}
      >
        {isUser ? (
          <p className="text-sm">{msg.content}</p>
        ) : (
          <div className="text-sm prose prose-sm max-w-none">
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
                     <div key={i} className="flex items-center bg-gray-50 p-2 rounded-2xl border border-gray-100 gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0">
                           {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Package className="w-4 h-4 text-gray-300"/></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-xs font-bold text-slate-900 truncate">{l.title}</p>
                           <p className="text-xs text-gray-500 truncate">By {l.profiles?.name || 'User'}</p>
                        </div>
                        <button onClick={() => onPropose(l)} className="text-xs bg-green-500/10 text-green-500 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0 hover:bg-green-500/20 transition-colors">
                           Propose
                        </button>
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

// ─── Mode Selector ────────────────────────────────────────────────────────────
function ModeSelector({ mode, setMode }: { mode: string; setMode: (m: any) => void }) {
  const modes = [
    { id: "valuation", label: "Valuation", icon: <Package className="w-4 h-4" /> },
    { id: "rewrite", label: "Listing Helper", icon: <Sparkles className="w-4 h-4" /> },
    { id: "fairness", label: "Fairness Checker", icon: <Scale className="w-4 h-4" /> },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {modes.map(m => (
        <motion.button
          key={m.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode(m.id)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
            mode === m.id
              ? "bg-white text-[#09090B] shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span className={mode === m.id ? "text-green-500" : "text-gray-400"}>{m.icon}</span> {m.label}
        </motion.button>
      ))}
    </div>
  );
}

// ─── Swap Guru Page ───────────────────────────────────────────────────────────
export default function SwapGuruPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Array<{ role: "user" | "guru"; content: string; listings?: any[] }>>([]);

  const getGreeting = useCallback(() => {
    const greetings = ["Rada", "Mambo", "Uko fiti", "Niambie", "Vipi", "Sasa"];
    const name = user?.username || "there";
    const randomG = greetings[Math.floor(Math.random() * greetings.length)];
    return `${randomG} ${name}! I'm **Swap Guru**\n\nWhat would you like to swap today?`;
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
        { role: "guru", content: "**Login required**\n\nPlease [login](/login) to use Swap Guru AI. It's free and takes just a few seconds!" }
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8FAFC] flex flex-col"
    >
      {/* Premium Dark Squircle Header */}
      <div 
        className="sticky top-4 z-40 mx-4 mb-4 rounded-3xl px-4 py-4 border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #09090B 0%, #18181B 100%)", backdropFilter: "blur(24px)" }}
      >
        {/* Glow orbs */}
        <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} 
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
           className="absolute -top-16 -right-16 w-48 h-48 bg-green-500 rounded-full blur-[40px] pointer-events-none" 
        />
        <motion.div 
           animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.2, 0.15] }} 
           transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} 
           className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#6366F1] rounded-full blur-[40px] pointer-events-none" 
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-center">
              <h1 className="font-extrabold text-white text-lg flex items-center justify-center gap-1.5 drop-shadow-md">
                <Sparkles className="w-4 h-4 text-green-500" /> Swap Guru
              </h1>
              <p className="text-xs text-gray-400 font-medium tracking-wide">AI-POWERED INTELLIGENCE</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMessages([{ role: "guru", content: getGreeting() }])}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </motion.button>
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2 border-t border-white/5">
            {["Analyze value", "Find electronics", "Trade ideas"].map(chip => (
              <button 
                key={chip}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold text-gray-300 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-green-500" /> {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ paddingBottom: "120px" }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onPropose={(l) => setProposeListing(l)} />
          ))}
        </AnimatePresence>

        {isLoading && <GuruLoader state={orbState} />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[440px] z-40">
        <motion.div 
          animate={isLoading ? {
            boxShadow: ["0px 8px 30px rgba(0,0,0,0.12)", "0px 8px 40px rgba(34,197,94,0.4)", "0px 8px 30px rgba(0,0,0,0.12)"],
            borderColor: ["rgba(255,255,255,0.2)", "rgba(34,197,94,0.5)", "rgba(255,255,255,0.2)"]
          } : {
            boxShadow: "0px 12px 40px rgba(0,0,0,0.1)",
            borderColor: "rgba(255,255,255,0.2)"
          }}
          transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "easeInOut" }}
          className="glass rounded-3xl p-2 flex items-center gap-2 border"
        >
          <div className="flex-1 flex items-center bg-[#F8FAFC]/50 rounded-2xl px-4 py-2.5 border border-white">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={isLoading ? "SwapGuru is thinking..." : "E.g. I have a PS4 and I'm looking for a laptop"}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder-gray-400 outline-none w-full disabled:opacity-50"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all shadow-sm ${
              input.trim() && !isLoading ? "bg-green-500 shadow-[#22C55E]/30 shadow-md" : "bg-gray-100"
            }`}
          >
            <Send className={`w-4 h-4 ml-0.5 ${input.trim() && !isLoading ? "text-white" : "text-gray-400"}`} />
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
    </motion.div>
  );
}
