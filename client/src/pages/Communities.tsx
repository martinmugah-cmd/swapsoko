import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { ChevronLeft, Search, Users, Cpu, BookOpen, Gamepad2, Camera, Home, Stethoscope, GraduationCap, Plus, Check, Loader2, Image as ImageIcon, Heart, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";



// ─── Create Community Modal ───────────────────────────────────────────────────
function CreateSokoModal({ onClose, myProfile }: { onClose: () => void; myProfile: any; }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"public" | "campus" | "private">("public");
  const [inviteCode, setInviteCode] = useState("");
  const [icon, setIcon] = useState("Users");
  const { user } = useAuth();
  
  const createMutation = trpc.communities.create.useMutation();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setIcon(dataUrl);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    let myProfileIsStudentVerified = user?.metadata?.isStudentVerified === true || user?.user_metadata?.isStudentVerified === true;
    let myProfileUniversity = user?.metadata?.university || user?.user_metadata?.university || "";
    if (!myProfileIsStudentVerified && myProfile) {
      try {
        const u = JSON.parse(myProfile.university || "{}");
        const d = JSON.parse(myProfile.description || "{}");
        myProfileIsStudentVerified = u.isStudentVerified || d.isStudentVerified || myProfile.isStudentVerified || false;
        if (!myProfileUniversity) {
           myProfileUniversity = u.val || myProfile.university || "";
        }
        if (myProfileUniversity.startsWith('{')) myProfileUniversity = "";
      } catch(e) {}
    }

    if (!name.trim()) { toast.error("Please enter a name"); return; }
    if (type === "campus" && !myProfileIsStudentVerified) { toast.error("You must verify your student email during onboarding or in your profile to create a Campus Soko!"); return; }
    
    let finalDescription = description;
    if (type === "private" && inviteCode) {
      finalDescription = JSON.stringify({ text: description, inviteCode: inviteCode });
    }

    createMutation.mutate({ 
      name, 
      description: finalDescription, 
      type, 
      icon, 
      creatorId: user?.id,
      inviteCode: type === "private" ? inviteCode : null,
      university: type === "campus" ? myProfileUniversity : null
    }, {
      onSuccess: () => {
        toast.success(`Soko '${name}' created!`);
        utils.communities.list.invalidate();
        utils.communities.myMemberships.invalidate();
        onClose();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to create Soko");
      }
    });
  };

  const ICONS = ["Users", "GraduationCap", "Laptop", "BookOpen", "Gamepad2", "Stethoscope", "Camera", "Home"];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-[1050] flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-[480px] mx-auto bg-white rounded-t-[40px] sm:rounded-[40px] p-7 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-[linear-gradient(120deg,#e0c3fc_0%,#8ec5fc_100%)] opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
        
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 relative z-10" />
        
        <div className="flex items-center gap-5 mb-8 relative z-10">
          <motion.div 
            animate={{ y: [0, -4, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-white border border-slate-100 rounded-[20px] flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
          >
            <Users className="w-8 h-8 text-emerald-500" />
          </motion.div>
          <div>
            <h3 className="font-extrabold text-[26px] text-slate-900 tracking-tight leading-none">Create a Soko</h3>
            <p className="text-[15px] text-slate-500 font-medium mt-1">Start a new community space</p>
          </div>
        </div>
        
        <div className="space-y-6 relative z-10">
          <div>
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Soko Icon</label>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-7 px-7">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className={`w-16 h-16 rounded-[20px] flex items-center justify-center flex-shrink-0 snap-center shadow-sm transition-all duration-300 ${
                  icon && icon.startsWith('data:image') ? "bg-emerald-50 border border-emerald-500 text-emerald-600 shadow-[0_4px_20px_rgba(16,185,129,0.2)]" : "bg-slate-50 border border-slate-200 border-dashed text-slate-400 hover:border-slate-300"
                }`}
              >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : icon && icon.startsWith('data:image') ? <img src={icon} className="w-full h-full object-cover rounded-[20px]" /> : <ImageIcon className="w-7 h-7" />}
              </motion.button>
              {ICONS.map(i => {
                const IconComp = { Users, GraduationCap, Laptop: Cpu, BookOpen, Gamepad2, Stethoscope, Camera, Home }[i] || Users;
                const isSelected = icon === i;
                return (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`w-16 h-16 rounded-[20px] flex items-center justify-center flex-shrink-0 snap-center shadow-sm transition-all duration-300 relative ${
                      isSelected ? "bg-emerald-50 border border-emerald-500 text-emerald-600" : "bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected && <motion.div layoutId="iconHighlight" className="absolute inset-0 rounded-[20px] shadow-[0_4px_20px_rgba(16,185,129,0.2)]" />}
                    <IconComp className="w-7 h-7 relative z-10" />
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Name & Description</label>
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vintage Fashion KE" className="w-full border border-slate-200 rounded-[20px] px-5 py-4 text-[16px] outline-none focus:border-emerald-500 focus:bg-white focus:ring-[3px] focus:ring-emerald-50 font-bold transition-all bg-slate-50 text-slate-900 placeholder-slate-400 shadow-inner" />
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this community about?" rows={3} className="w-full border border-slate-200 rounded-[20px] px-5 py-4 text-[16px] outline-none focus:border-emerald-500 focus:bg-white focus:ring-[3px] focus:ring-emerald-50 font-medium transition-all bg-slate-50 text-slate-900 placeholder-slate-400 resize-none shadow-inner" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Access Type</label>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setType("public")}
                className={`flex-1 p-4 rounded-[24px] text-center flex flex-col items-center gap-2 border transition-all duration-300 relative overflow-hidden ${
                  type === "public" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.1)]" : "border-slate-100 bg-white text-slate-500 shadow-sm hover:border-slate-200"
                }`}
              >
                {type === "public" && <motion.div layoutId="typeHighlight" className="absolute inset-0 bg-emerald-500/5" />}
                <Users className="w-6 h-6" />
                <span className="text-[11px] font-extrabold tracking-widest uppercase">Public</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setType("campus")}
                className={`flex-1 p-4 rounded-[24px] text-center flex flex-col items-center gap-2 border transition-all duration-300 relative overflow-hidden ${
                  type === "campus" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.1)]" : "border-slate-100 bg-white text-slate-500 shadow-sm hover:border-slate-200"
                }`}
              >
                {type === "campus" && <motion.div layoutId="typeHighlight" className="absolute inset-0 bg-emerald-500/5" />}
                <GraduationCap className="w-6 h-6" />
                <span className="text-[11px] font-extrabold tracking-widest uppercase">Campus</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setType("private")}
                className={`flex-1 p-4 rounded-[24px] text-center flex flex-col items-center gap-2 border transition-all duration-300 relative overflow-hidden ${
                  type === "private" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.1)]" : "border-slate-100 bg-white text-slate-500 shadow-sm hover:border-slate-200"
                }`}
              >
                {type === "private" && <motion.div layoutId="typeHighlight" className="absolute inset-0 bg-emerald-500/5" />}
                <Lock className="w-6 h-6" />
                <span className="text-[11px] font-extrabold tracking-widest uppercase">Private</span>
              </motion.button>
            </div>
          </div>
          
          <AnimatePresence>
            {type === "private" && (
              <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="overflow-hidden">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 block mt-2">Invite Code</label>
                <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="e.g. SECRET123" className="w-full border border-slate-200 rounded-[20px] px-5 py-4 text-[16px] outline-none focus:border-emerald-500 focus:bg-white focus:ring-[3px] focus:ring-emerald-50 font-extrabold tracking-[0.2em] uppercase transition-all bg-slate-50 text-slate-900 placeholder-slate-300 shadow-inner" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {type === "campus" && (
              <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="overflow-hidden">
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-[24px] p-5 flex items-start gap-4 mt-2">
                  <div className="p-3 bg-white rounded-[16px] shrink-0 border border-blue-500/10 shadow-sm">
                     <GraduationCap className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-[14px] text-slate-600 font-medium leading-relaxed pt-1">
                    {(() => {
                      let myProfileIsStudentVerified = user?.metadata?.isStudentVerified === true || user?.user_metadata?.isStudentVerified === true;
                      let myProfileUniversity = user?.metadata?.university || user?.user_metadata?.university || "";
                      if (!myProfileIsStudentVerified && myProfile) {
                        try {
                          const u = JSON.parse(myProfile.university || "{}");
                          const d = JSON.parse(myProfile.description || "{}");
                          myProfileIsStudentVerified = u.isStudentVerified || d.isStudentVerified || myProfile.isStudentVerified || false;
                          if (!myProfileUniversity) {
                            myProfileUniversity = u.val || myProfile.university || "";
                          }
                          if (myProfileUniversity.startsWith('{')) myProfileUniversity = "";
                        } catch(e) {}
                      }
                      return (
                        <>
                          Only verified students from <b className="text-slate-900">{myProfileUniversity || "your university"}</b> will be able to join this Soko.
                          {!myProfileIsStudentVerified && (
                            <div className="mt-4 bg-red-50 p-4 rounded-[20px] border border-red-100">
                              <b className="block mb-1 text-[11px] font-extrabold uppercase tracking-widest text-red-500">Action Required</b>
                              <span className="text-red-700 font-medium text-[13px] leading-snug">Complete your student verification via Profile settings to unlock Campus Sokos.</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit} 
          disabled={createMutation.isPending} 
          className="w-full mt-8 bg-slate-900 text-white font-extrabold py-5 rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-black hover:shadow-[0_12px_25px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 relative z-10 text-[16px]"
        >
          {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Create Soko</>}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

import { useAppStore } from "@/store";

export default function CommunitiesPage() {
    const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [joined, setJoined] = useState<Set<number>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [showJoinCodeModal, setShowJoinCodeModal] = useState<any>(null);
  const { watchedCommunityIds, toggleWatchedCommunity } = useAppStore();

  const communitiesQuery = trpc.communities.list.useQuery();
  const myMembershipsQuery = trpc.communities.myMemberships.useQuery({ userId: user?.id }, {
    enabled: isAuthenticated && !!user?.id,
  });
  const profileQuery = trpc.profile.get.useQuery({ id: user?.id as string }, { enabled: !!user?.id });
  const myProfile = profileQuery.data?.[0];

  const joinMutation = trpc.communities.join.useMutation();
  const utils = trpc.useUtils();

  const communities = communitiesQuery.data?.items || [];
  const myMembershipIds = new Set(
    (myMembershipsQuery.data?.items || []).map((c: any) => c.communityId)
  );
  // Merge server state with optimistic local state
  const allJoined = new Set([...Array.from(myMembershipIds), ...Array.from(joined)]);

  const filtered = communities.filter((c: any) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(search.toLowerCase())
  );



  const handleJoin = (e: React.MouseEvent, community: any) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast("Login to join communities!", { action: { label: "Login", onClick: () => navigate("/login") } });
      return;
    }
    if (allJoined.has(community.id)) {
      toast.info(`You're already in ${community.name}`);
      return;
    }
    if (community.type === "private") {
      setShowJoinCodeModal(community);
      return;
    }
    
    let myProfileIsStudentVerified = false;
    let myProfileUniversity = "";
    if (myProfile) {
      try {
        const u = JSON.parse(myProfile.university || "{}");
        const d = JSON.parse(myProfile.description || "{}");
        myProfileIsStudentVerified = u.isStudentVerified || d.isStudentVerified || myProfile.isStudentVerified || false;
        myProfileUniversity = u.val || myProfile.university || "";
        if (myProfileUniversity.startsWith('{')) myProfileUniversity = "";
      } catch(e) {}
    }

    if (community.type === "campus") {
      if (!myProfileIsStudentVerified) {
        toast.error("Verify your student email on your profile first.", { action: { label: "Verify", onClick: () => navigate("/profile") } });
        return;
      }
      if (community.university && community.university !== myProfileUniversity) {
        toast.error(`This Soko is restricted to ${community.university} students.`);
        return;
      }
    }
    
    // Optimistic update
    setJoined(prev => { const next = new Set(Array.from(prev)); next.add(community.id); return next; });
    joinMutation.mutate({ communityId: community.id, userId: user?.id }, {
      onSuccess: () => {
        utils.communities.myMemberships.invalidate();
        toast.success(`Joined ${community.name}!`);
      },
      onError: () => {
        setJoined(prev => { const next = new Set(Array.from(prev)); next.delete(community.id); return next; });
        toast.error("Failed to join community");
      },
    });
  };

  const handleJoinWithCode = (code: string) => {
    if (!showJoinCodeModal) return;
    const community = showJoinCodeModal;
    let actualCode = community.inviteCode;
    try {
      const parsed = JSON.parse(community.description);
      if (parsed && parsed.inviteCode) actualCode = parsed.inviteCode;
    } catch(e) {}

    if (!code || code.toUpperCase() !== (actualCode || "").toUpperCase()) {
      toast.error("Invalid invite code");
      return;
    }

    setShowJoinCodeModal(null);
    setJoined(prev => { const next = new Set(Array.from(prev)); next.add(community.id); return next; });
    joinMutation.mutate({ communityId: community.id, userId: user?.id }, {
      onSuccess: () => {
        utils.communities.myMemberships.invalidate();
        toast.success(`Joined ${community.name}!`);
      },
      onError: () => {
        setJoined(prev => { const next = new Set(Array.from(prev)); next.delete(community.id); return next; });
        toast.error("Failed to join community");
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8FAFC] text-slate-900 bottom-nav-safe selection:bg-emerald-500/20 font-sans"
    >
      {/* Dynamic Floating Header */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-2">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex items-center justify-between bg-white/70 backdrop-blur-3xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[24px] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200/80 transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-900" />
            </button>
            <h1 className="font-extrabold text-slate-900 text-[20px] tracking-tight">Soko</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowCreate(true)}
              className="px-4 py-2.5 rounded-full bg-slate-900 text-white flex items-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:bg-black transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[13px] font-bold">New</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-4 pb-32 space-y-5">
        {/* Search Bar - Floating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-3 bg-white border border-slate-100 rounded-[24px] px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all group-focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.08)] group-focus-within:border-emerald-100">
            <Search className="w-6 h-6 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search communities..."
              className="flex-1 bg-transparent text-[16px] font-semibold text-slate-900 placeholder-slate-400 outline-none"
            />
          </div>
        </motion.div>

        {/* Breathtaking Animated Mesh Gradient Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
          className="relative overflow-hidden rounded-[32px] p-7 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-white/60 bg-white group cursor-pointer"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#fdfbfb_0%,#ebedee_100%)] opacity-50" />
          
          {/* Animated blobs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-200/50 rounded-full blur-[40px] pointer-events-none" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, 20, 0]
            }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -left-10 w-56 h-56 bg-blue-100/50 rounded-full blur-[50px] pointer-events-none" 
          />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="pr-4">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold tracking-widest uppercase mb-3">Featured</span>
              <p className="text-slate-900 font-extrabold text-[24px] tracking-tight leading-tight">Your Campus Hub</p>
              <p className="text-slate-500 font-medium text-[14px] mt-1.5 leading-relaxed">Connect, trade, and vibe with verified students near you.</p>
            </div>
            <div className="w-16 h-16 shrink-0 rounded-[20px] bg-white/80 backdrop-blur-md flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
              <Users className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </motion.div>

        {/* Community List */}
        <div className="flex flex-col gap-4 pt-2">
          <AnimatePresence>
            {filtered.map((community: any, i: number) => {
              const isJoined = allJoined.has(community.id);
                const IconComp = ({ Users, GraduationCap, Laptop: Cpu, BookOpen, Gamepad2, Stethoscope, Camera, Home } as any)[community.icon] || Users;
                return (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1 + (i * 0.05), type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-white rounded-[28px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-4 cursor-pointer group hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-emerald-100 transition-all duration-300 relative overflow-hidden"
                    onClick={() => navigate(`/communities/${community.id}`)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-14 h-14 rounded-[20px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 overflow-hidden shrink-0 group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                        {community.icon?.startsWith("data:image") || community.icon?.startsWith("http") ? (
                          <img src={community.icon} className="w-full h-full object-cover" />
                        ) : (
                          <IconComp className="w-7 h-7 text-slate-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-slate-900 text-[17px] truncate tracking-tight group-hover:text-emerald-600 transition-colors">{community.name}</p>
                        <p className="text-[14px] text-slate-500 mt-0.5 line-clamp-1 font-medium leading-relaxed">
                          {(() => {
                            try {
                              const parsed = JSON.parse(community.description || "{}");
                              return parsed.text !== undefined ? parsed.text : community.description;
                            } catch(e) {
                              return community.description;
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1,2,3].map(n => (
                             <div key={n} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                                <Users className="w-3 h-3 text-slate-400" />
                             </div>
                          ))}
                        </div>
                        <span className="text-[12px] font-bold text-slate-400 ml-1">
                          <span className="text-slate-700">{community.memberCount || 0}</span> members
                        </span>
                      </div>
                      
                      {community.creatorId !== user?.id && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleJoin(e, community)}
                          className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                            isJoined
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : community.type === "private"
                              ? "bg-slate-900 text-white hover:bg-black hover:shadow-lg"
                              : "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-emerald-500/30"
                          }`}
                        >
                          {isJoined ? <><Check className="w-3.5 h-3.5" /> Joined</> : community.type === "private" ? "Request" : "Join"}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ type: "spring", damping: 20 }}
            className="text-center py-24 flex flex-col items-center bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] mt-4"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-slate-50 rounded-[24px] flex items-center justify-center mb-6 shadow-inner border border-slate-100"
            >
               <Search className="w-10 h-10 text-slate-300" />
            </motion.div>
            <p className="font-extrabold text-slate-900 text-[20px] tracking-tight">Nothing found</p>
            <p className="text-slate-500 text-[15px] mt-2 font-medium max-w-[200px]">Try searching for something else, or create a new Soko.</p>
            <button onClick={() => setShowCreate(true)} className="mt-8 px-6 py-3 rounded-full bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors">
              Create a Soko
            </button>
          </motion.div>
        )}
      </div>
      
      <AnimatePresence>
        {showCreate && <CreateSokoModal myProfile={myProfile} onClose={() => setShowCreate(false)} />}
        {showJoinCodeModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1050] flex items-center justify-center p-4"
            onClick={() => setShowJoinCodeModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-[36px] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.2)] border border-white bg-white relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-sm">
                 <Lock className="w-7 h-7 text-slate-700" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[22px] text-center mb-2 tracking-tight">Private Soko</h3>
              <p className="text-slate-500 text-[15px] text-center mb-8 font-medium leading-relaxed px-4">Enter the invite code to join <span className="font-bold text-slate-700">{showJoinCodeModal.name}</span>.</p>
              
              <input
                id="joinCodeInput"
                placeholder="INVITE CODE"
                className="w-full bg-[#F8FAFC] border border-slate-100 rounded-[20px] px-4 py-5 text-center text-[18px] outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 uppercase font-extrabold tracking-[0.3em] mb-8 text-slate-900 placeholder-slate-300 transition-all shadow-inner"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinWithCode((e.target as HTMLInputElement).value);
                  }
                }}
              />
              
              <div className="flex gap-3 relative z-10">
                <button onClick={() => setShowJoinCodeModal(null)} className="flex-1 py-4 rounded-[20px] text-[15px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">Cancel</button>
                <button onClick={() => handleJoinWithCode((document.getElementById('joinCodeInput') as HTMLInputElement)?.value)} className="flex-1 py-4 rounded-[20px] text-[15px] font-bold bg-slate-900 hover:bg-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all">Join</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
