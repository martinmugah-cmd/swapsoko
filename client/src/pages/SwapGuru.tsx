import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ArrowUp, Package, RefreshCw, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ThinkingOrb } from "thinking-orbs";
import { Streamdown } from "streamdown";
import { ProposeSwapModal } from "./Swipes";

function GuruLoader({ state }: { state: "working" | "solving" | "searching" | "composing" | "weaving" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 mb-6 items-end px-4"
    >
      <div className="w-8 h-8 rounded-full border border-gray-200 bg-[#FAFAFA] flex items-center justify-center flex-shrink-0 shadow-sm">
        <ThinkingOrb state={state === "working" ? "weaving" : state} size={16} theme="light" />
      </div>
      <div className="bg-[#FAFAFA] border border-gray-200 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-sm max-w-[75%] shadow-sm">
        <span className="text-[14px] font-medium text-gray-600">
          {state === "working" ? "Analyzing data..." : "Generating response..."}
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6 px-4`}
    >
      <div
        className={`max-w-[75%] px-5 py-3.5 text-[14px] leading-relaxed shadow-sm transition-all ${
          isUser
            ? "bg-[#0A0A0A] text-white rounded-2xl rounded-br-sm border border-black/10"
            : "bg-[#FFFFFF] text-gray-900 rounded-2xl rounded-bl-sm border border-gray-200/80"
        }`}
      >
        {isUser ? (
          <p className="font-medium tracking-tight text-[15px]">{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-700 prose-p:leading-relaxed prose-p:tracking-tight prose-strong:text-black prose-strong:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
            <Streamdown>{msg.content}</Streamdown>
            
            {msg.listings && msg.listings.length > 0 && (
              <div className="mt-4 space-y-2">
                {msg.listings.map((l, i) => {
                   let imgs: string[] = [];
                   if (Array.isArray(l.images)) imgs = l.images;
                   else if (typeof l.images === 'string') { try { imgs = JSON.parse(l.images); } catch(e) { imgs = [l.images]; } }
                   const img = imgs[0] || null;
                   
                   return (
                     <div key={i} className="flex items-center bg-[#FAFAFA] p-2 rounded-xl border border-gray-200/80 gap-3 group transition-colors hover:bg-gray-50">
                        <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-white shrink-0 border border-gray-100">
                           {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300"/></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[13px] font-semibold text-gray-900 truncate">{l.title}</p>
                           <p className="text-[12px] text-gray-500 truncate">By {l.profiles?.name || 'User'}</p>
                        </div>
                        <button 
                           onClick={() => onPropose(l)} 
                           className="text-[12px] bg-white border border-gray-200 text-gray-900 font-medium px-3 py-1.5 rounded-lg shrink-0 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95"
                        >
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

export default function SwapGuruPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Array<{ role: "user" | "guru"; content: string; listings?: any[] }>>([]);

  const getGreeting = useCallback(() => {
    const greetings = ["Rada", "Mambo", "Uko fiti", "Niambie", "Vipi", "Sasa"];
    const name = user?.name ? user.name.split(" ")[0] : "there";
    const randomG = greetings[Math.floor(Math.random() * greetings.length)];
    return `${randomG} ${name}. I'm Swap Guru.\n\nWhat are you looking to swap today?`;
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
      setMessages(prev => [...prev, { role: "guru", content: "An error occurred while processing your request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FFFFFF] flex flex-col font-sans selection:bg-gray-200">
      
      {/* Vercel/Linear Style Minimalist Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 pb-3 pt-3 px-4">
        <div className="max-w-[800px] mx-auto w-full flex items-center justify-between">
          <button 
            onClick={() => window.history.back()} 
            className="w-8 h-8 flex items-center justify-center rounded-md border border-transparent hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="w-5 h-5 rounded-[4px] bg-[#0A0A0A] flex items-center justify-center shadow-sm">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-[14px] font-semibold text-gray-900 tracking-tight">Swap Guru</span>
          </div>

          <button 
            onClick={() => setMessages([{ role: "guru", content: getGreeting() }])} 
            className="w-8 h-8 flex items-center justify-center rounded-md border border-transparent hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto w-full max-w-[800px] mx-auto pt-8 pb-[100px]">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onPropose={(l) => setProposeListing(l)} />
          ))}
        </AnimatePresence>
        {isLoading && <GuruLoader state={orbState} />}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Minimalist Floating Input Pill */}
      <div className="fixed bottom-6 left-4 right-4 z-40 max-w-[800px] md:mx-auto">
        <div className="bg-white rounded-full p-1.5 flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-200/80 transition-shadow focus-within:shadow-[0_8px_40px_rgb(0,0,0,0.12)] focus-within:border-gray-300">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask Swap Guru..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-[15px] font-medium text-gray-900 placeholder-gray-400 outline-none w-full disabled:opacity-50 px-4 py-2.5"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !isLoading 
                ? "bg-[#0A0A0A] text-white shadow-sm hover:scale-105 active:scale-95" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
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
                   setMessages(prev => [...prev, { role: "guru", content: `Proposal successfully delivered for **${proposeListing.title}**${offerStr}${bridgeStr}.` }]);
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
