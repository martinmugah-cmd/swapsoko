import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { ChevronLeft, MoreVertical, MapPin, Users, Package, Settings, Share2, Bell, Shield, ShieldCheck, ShieldOff, LogOut, ArrowRight, X, UserMinus, Plus, Trash2, Edit2, Lock, GraduationCap, Cpu, BookOpen, Gamepad2, Stethoscope, Camera, Home, BellOff, Star, Check, Image as ImageIcon, Loader2, Flag } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { ProposeSwapModal } from "./Swipes";
import { CreateWishModal, WishCard } from "./SwapWishes";
import { ReportModal } from "@/components/ReportModal";

function EditCommunityModal({ community, onClose }: { community: any, onClose: () => void }) {
  const [name, setName] = useState(community.name || "");
  const [description, setDescription] = useState(community.description || "");
  const [icon, setIcon] = useState(community.icon || "Users");
  const updateMutation = trpc.communities.update.useMutation();
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
    if (!name.trim()) { toast.error("Please enter a name"); return; }
    updateMutation.mutate({ id: community.id, name, description, icon }, {
      onSuccess: () => {
        toast.success(`Soko updated!`);
        utils.communities.get.invalidate({ id: community.id });
        onClose();
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
            <Edit2 className="w-8 h-8 text-emerald-500" />
          </motion.div>
          <div>
            <h3 className="font-extrabold text-[26px] text-slate-900 tracking-tight leading-none">Edit Soko</h3>
            <p className="text-[15px] text-slate-500 font-medium mt-1">Update community details</p>
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
                    {isSelected && <motion.div layoutId="editIconHighlight" className="absolute inset-0 rounded-[20px] shadow-[0_4px_20px_rgba(16,185,129,0.2)]" />}
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
        </div>

        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit} 
          disabled={updateMutation.isPending} 
          className="w-full mt-8 bg-slate-900 text-white font-extrabold py-5 rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-black hover:shadow-[0_12px_25px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 relative z-10 text-[16px]"
        >
          {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save Changes</>}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function JoinCodeModal({ community, onClose, onJoin }: { community: any, onClose: () => void, onJoin: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-bold text-slate-900 text-lg text-center mb-2">Join {community.name}</h3>
        <p className="text-gray-500 text-sm text-center mb-4">Enter the invite code to join this private community.</p>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Invite Code"
          className="w-full border border-gray-200 rounded-3xl px-4 py-3 text-sm outline-none focus:border-green-500 uppercase text-center font-bold tracking-widest mb-6"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-3xl text-sm font-bold bg-gray-100 text-gray-600">Cancel</button>
          <button onClick={() => onJoin(code)} className="flex-1 py-3 rounded-3xl text-sm font-bold gradient-green text-white">Join</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CommunityDetailPage() {
  const params = useParams<{ id: string }>();
  const communityId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem(`notif_comm_${communityId}`) === "true");
  const [activeTab, setActiveTab] = useState<"feed" | "discussions" | "members">("feed");
  const [showEdit, setShowEdit] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [proposeListing, setProposeListing] = useState<any>(null);
  const [showCreateWish, setShowCreateWish] = useState(false);
  const [proposeWish, setProposeWish] = useState<any>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const myMembershipsQuery = trpc.communities.myMemberships.useQuery({ userId: user?.id }, { enabled: isAuthenticated && !!user?.id });
  const communityQuery = trpc.communities.get.useQuery({ id: communityId }, { enabled: !!communityId });
  const feedQuery = trpc.listings.list.useQuery({ limit: 20, communityId }, { enabled: !!communityId });
  const wishesQuery = trpc.wishes.list.useQuery({ limit: 20, communityId }, { enabled: !!communityId });
  const postsQuery = trpc.communityPosts.list.useQuery({ communityId }, { enabled: !!communityId });
  const joinMutation = trpc.communities.join.useMutation();
  const leaveMutation = trpc.communities.leave.useMutation();
  const deleteMutation = trpc.communities.delete.useMutation();
  const sendNotification = trpc.notifications.send.useMutation();
  const sendProposal = trpc.proposals.send.useMutation();
  const removeMemberMutation = trpc.communities.removeMember.useMutation();
  const makeAdminMutation = trpc.communities.makeAdmin.useMutation();
  const demoteAdminMutation = trpc.communities.demoteAdmin.useMutation();
  const deleteListingMutation = trpc.listings.delete.useMutation();
  const deleteWishMutation = trpc.wishes.delete.useMutation();
  const createPostMutation = trpc.communityPosts.create.useMutation();
  const deletePostMutation = trpc.communityPosts.delete.useMutation();
  const createReplyMutation = trpc.communityPostReplies.create.useMutation();
  const utils = trpc.useUtils();

  const community = communityQuery.data;
  const myMembershipIds = new Set((myMembershipsQuery.data?.items || []).map((c: any) => c.communityId));
  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
  const isJoined = isPreview || myMembershipIds.has(communityId);
  const isAdmin = community?.admins?.includes(user?.id) || (community?.creatorId === user?.id && (!community?.admins || community.admins.length === 0));

  const { requestedCommunityIds, addRequestedCommunity } = useAppStore();
  const hasRequested = requestedCommunityIds.includes(communityId.toString());
  const isCampusOnly = community?.description?.toLowerCase().includes('campus');

  const handleJoinLeave = () => {
    if (!isAuthenticated) return toast("Please login to join this community");
    if (isJoined) {
      leaveMutation.mutate({ communityId: community.id, userId: user?.id }, {
        onSuccess: () => {
          utils.communities.get.invalidate({ id: communityId });
          utils.communities.myMemberships.invalidate();
          toast.success("Left community");
        }
      });
    } else {
      if (isCampusOnly && !user?.campus) {
        return toast.error("Campus Required: You must set your campus in your profile to join this community.");
      }

      if (community?.type === "private") {
        if (hasRequested) return;
        // Send a notification to the creator
        if (community.creatorId) {
           sendNotification.mutate({
              userId: community.creatorId,
              title: "Join Request",
              body: `${user?.name || 'Someone'} requested to join ${community.name}`,
              type: "community_request",
              link: `/community-request/${community.id}?userId=${user?.id}`
           }, {
             onSuccess: () => {
                addRequestedCommunity(communityId.toString());
                toast.success("Request sent to admin");
             }
           });
        } else {
           addRequestedCommunity(communityId.toString());
           toast.success("Request sent to admin");
        }
      } else {
        joinMutation.mutate({ communityId: community.id, userId: user?.id }, {
          onSuccess: () => {
            utils.communities.get.invalidate({ id: communityId });
            utils.communities.myMemberships.invalidate();
            toast.success("Joined community!");
          }
        });
      }
    }
  };

  const handleJoinWithCode = (code: string) => {
    let actualCode = community.inviteCode || "SECRET123";
    try {
      const parsed = JSON.parse(community.description || "{}");
      if (parsed && parsed.inviteCode) actualCode = parsed.inviteCode;
    } catch(e) {}
    
    if (code.toUpperCase() === actualCode.toUpperCase() || code === community.id.toString()) {
      joinMutation.mutate({ communityId: community.id, userId: user?.id }, {
        onSuccess: () => {
          utils.communities.get.invalidate({ id: communityId });
          utils.communities.myMemberships.invalidate();
          toast.success("Joined community!");
          setShowJoinCodeModal(false);
        }
      });
    } else {
      toast.error("Invalid invite code");
    }
  };

  const handleSendProposal = (message: string, cashTopUp: number, options?: any) => {
    const target = proposeListing || proposeWish;
    if (!target) return;
    
    const isWish = !!proposeWish;
    const finalMessage = isWish ? `[Regarding Wish: ${target.id}]\n${message}` : message;
    const listingId = isWish ? undefined : target.id;
    
    const toastId = toast.loading("Sending proposal...");
    
    sendProposal.mutate({
      listingId,
      userId: user?.id,
      toUserId: target.userId || target.authorId,
      message: finalMessage,
      cashTopUp,
      wishId: isWish ? target.id : undefined,
      ...options
    }, {
      onSuccess: (data: any) => {
        toast.success("Proposal sent!", { id: toastId });
        setProposeListing(null);
        setProposeWish(null);
      },
      onError: (err: any) => {
        toast.dismiss(toastId);
        toast.error("Failed to send proposal: " + (err?.message || JSON.stringify(err)));
      }
    });
  };

  if (communityQuery.isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#F8FAFC] pb-24">
        {/* Cover Image Skeleton */}
        <div className="h-56 bg-gray-200 animate-pulse w-full"></div>
        {/* Main Content Area */}
        <div className="px-5 -mt-12 relative z-10 animate-pulse">
          <div className="w-[100px] h-[100px] rounded-3xl bg-gray-100 border-[4px] border-[#F8FAFC] shadow-sm mb-4"></div>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-32 bg-gray-200 rounded-full"></div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
          <div className="mt-6 flex gap-4 border-b border-gray-100 pb-2">
            <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
          </div>
          <div className="mt-4 space-y-4">
            <div className="h-32 w-full bg-gray-200 rounded-2xl"></div>
            <div className="h-32 w-full bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4"><Package className="w-8 h-8" /></div>
        <p className="font-bold text-slate-900">Community not found</p>
        <button onClick={() => navigate("/communities")} className="mt-4 text-blue-600 text-sm font-semibold">
          ← Back to Communities
        </button>
      </div>
    );
  }

  const icon = community.icon || "Users";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8FAFC] bottom-nav-safe pb-24"
    >
      {/* Dynamic Floating Header */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-2 bg-[#F8FAFC]/80 backdrop-blur-3xl">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex items-center justify-between bg-white/70 backdrop-blur-3xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[24px] px-4 py-3"
        >
          <button onClick={() => navigate("/communities")} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200/80 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-900" />
          </button>
          
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEdit(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100/80 transition-colors">
                <Edit2 className="w-4 h-4" />
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => toast("Share link copied!")} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100/80 transition-colors">
              <Share2 className="w-4 h-4" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsReporting(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
              <Flag className="w-4 h-4" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => {
                const newVal = !notificationsEnabled;
                setNotificationsEnabled(newVal);
                localStorage.setItem(`notif_comm_${communityId}`, String(newVal));
                toast(newVal ? "Notifications enabled" : "Notifications disabled");
              }} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100/80 transition-colors">
              {notificationsEnabled ? <Bell className="w-4 h-4 text-emerald-500" /> : <BellOff className="w-4 h-4" />}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-3">
        {/* Breathtaking Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative overflow-hidden rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-white/60 bg-white group"
        >
          {icon && (icon.startsWith("data:image") || icon.startsWith("http")) ? (
            <div className="absolute inset-0 z-0">
              <img src={icon} className="w-full h-full object-cover opacity-20 blur-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(120deg,#fdfbfb_0%,#ebedee_100%)] opacity-50 z-0" />
              <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-200/40 rounded-full blur-[40px] pointer-events-none z-0" />
              <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -bottom-10 -left-10 w-56 h-56 bg-blue-100/40 rounded-full blur-[50px] pointer-events-none z-0" />
            </>
          )}

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-[24px] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center text-emerald-500 overflow-hidden mb-4 relative">
              {(() => {
                if (icon && typeof icon === "string") {
                  if (icon.startsWith("data:image") || icon.startsWith("http")) {
                    return <img src={icon} className="w-full h-full object-cover" />;
                  }
                  const iconMap: Record<string, any> = { Users, GraduationCap, Laptop: Cpu, BookOpen, Gamepad2, Stethoscope, Camera, Home };
                  const IconComp = iconMap[icon] || Users;
                  return <IconComp className="w-10 h-10" />;
                }
                return <Users className="w-10 h-10" />;
              })()}
            </div>
            
            <h1 className="font-extrabold text-[24px] text-slate-900 tracking-tight leading-tight">{community.name}</h1>
            
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-slate-500 text-[13px] font-bold">
                <Users className="w-4 h-4" />
                {(community.memberCount || 0).toLocaleString()} members
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-widest ${
                community.type === "public" ? "bg-emerald-50 border border-emerald-100 text-emerald-600" : "bg-slate-100 border border-slate-200 text-slate-600"
              }`}>
                {community.type === "public" ? "Public" : "Private"}
              </span>
            </div>

            {(() => {
              let textToShow = "";
              if (community.description) {
                try {
                  const parsed = JSON.parse(community.description);
                  textToShow = parsed.text !== undefined ? parsed.text : community.description;
                } catch {
                  textToShow = community.description;
                }
              }
              if (!textToShow) return null;
              return <p className="text-slate-500 text-[14px] mt-4 font-medium leading-relaxed max-w-sm">{textToShow}</p>;
            })()}

            <div className="w-full flex flex-col gap-3 mt-6">
              {community.creatorId === user?.id && (
                <div className="flex justify-center w-full relative h-[48px]">
                  <AnimatePresence mode="wait">
                    {!showDeleteConfirm ? (
                      <motion.button
                        key="init"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowDeleteConfirm(true)}
                        className="absolute inset-0 mx-auto w-full max-w-[200px] h-full rounded-[20px] text-[13px] font-extrabold bg-red-50 text-red-500 border border-red-100 shadow-[0_4px_12px_rgba(239,68,68,0.1)] flex items-center justify-center transition-colors hover:bg-red-100"
                      >
                        Delete Soko
                      </motion.button>
                    ) : (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.8, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute inset-0 mx-auto w-full max-w-[260px] h-full flex items-center justify-center gap-2"
                      >
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 h-full rounded-[20px] text-[13px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteMutation.mutate({ id: communityId }, { onSuccess: () => { utils.communities.list.invalidate(); utils.communities.myMemberships.invalidate(); toast.success("Community deleted"); navigate("/communities"); } })}
                          disabled={deleteMutation.isPending}
                          className="flex-1 h-full rounded-[20px] text-[13px] font-extrabold bg-red-500 text-white shadow-[0_8px_20px_rgba(239,68,68,0.25)] flex items-center justify-center"
                        >
                          {deleteMutation.isPending ? "..." : "Are you sure?"}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {(!isJoined || community.creatorId !== user?.id) && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                     if (community.type === "private" && !isJoined && !hasRequested) {
                        setShowJoinCodeModal(true);
                     } else {
                        handleJoinLeave();
                     }
                  }}
                  disabled={joinMutation.isPending || leaveMutation.isPending || (hasRequested && community.type === "private")}
                  className={`w-full py-3.5 rounded-[20px] text-[14px] font-extrabold shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-all flex items-center justify-center ${
                    isJoined || (hasRequested && community.type === "private")
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none border border-slate-200"
                      : "bg-slate-900 text-white hover:bg-black"
                  }`}
                >
                  {joinMutation.isPending || leaveMutation.isPending
                    ? "..."
                    : isJoined ? <span className="flex items-center gap-1.5 justify-center"><Check className="w-4 h-4"/> Joined</span> 
                    : (hasRequested && community.type === "private") ? "Requested" 
                    : community.type === "private" ? "Join with Code" : "Join Community"}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Segmented Tabs */}
      <div className="px-4 pt-2">
        <div className="flex bg-slate-200/50 p-1.5 rounded-[24px] relative">
          {[
            { id: "feed", label: "Feed", icon: <Package className="w-4 h-4" /> },
            { id: "discussions", label: "Chat", icon: <BookOpen className="w-4 h-4" /> },
            { id: "members", label: "Members", icon: <Users className="w-4 h-4" /> },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2.5 rounded-[20px] text-[12px] sm:text-[13px] font-extrabold transition-all relative z-10 ${
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {isActive && <motion.div layoutId="tabHighlight" className="absolute inset-0 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-[20px] -z-10 border border-white" />}
                {tab.icon} <span className="tracking-wide">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === "feed" ? (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {!isJoined && community.creatorId !== user?.id && community.type === "private" ? (
                <div className="text-center py-12">
                  <Lock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="font-semibold text-slate-900">Join to see listings</p>
                  <p className="text-gray-400 text-sm mt-1">This is a private community</p>
                </div>
              ) : feedQuery.isLoading || wishesQuery.isLoading ? (
                <div className="space-y-3 mt-4">
                  {[1, 2, 3].map(i => (
                    <div key={`sk-cfeed-${i}`} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="w-3/4 h-4 bg-gray-100 rounded-full"></div>
                          <div className="w-1/2 h-3 bg-gray-100 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (() => {
                const combinedFeed = [
                  ...(feedQuery.data?.items || []).map((i: any) => ({ ...i, _type: 'listing' })),
                  ...(wishesQuery.data?.items || []).map((w: any) => ({ ...w, _type: 'wish' }))
                ]
                .filter(item => item.userId?.toString() !== user?.id?.toString())
                .sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
                
                if (combinedFeed.length === 0) {
                  return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 flex flex-col items-center bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] mx-1 mt-2">
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-24 h-24 bg-slate-50 rounded-[24px] flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                         <Package className="w-10 h-10 text-emerald-400" />
                      </motion.div>
                      <p className="font-extrabold text-slate-900 text-[20px] tracking-tight">No posts yet</p>
                      {isJoined ? (
                        <>
                          <p className="text-slate-500 text-[15px] mt-2 font-medium max-w-[200px]">Be the first to share something with {community.name}!</p>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowActionSheet(true)}
                            className="mt-8 bg-slate-900 text-white font-extrabold px-8 py-3.5 rounded-[20px] shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-black hover:shadow-[0_12px_25px_rgba(0,0,0,0.2)] transition-all"
                          >
                            Post Something
                          </motion.button>
                        </>
                      ) : (
                        <p className="text-slate-500 text-[15px] mt-2 font-medium">Join the community to start posting!</p>
                      )}
                    </motion.div>
                  );
                }

                return combinedFeed.map((item: any) => 
                  item._type === 'listing' ? (
                    <motion.div
                      key={`listing-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white rounded-3xl overflow-hidden card-shadow mb-3"
                    >
                      {(() => {
                        let images: string[] = [];
                        try { images = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []); } catch(e) {}
                        const img = (images[0] && !images[0].startsWith('blob:')) ? images[0] : "/logo.jpg";
                        return (
                          <div className="h-40 overflow-hidden">
                            <img
                              src={img}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      })()}
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-slate-900">{item.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.campus?.split(",")[0]}</p>
                          </div>
                          <div className="flex gap-2">
                            {item.matchScore && (
                              <span className="text-xs font-bold text-green-500 bg-[#F0FDF4] px-2 py-0.5 rounded-full">
                                {item.matchScore}% match
                              </span>
                            )}
                            {(isAdmin || item.userId === user?.id) && (
                              <button 
                                onClick={() => {
                                  toast("Are you sure you want to delete this listing?", {
                                    action: {
                                      label: "Delete",
                                      onClick: () => deleteListingMutation.mutate({ id: item.id }, {
                                        onSuccess: () => {
                                          toast.success("Deleted listing");
                                          utils.listings.list.invalidate();
                                        }
                                      })
                                    }
                                  });
                                }}
                                className="text-red-500 bg-red-50 p-1.5 rounded-full"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        {(() => {
                          let wants: string[] = [];
                          try { wants = typeof item.wantItems === 'string' ? JSON.parse(item.wantItems) : (item.wantItems || []); } catch(e) {}
                          if (wants.length === 0) return null;
                          return (
                            <div className="mt-2">
                              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Wants</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {wants.map((w: string, i: number) => (
                                  <span key={i} className="text-xs bg-[#EFF6FF] text-blue-600 px-2 py-0.5 rounded-full">{w}</span>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                        {item.cashTopUpAllowed && item.cashTopUpAmount > 0 && (
                          <span className="mt-2 inline-block mpesa-badge">+ KES {item.cashTopUpAmount.toLocaleString()}</span>
                        )}
                        {item.userId !== user?.id && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => isJoined ? setProposeListing(item) : toast.info("Join the community to propose a swap!")}
                            className={`w-full mt-3 text-xs font-bold py-2.5 rounded-3xl ${isJoined ? 'gradient-green text-white' : 'bg-gray-100 text-gray-500'}`}
                          >
                            {isJoined ? "Propose Swap" : "Join to Swap"}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="mb-3" key={`wish-${item.id}`}>
                      <WishCard wish={item} hideOfferButton={!isJoined} onRespond={() => {
                        if (!isAuthenticated) return toast("Please login");
                        if (!isJoined) return toast("Join the community first");
                        setProposeWish(item);
                      }} />
                      {(isAdmin || item.userId === user?.id) && (
                        <div className="flex justify-end mt-2 px-3">
                          <button
                            onClick={() => {
                              toast("Are you sure you want to delete this wish?", {
                                action: {
                                  label: "Delete",
                                  onClick: () => deleteWishMutation.mutate({ id: item.id }, {
                                    onSuccess: () => {
                                      toast.success("Deleted wish");
                                      utils.wishes.list.invalidate();
                                    }
                                  })
                                }
                              });
                            }}
                            className="text-xs text-red-500 font-semibold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Swish
                          </button>
                        </div>
                      )}
                    </div>
                  )
                );
              })()}
            </motion.div>
          ) : activeTab === "discussions" ? (
            <motion.div
              key="discussions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {!isJoined && community.creatorId !== user?.id && community.type === "private" ? (
                <div className="text-center py-12">
                  <Lock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="font-semibold text-slate-900">Join to see discussions</p>
                  <p className="text-gray-400 text-sm mt-1">This is a private community</p>
                </div>
              ) : (
                <>
                  {isJoined && (
                    <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 mb-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[linear-gradient(90deg,#3B82F6_0%,#10B981_100%)] opacity-80" />
                      <div className="flex items-center gap-3 mb-5 mt-1">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <p className="font-extrabold text-slate-900 text-[18px]">Post to Community</p>
                      </div>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const target = e.target as HTMLFormElement;
                        const title = (target.elements.namedItem('title') as HTMLInputElement).value;
                        const content = (target.elements.namedItem('content') as HTMLInputElement).value;
                        const type = (target.elements.namedItem('type') as HTMLSelectElement)?.value || 'question';
                        
                        if (!title || !content) return toast.error("Fill in all fields");
                        createPostMutation.mutate({ communityId, userId: user?.id, title, content, type }, {
                          onSuccess: () => {
                            toast.success("Posted!");
                            target.reset();
                            utils.communityPosts.list.invalidate();
                          }
                        });
                      }} className="space-y-3">
                        <input name="title" placeholder="What's on your mind?" className="w-full text-[15px] font-bold bg-slate-50 border border-slate-100 rounded-[20px] px-5 py-4 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-50 transition-all placeholder:text-slate-400 shadow-inner text-slate-900" />
                        <textarea name="content" placeholder="Add more details..." className="w-full text-[15px] font-medium bg-slate-50 border border-slate-100 rounded-[20px] px-5 py-4 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-50 transition-all placeholder:text-slate-400 resize-none h-28 shadow-inner text-slate-900 leading-relaxed" />
                        
                        <div className="flex justify-between items-center pt-3 gap-3">
                          {isAdmin ? (
                            <div className="relative flex-1 max-w-[200px]">
                              <select name="type" className="w-full text-[13px] font-extrabold text-slate-700 bg-slate-100 border border-slate-200 rounded-full pl-4 pr-10 py-3 outline-none cursor-pointer hover:bg-slate-200 transition-colors appearance-none">
                                <option value="announcement">📢 Announcement</option>
                                <option value="question">💬 Discussion</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                          ) : (
                            <input type="hidden" name="type" value="question" />
                          )}
                          <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={createPostMutation.isPending} className={`ml-auto bg-slate-900 text-white px-8 py-3.5 rounded-[20px] text-[14px] font-extrabold shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-black transition-all flex items-center justify-center gap-2 ${isAdmin ? "" : "w-full sm:w-auto"}`}>
                             {createPostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Now"}
                          </motion.button>
                        </div>
                      </form>
                    </div>
                  )}

                  {postsQuery.isLoading ? (
                    <div className="space-y-3 mt-4">
                      {[1, 2, 3].map(i => (
                        <div key={`sk-cpost-${i}`} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
                           <div className="w-1/3 h-5 bg-gray-100 rounded-full mb-3"></div>
                           <div className="w-full h-4 bg-gray-100 rounded-full mb-2"></div>
                           <div className="w-4/5 h-4 bg-gray-100 rounded-full mb-4"></div>
                           <div className="flex items-center gap-2">
                             <div className="w-5 h-5 bg-gray-100 rounded-full"></div>
                             <div className="w-24 h-3 bg-gray-100 rounded-full"></div>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : postsQuery.data?.items?.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">No discussions yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {([...(postsQuery.data?.items || [])]).sort((a: any, b: any) => {
                        if (a.type === 'announcement' && b.type !== 'announcement') return -1;
                        if (a.type !== 'announcement' && b.type === 'announcement') return 1;
                        return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
                      }).map((post: any) => (
                        <div key={post.id} className={`bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 relative overflow-hidden flex flex-col`}>
                          <div className={`absolute top-0 bottom-0 left-0 w-[6px] ${post.type === 'announcement' ? 'bg-[#F97316]' : 'bg-[#3B82F6]'}`} />
                          
                          <div className="pl-3">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${post.type === 'announcement' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                {post.type}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-gray-400">{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                                {(isAdmin || post.userId === user?.id) && (
                                  <button
                                    onClick={() => {
                                      toast("Are you sure you want to delete this post?", {
                                        action: {
                                          label: "Delete",
                                          onClick: () => deletePostMutation.mutate({ id: post.id }, {
                                            onSuccess: () => {
                                              toast.success("Post deleted");
                                              utils.communityPosts.list.invalidate();
                                            }
                                          })
                                        }
                                      });
                                    }}
                                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <h4 className="font-extrabold text-[16px] text-slate-900 leading-snug">{post.title}</h4>
                            <p className="text-[13.5px] font-medium text-gray-600 mt-1.5 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                            
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-extrabold text-gray-400">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] text-slate-900">
                                  {(post.profiles?.name || post.user?.name || "U")[0].toUpperCase()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>By {(() => {
                                    try {
                                      const n = post.profiles?.name || post.user?.name;
                                      let uni: any = {};
                                      let desc: any = {};
                                      try { uni = JSON.parse(post.profiles?.university || "{}"); } catch(e) {}
                                      try { desc = JSON.parse(post.profiles?.description || "{}"); } catch(e) {}
                                      let un = desc.username || uni.username;
                                      if (un) return un;
                                      return n && n !== "SwapSoko User" ? n.split(" ").join("").toLowerCase() : "user";
                                    } catch(e) { return "user"; }
                                  })()}</span>
                                  {post.profiles?.isStudentVerified && <GraduationCap className="w-3.5 h-3.5 text-[#3B82F6]" />}
                                </div>
                              </div>
                            </div>
                          </div>

                          {post.type !== 'announcement' && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="space-y-2 mb-3">
                                {(post.communityPostReplies || []).map((reply: any) => (
                                  <div key={reply.id} className="bg-gray-50 rounded-2xl p-3">
                                    <p className="text-xs text-slate-900">{reply.content}</p>
                                    <div className="flex justify-between items-center mt-1">
                                      <div className="flex items-center gap-1">
                                        <p className="text-xs text-gray-400">@{(() => {
                                          try {
                                            const n = reply.profiles?.name || reply.user?.name;
                                            let uni: any = {};
                                            let desc: any = {};
                                            try { uni = JSON.parse(reply.profiles?.university || "{}"); } catch(e) {}
                                            try { desc = JSON.parse(reply.profiles?.description || "{}"); } catch(e) {}
                                            let un = desc.username || uni.username;
                                            if (un) return un;
                                            return n && n !== "SwapSoko User" ? n.split(" ").join("").toLowerCase() : "user";
                                          } catch(e) { return "user"; }
                                        })()}</p>
                                        {reply.profiles?.isStudentVerified && <GraduationCap className="w-3 h-3 text-[#3B82F6]" />}
                                      </div>
                                      <p className="text-xs text-gray-400">{new Date(reply.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const target = e.target as HTMLFormElement;
                                const content = (target.elements.namedItem('replyContent') as HTMLInputElement).value;
                                if (!content.trim()) return;
                                createReplyMutation.mutate({ postId: post.id, userId: user?.id, content }, {
                                  onSuccess: () => {
                                    target.reset();
                                    utils.communityPosts.list.invalidate();
                                  }
                                });
                              }} className="flex gap-2">
                                <input name="replyContent" placeholder="Write a reply..." className="flex-1 bg-gray-50 rounded-full px-3 py-1.5 text-xs outline-none focus:border focus:border-green-500" />
                                <button type="submit" disabled={createReplyMutation.isPending} className="gradient-green text-white px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                                  Reply
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : null}

          {activeTab === "members" ? (
            <motion.div
              key="members"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {!isJoined && community.creatorId !== user?.id && community.type === "private" ? (
                <div className="text-center py-12">
                  <Lock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="font-semibold text-slate-900">Join to see members</p>
                  <p className="text-gray-400 text-sm mt-1">This is a private community</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(community.communityMembers || []).map((m: any, i: number) => {
                    const isMemberAdmin = community.admins?.includes(m.userId) || (m.userId === community.creatorId && (!community.admins || community.admins.length === 0));
                    return (
                      <div 
                        key={m.id || i} 
                        className="bg-white rounded-3xl p-4 flex items-center justify-between card-shadow cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => navigate(`/profile/${m.userId}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                            {m.profile?.avatarUrl ? <img src={m.profile.avatarUrl} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-gray-400" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{m.userId === user?.id ? "You" : m.profile?.name}</p>
                            <p className="text-xs text-gray-400">
                              {m.userId === community.creatorId ? "Creator" : isMemberAdmin ? "Admin" : "Member"}
                            </p>
                          </div>
                        </div>
                        {isAdmin && m.userId !== community.creatorId && m.userId !== user?.id && (
                          <div className="flex gap-2">
                            {!isMemberAdmin ? (
                              <button
                                onClick={() => {
                                  makeAdminMutation.mutate({ communityId, userId: m.userId }, {
                                    onSuccess: () => {
                                      toast.success("Promoted to Admin");
                                      utils.communities.get.invalidate();
                                    }
                                  });
                                }}
                                className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
                                title="Make Admin"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  toast("Demote this admin?", {
                                    id: "demote-admin-" + m.userId,
                                    action: {
                                      label: "Demote",
                                      onClick: () => demoteAdminMutation.mutate({ communityId, userId: m.userId }, {
                                        onSuccess: () => {
                                          toast.success("Demoted to Member");
                                          utils.communities.get.invalidate();
                                        }
                                      })
                                    }
                                  });
                                }}
                                className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"
                                title="Demote to Member"
                              >
                                <ShieldOff className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                toast("Remove this member?", {
                                  action: {
                                    label: "Remove",
                                    onClick: () => removeMemberMutation.mutate({ communityId, userId: m.userId }, {
                                      onSuccess: () => {
                                        toast.success("Member removed");
                                        utils.communities.get.invalidate();
                                      }
                                    })
                                  }
                                });
                              }}
                              className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center"
                              title="Remove Member"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showEdit && <EditCommunityModal community={community} onClose={() => setShowEdit(false)} />}
        {showJoinCodeModal && <JoinCodeModal community={community} onClose={() => setShowJoinCodeModal(false)} onJoin={handleJoinWithCode} />}
        <ReportModal isOpen={isReporting} onClose={() => setIsReporting(false)} targetType="community" targetId={String(communityId)} />
      </AnimatePresence>
      {/* Floating Action Button for Posting in Soko */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-40 h-[120px] flex items-end justify-end p-4 pb-6">
        {isJoined && activeTab === "feed" && !showActionSheet && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setShowActionSheet(true)}
            className="w-[120px] h-[56px] bg-slate-900 rounded-[28px] shadow-[0_12px_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 pointer-events-auto border border-slate-700 hover:bg-black group"
          >
            <Plus className="w-5 h-5 text-emerald-400 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-white font-extrabold text-[15px]">New</span>
          </motion.button>
        )}
      </div>
      <AnimatePresence>
        {showActionSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setShowActionSheet(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md rounded-t-[40px] p-7 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-32 bg-[linear-gradient(120deg,#e0c3fc_0%,#8ec5fc_100%)] opacity-20 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />

              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 relative z-10" />
              <h3 className="font-extrabold text-[22px] text-slate-900 tracking-tight leading-none text-center mb-6 relative z-10">Post to {community.name}</h3>
              
              <div className="space-y-4 relative z-10">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isAuthenticated) return toast("Please login first");
                    if (!isJoined) return toast("Join the community first");
                    setShowActionSheet(false); navigate(`/post?communityId=${communityId}`); 
                  }}
                  className="w-full bg-slate-50 text-slate-900 font-extrabold py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-emerald-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-[16px] bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-[15px]">Post a Swap Listing</span>
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isAuthenticated) return toast("Please login first");
                    if (!isJoined) return toast("Join the community first");
                    setShowActionSheet(false); setShowCreateWish(true); 
                  }}
                  className="w-full bg-slate-50 text-slate-900 font-extrabold py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-pink-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-[16px] bg-pink-50 text-pink-500 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-[15px]">Post a Swish (Wish)</span>
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowActionSheet(false)}
                  className="w-full mt-4 bg-slate-900 text-white font-extrabold py-5 rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-black hover:shadow-[0_12px_25px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 text-[15px]"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showCreateWish && <CreateWishModal onClose={() => setShowCreateWish(false)} communityId={communityId} />}
        {proposeListing && (
          <ProposeSwapModal
            listing={proposeListing}
            onClose={() => setProposeListing(null)}
            onSend={handleSendProposal}
          />
        )}
        {proposeWish && (
          <ProposeSwapModal
            listing={proposeWish}
            onClose={() => setProposeWish(null)}
            onSend={handleSendProposal}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
