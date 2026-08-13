import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { ChevronLeft, Search, Users, Cpu, BookOpen, Gamepad2, Camera, Home, Stethoscope, GraduationCap, Plus, Check, Loader2, Image as ImageIcon, Heart } from "lucide-react";
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
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1050] flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-[480px] mx-auto bg-white rounded-t-[32px] p-6 pb-28 shadow-[0_-20px_60px_rgba(0,0,0,0.08)] relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 relative z-10" />
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm transform rotate-[-3deg]">
            <Users className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">Create a Soko</h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Start a new community space</p>
          </div>
        </div>
        
        <div className="space-y-5 relative z-10">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Soko Icon</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 snap-center transition-all ${
                  icon && icon.startsWith('data:image') ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-600 shadow-sm" : "bg-[#F5F5F7] border-2 border-dashed border-gray-200 text-gray-400 hover:bg-gray-100"
                }`}
              >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : icon && icon.startsWith('data:image') ? <img src={icon} className="w-full h-full object-cover rounded-2xl" /> : <ImageIcon className="w-6 h-6" />}
              </button>
              {ICONS.map(i => {
                const IconComp = { Users, GraduationCap, Laptop: Cpu, BookOpen, Gamepad2, Stethoscope, Camera, Home }[i] || Users;
                return (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 snap-center transition-all ${
                      icon === i ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-600 shadow-sm scale-105" : "bg-[#F5F5F7] border-2 border-transparent text-slate-500 hover:bg-gray-100"
                    }`}
                  >
                    <IconComp className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Name & Description</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vintage Fashion KE" className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-medium transition-all bg-[#F5F5F7] text-slate-900 placeholder-slate-400 mb-3" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this community about?" rows={2} className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-medium transition-all bg-[#F5F5F7] text-slate-900 placeholder-slate-400 resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Access Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setType("public")}
                className={`flex-1 p-3 rounded-2xl text-center flex flex-col items-center gap-1 border transition-all ${
                  type === "public" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-gray-200 bg-white text-slate-500 hover:bg-gray-50"
                }`}
              >
                <Users className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold tracking-wide uppercase">Public</span>
              </button>
              <button
                onClick={() => setType("campus")}
                className={`flex-1 p-3 rounded-2xl text-center flex flex-col items-center gap-1 border transition-all ${
                  type === "campus" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-gray-200 bg-white text-slate-500 hover:bg-gray-50"
                }`}
              >
                <GraduationCap className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold tracking-wide uppercase">Campus</span>
              </button>
              <button
                onClick={() => setType("private")}
                className={`flex-1 p-3 rounded-2xl text-center flex flex-col items-center gap-1 border transition-all ${
                  type === "private" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-gray-200 bg-white text-slate-500 hover:bg-gray-50"
                }`}
              >
                <div className="w-5 h-5 mb-1 flex items-center justify-center font-serif text-lg font-bold leading-none">P</div>
                <span className="text-[11px] font-bold tracking-wide uppercase">Private</span>
              </button>
            </div>
          </div>
          
          {type === "private" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block mt-1">Invite Code</label>
              <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="e.g. SECRET123" className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-bold tracking-widest uppercase transition-all bg-[#F5F5F7] text-slate-900 placeholder-slate-400" />
            </motion.div>
          )}

          {type === "campus" && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 mt-2">
              <div className="p-2 bg-blue-100 rounded-xl shrink-0 mt-0.5 border border-blue-200">
                 <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-[13px] text-blue-800 font-medium leading-relaxed pt-1">
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
                      Only verified students from <b className="text-blue-900">{myProfileUniversity || "your university"}</b> will be able to join this Soko.
                      {!myProfileIsStudentVerified && <p className="text-red-600 mt-3 bg-red-50 p-3 rounded-xl border border-red-100 font-medium text-[12px] leading-relaxed"><b className="block mb-0.5 uppercase tracking-wider text-[10px]">Action Required</b> Complete your student verification via the Profile settings to unlock Campus Sokos.</p>}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full mt-8 bg-slate-900 hover:bg-black text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative z-10">
          {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Create Soko</>}
        </button>
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
      className="min-h-screen bg-[#F5F5F7] text-slate-900 bottom-nav-safe selection:bg-emerald-500/20 font-sans"
    >
      {/* iOS 26 style Dynamic Header & Search */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-3 bg-[#F5F5F7]/80 backdrop-blur-3xl border-b border-black/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/")} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-900" />
          </button>
          <h1 className="font-bold text-slate-900 text-lg tracking-tight">Soko</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreate(true)}
            className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="relative group">
          <div className="relative flex items-center gap-3 bg-black/5 border border-transparent rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-white group-focus-within:border-black/10 group-focus-within:shadow-sm">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search communities..."
              className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 placeholder-slate-400 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-28 space-y-4">
        {/* Featured Banner - Clean, soft iridescent light card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.04)] bg-white border border-black/[0.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-emerald-50/50 -z-20" />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full blur-[40px] -z-10 pointer-events-none" 
          />
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-900 font-extrabold text-[20px] tracking-tight">Your Campus Hub</p>
              <p className="text-emerald-600 font-semibold text-[13px] mt-1">Connect with students near you</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Community List */}
        <AnimatePresence>
          {filtered.map((community: any, i: number) => {
            const isJoined = allJoined.has(community.id);
              const IconComp = ({ Users, GraduationCap, Laptop: Cpu, BookOpen, Gamepad2, Stethoscope, Camera, Home } as any)[community.icon] || Users;
              return (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-black/[0.02] flex items-center gap-4 cursor-pointer group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all"
                  onClick={() => navigate(`/communities/${community.id}`)}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-slate-700 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                    {community.icon?.startsWith("data:image") || community.icon?.startsWith("http") ? (
                      <img src={community.icon} className="w-full h-full object-cover" />
                    ) : (
                      <IconComp className="w-6 h-6" />
                    )}
                  </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-[15px] truncate tracking-tight">{community.name}</p>
                  <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-1 font-medium leading-relaxed">
                    {(() => {
                      try {
                        const parsed = JSON.parse(community.description || "{}");
                        return parsed.text !== undefined ? parsed.text : community.description;
                      } catch(e) {
                        return community.description;
                      }
                    })()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="text-slate-700">{community.memberCount || 0}</span> MEMBERS
                    </span>
                    {community.type === "public" && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Public</span>
                    )}
                  </div>
                </div>
                {community.creatorId !== user?.id && (
                  <div className="flex flex-col gap-2 items-center">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleJoin(e, community)}
                      className={`px-4 py-2 rounded-full text-[12px] font-bold transition-all shadow-sm ${
                        isJoined
                          ? "bg-black/5 text-slate-900"
                          : community.type === "private"
                          ? "bg-slate-900 text-white"
                          : "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600"
                      }`}
                    >
                      {isJoined ? <><Check className="w-3 h-3 inline mr-1 -mt-0.5" /> Joined</> : community.type === "private" ? "Request" : "Join"}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
               <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-slate-900 text-[17px] tracking-tight">No communities found</p>
            <p className="text-slate-500 text-[14px] mt-1 font-medium">Try a different search term</p>
          </motion.div>
        )}
      </div>
      
      <AnimatePresence>
        {showCreate && <CreateSokoModal myProfile={myProfile} onClose={() => setShowCreate(false)} />}
        {showJoinCodeModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1050] flex items-center justify-center p-4"
            onClick={() => setShowJoinCodeModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-[32px] p-7 shadow-[0_40px_80px_rgba(0,0,0,0.12)] border border-black/[0.04] bg-white relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-slate-900 text-xl text-center mb-2 tracking-tight">Join {showJoinCodeModal.name}</h3>
              <p className="text-slate-500 text-sm text-center mb-6 font-medium leading-relaxed">Enter the invite code to join this private community.</p>
              
              <input
                id="joinCodeInput"
                placeholder="Invite Code"
                className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl px-4 py-4 text-center text-lg outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 uppercase font-bold tracking-[0.2em] mb-6 text-slate-900 placeholder-slate-400 transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinWithCode((e.target as HTMLInputElement).value);
                  }
                }}
              />
              
              <div className="flex gap-3 relative z-10">
                <button onClick={() => setShowJoinCodeModal(null)} className="flex-1 py-4 rounded-2xl text-[14px] font-bold bg-[#F5F5F7] hover:bg-gray-200 text-slate-700 transition-colors">Cancel</button>
                <button onClick={() => handleJoinWithCode((document.getElementById('joinCodeInput') as HTMLInputElement)?.value)} className="flex-1 py-4 rounded-2xl text-[14px] font-bold bg-slate-900 hover:bg-black text-white shadow-lg shadow-black/10 transition-all">Join</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
