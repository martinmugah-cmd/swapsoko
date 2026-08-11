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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-[480px] mx-auto rounded-t-[32px] p-6 pb-28 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 transform rotate-[-3deg]">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-2xl text-slate-900 tracking-tight">Create a Soko</h3>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Start a new community space</p>
          </div>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Soko Icon</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 snap-center transition-all ${
                  icon && icon.startsWith('data:image') ? "bg-green-50 border-2 border-green-500 text-green-600 shadow-sm" : "bg-gray-50 border-2 border-dashed border-gray-300 text-gray-400 hover:bg-gray-100"
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
                      icon === i ? "bg-green-50 border-2 border-green-500 text-green-600 shadow-sm scale-105" : "bg-gray-50 border-2 border-transparent text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <IconComp className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Name & Description</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vintage Fashion KE" className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-green-500 font-medium transition-colors bg-gray-50/50 mb-3" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this community about?" rows={2} className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-green-500 font-medium transition-colors bg-gray-50/50 resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Access Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setType("public")}
                className={`flex-1 p-3 rounded-2xl text-center flex flex-col items-center gap-1 border-2 transition-all ${
                  type === "public" ? "border-green-500 bg-green-50 text-green-700 shadow-sm" : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                }`}
              >
                <Users className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Public</span>
              </button>
              <button
                onClick={() => setType("campus")}
                className={`flex-1 p-3 rounded-2xl text-center flex flex-col items-center gap-1 border-2 transition-all ${
                  type === "campus" ? "border-green-500 bg-green-50 text-green-700 shadow-sm" : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                }`}
              >
                <GraduationCap className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Campus</span>
              </button>
              <button
                onClick={() => setType("private")}
                className={`flex-1 p-3 rounded-2xl text-center flex flex-col items-center gap-1 border-2 transition-all ${
                  type === "private" ? "border-green-500 bg-green-50 text-green-700 shadow-sm" : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                }`}
              >
                <div className="w-5 h-5 mb-1 flex items-center justify-center font-serif text-lg font-bold leading-none">P</div>
                <span className="text-xs font-bold">Private</span>
              </button>
            </div>
          </div>
          
          {type === "private" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block mt-1">Invite Code</label>
              <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="e.g. SECRET123" className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-green-500 font-medium transition-colors bg-gray-50/50" />
            </motion.div>
          )}

          {type === "campus" && (
            <div className="bg-[#F8FAFC] border border-blue-100/50 shadow-inner rounded-2xl p-4 flex items-start gap-3 mt-2">
              <div className="p-2 bg-blue-100/50 rounded-xl shrink-0 mt-0.5">
                 <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600 leading-relaxed pt-1">
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
                      Only verified students from <b>{myProfileUniversity || "your university"}</b> will be able to join this Soko.
                      {!myProfileIsStudentVerified && <p className="text-[#EF4444] mt-3 bg-red-50/80 p-3 rounded-xl border border-red-100/50 font-medium text-xs leading-relaxed"><b className="block mb-0.5 uppercase tracking-wide">Action Required</b> Complete your student verification via the Profile settings to unlock Campus Sokos.</p>}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full mt-8 gradient-green text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-5 h-5" /> Create Soko</>}
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
      className="min-h-screen bg-[#F8FAFC] bottom-nav-safe"
    >
      {/* Header */}
      <div className="page-header px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/")} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-slate-900" />
          </button>
          <h1 className="font-bold text-slate-900 text-base">{"Soko"}</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreate(true)}
            className="w-8 h-8 gradient-green rounded-full flex items-center justify-center"
          >
            <Plus className="w-4 h-4 text-white" />
          </motion.button>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-3xl px-3 py-2.5">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-gray-400 outline-none"
          />
        </div>
      </div>

      <div className="px-4 py-4 pb-24 space-y-3">
        {/* Featured banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-3xl p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-white font-bold text-base">Your Campus Hub</p>
            <p className="text-gray-400 text-xs mt-0.5">Connect with students near you</p>
          </div>
          <div className="w-12 h-12 gradient-green rounded-3xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Community list */}
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
                  className="bg-white rounded-3xl p-4 card-shadow flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/communities/${community.id}`)}
                >
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-slate-900 overflow-hidden">
                    {community.icon?.startsWith("data:image") || community.icon?.startsWith("http") ? (
                      <img src={community.icon} className="w-full h-full object-cover" />
                    ) : (
                      <IconComp className="w-4 h-4" />
                    )}
                  </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{community.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    {(() => {
                      try {
                        const parsed = JSON.parse(community.description || "{}");
                        return parsed.text !== undefined ? parsed.text : community.description;
                      } catch(e) {
                        return community.description;
                      }
                    })()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      <span className="font-semibold text-slate-900">{community.memberCount || 0}</span> members
                    </span>
                    {community.type === "public" && (
                      <span className="text-xs bg-[#F0FDF4] text-green-500 px-1.5 py-0.5 rounded-full font-medium">Public</span>
                    )}
                  </div>
                </div>
                {community.creatorId !== user?.id && (
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                         e.stopPropagation();
                         toggleWatchedCommunity(community.id.toString());
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 flex-shrink-0"
                    >
                      <Heart className={`w-4 h-4 ${watchedCommunityIds.includes(community.id.toString()) ? 'text-red-400 fill-red-400' : 'text-gray-400'}`} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleJoin(e, community)}
                      className={`px-4 py-2 rounded-3xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors ${
                        isJoined
                          ? "bg-[#F0FDF4] text-green-500 border border-[#BBF7D0]"
                          : community.type === "private"
                          ? "bg-gray-100 text-slate-900 hover:bg-gray-200"
                          : "gradient-green text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {isJoined ? <><Check className="w-3 h-3" /> Joined</> : community.type === "private" ? "Request" : "Join"}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-10 h-10 mb-3 mx-auto text-gray-300" />
            <p className="font-semibold text-slate-900">No communities found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {showCreate && <CreateSokoModal myProfile={myProfile} onClose={() => setShowCreate(false)} />}
        {showJoinCodeModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowJoinCodeModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-slate-900 text-lg text-center mb-2">Join {showJoinCodeModal.name}</h3>
              <p className="text-gray-500 text-sm text-center mb-4">Enter the invite code to join this private community.</p>
              <input
                id="joinCodeInput"
                placeholder="Invite Code"
                className="w-full border border-gray-200 rounded-3xl px-4 py-3 text-sm outline-none focus:border-green-500 uppercase text-center font-bold tracking-widest mb-6"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinWithCode((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <div className="flex gap-3">
                <button onClick={() => setShowJoinCodeModal(null)} className="flex-1 py-3 rounded-3xl text-sm font-bold bg-gray-100 text-gray-600">Cancel</button>
                <button onClick={() => handleJoinWithCode((document.getElementById('joinCodeInput') as HTMLInputElement)?.value)} className="flex-1 py-3 rounded-3xl text-sm font-bold gradient-green text-white">Join</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
