import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, Send, Package, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ThinkingOrb } from "thinking-orbs";
import { Streamdown } from "streamdown";
import { ProposeSwapModal } from "./Swipes";

function GuruLoader({ state }: { state: "working" | "solving" | "searching" | "composing" | "weaving" }) {
  return (
    <div className="flex gap-2 mb-4 items-end">
      <div className="w-7 h-7 rounded-full bg-[#E9E9EB] flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
        <ThinkingOrb state={state === "working" ? "weaving" : state} size={20} theme="light" />
      </div>
      <div className="bg-[#E9E9EB] text-black px-4 py-3 rounded-2xl rounded-bl-sm max-w-[75%] relative flex items-center gap-2">
        <ThinkingOrb state={state} size={20} theme="light" />
        <span className="text-[15px]">
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
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-[20px] text-[15px] leading-[22px] shadow-sm ${
          isUser
            ? "bg-[#34C759] text-white rounded-br-[4px]"
            : "bg-[#E9E9EB] text-black rounded-bl-[4px]"
        }`}
      >
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-black prose-p:leading-[22px]">
            <Streamdown>{msg.content}</Streamdown>
            
            {/* Render tagged listings if they exist */}
            {msg.listings && msg.listings.length > 0 && (
              <div className="mt-3 space-y-2">
                {msg.listings.map((l, i) => {
                   let imgs: string[] = [];
                   if (Array.isArray(l.images)) imgs = l.images;
                   else if (typeof l.images === 'string') { try { imgs = JSON.parse(l.images); } catch(e) { imgs = [l.images]; } }
                   const img = imgs[0] || null;
                   
                   return (
                     <div key={i} className="flex items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                           {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-400"/></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[13px] font-semibold text-black truncate">{l.title}</p>
                           <p className="text-[11px] text-gray-500 truncate">By {l.profiles?.name || 'User'}</p>
                        </div>
                        <button onClick={() => onPropose(l)} className="text-[11px] bg-[#34C759] text-white font-semibold px-3 py-1.5 rounded-full shrink-0">
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
    <div className="min-h-[100dvh] bg-white flex flex-col font-sans selection:bg-[#34C759]/30">
      {/* Apple-style Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 pt-2 pb-2 px-4 shadow-sm">
        <div className="flex items-center justify-between pt-2 max-w-[800px] mx-auto w-full">
          <button onClick={() => window.history.back()} className="text-[#34C759] flex items-center font-medium active:opacity-50 transition-opacity">
            <ChevronLeft className="w-6 h-6 -ml-2" />
            <span>Back</span>
          </button>
          
          <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
            <span className="text-[17px] font-semibold text-black leading-tight tracking-tight">Swap Guru</span>
            <span className="text-[11px] text-gray-500 font-medium">AI Assistant</span>
          </div>

          <button onClick={() => setMessages([{ role: "guru", content: getGreeting() }])} className="text-[#34C759] active:opacity-50 transition-opacity p-1">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 w-full max-w-[800px] mx-auto" style={{ paddingBottom: "100px" }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onPropose={(l) => setProposeListing(l)} />
          ))}
        </AnimatePresence>
        {isLoading && <GuruLoader state={orbState} />}
        <div ref={bottomRef} />
      </div>

      {/* Apple-style Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 pb-4">
        <div className="max-w-[800px] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 bg-[#F2F2F7] rounded-full flex items-center px-4 py-1.5 min-h-[40px] border border-transparent focus-within:border-gray-300 transition-colors">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Message Swap Guru"
              disabled={isLoading}
              className="flex-1 bg-transparent text-[15px] text-black placeholder-gray-500 outline-none w-full disabled:opacity-50 py-1"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !isLoading ? "bg-[#34C759]" : "bg-gray-200"
            }`}
          >
            <Send className={`w-[14px] h-[14px] ml-0.5 ${input.trim() && !isLoading ? "text-white" : "text-gray-400"}`} />
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
