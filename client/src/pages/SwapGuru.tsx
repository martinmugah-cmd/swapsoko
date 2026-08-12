import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ArrowUp, Package, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ThinkingOrb } from "thinking-orbs";
import { Streamdown } from "streamdown";
import { ProposeSwapModal } from "./Swipes";

function GuruLoader({ state }: { state: "working" | "solving" | "searching" | "composing" | "weaving" }) {
  return (
    <div className="flex gap-2 mb-4 items-end px-2">
      <div className="w-8 h-8 rounded-full bg-[#E9E9EB] flex items-center justify-center flex-shrink-0">
        <ThinkingOrb state={state === "working" ? "weaving" : state} size={20} theme="light" />
      </div>
      <div className="bg-[#E9E9EB] text-black px-4 py-2.5 rounded-[20px] rounded-bl-none max-w-[75%]">
        <span className="text-[15px] font-normal tracking-tight">
          {state === "working" ? "Calculating..." : "Thinking..."}
        </span>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onPropose }: { msg: { role: "user" | "guru"; content: string; listings?: any[] }, onPropose: (l: any) => void }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 px-2`}
    >
      <div
        className={`max-w-[80%] px-4 py-2.5 text-[17px] leading-[22px] tracking-[-0.41px] shadow-sm ${
          isUser
            ? "bg-[#34C759] text-white rounded-[20px] rounded-br-[4px]"
            : "bg-[#E9E9EB] text-black rounded-[20px] rounded-bl-[4px]"
        }`}
      >
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div className="prose prose-p:my-0 prose-p:leading-[22px] prose-p:tracking-[-0.41px] text-black max-w-none prose-a:text-[#007AFF] prose-strong:font-semibold">
            <Streamdown>{msg.content}</Streamdown>
            
            {msg.listings && msg.listings.length > 0 && (
              <div className="mt-3 space-y-2">
                {msg.listings.map((l, i) => {
                   let imgs: string[] = [];
                   if (Array.isArray(l.images)) imgs = l.images;
                   else if (typeof l.images === 'string') { try { imgs = JSON.parse(l.images); } catch(e) { imgs = [l.images]; } }
                   const img = imgs[0] || null;
                   
                   return (
                     <div key={i} className="flex items-center bg-white p-2 rounded-xl border border-[#D1D1D6] gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F2F2F7] shrink-0">
                           {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-[#AEAEB2]"/></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[15px] font-semibold text-black truncate tracking-tight">{l.title}</p>
                           <p className="text-[13px] text-[#8E8E93] truncate">By {l.profiles?.name || 'User'}</p>
                        </div>
                        <button 
                           onClick={() => onPropose(l)} 
                           className="text-[13px] bg-[#E9E9EB] text-[#007AFF] font-semibold px-3 py-1.5 rounded-full shrink-0"
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
    <div className="min-h-[100dvh] bg-[#FFFFFF] flex flex-col font-sans">
      
      {/* iOS Nav Bar */}
      <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-[20px] border-b border-[#3C3C43]/20 pb-2 px-2 pt-2">
        <div className="max-w-[800px] mx-auto w-full flex items-center justify-between h-[44px]">
          <button 
            onClick={() => window.history.back()} 
            className="text-[#34C759] flex items-center h-full active:opacity-50 transition-opacity"
          >
            <ChevronLeft className="w-7 h-7 -ml-2 font-medium" />
            <span className="text-[17px] -ml-1 tracking-tight">Back</span>
          </button>
          
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-[17px] font-semibold text-black tracking-[-0.41px]">Swap Guru</span>
          </div>

          <button 
            onClick={() => setMessages([{ role: "guru", content: getGreeting() }])} 
            className="text-[#34C759] active:opacity-50 transition-opacity h-full px-2"
          >
            <RotateCcw className="w-[22px] h-[22px]" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto w-full max-w-[800px] mx-auto pt-4 pb-[90px]">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onPropose={(l) => setProposeListing(l)} />
          ))}
        </AnimatePresence>
        {isLoading && <GuruLoader state={orbState} />}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* iOS Messages Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#F6F6F6]/90 backdrop-blur-[20px] border-t border-[#3C3C43]/20 pb-safe">
        <div className="max-w-[800px] mx-auto px-4 py-2.5 flex items-end gap-3">
          <div className="flex-1 bg-white rounded-[20px] flex items-center pl-4 pr-1 py-1 min-h-[38px] border border-[#C6C6C8]">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Message"
              disabled={isLoading}
              className="flex-1 bg-transparent text-[17px] text-black placeholder-[#3C3C43]/50 outline-none w-full disabled:opacity-50 py-1 tracking-[-0.41px]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ml-2 ${
                input.trim() && !isLoading ? "bg-[#34C759]" : "bg-[#E5E5EA]"
              }`}
            >
              <ArrowUp className={`w-5 h-5 ${input.trim() && !isLoading ? "text-white" : "text-[#AEAEC0]"}`} strokeWidth={2.5} />
            </button>
          </div>
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
