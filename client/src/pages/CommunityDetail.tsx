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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-[480px] mx-auto rounded-t-[32px] p-5 pb-28"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <h3 className="font-bold text-[#0F172A] text-lg">Edit Soko</h3>
        
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Icon</label>
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-colors ${
                  icon && icon.startsWith('data:image') ? "bg-[#22C55E]/10 border-2 border-[#22C55E] text-[#22C55E]" : "bg-gray-100 border-2 border-transparent text-gray-500"
                }`}
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : icon && icon.startsWith('data:image') ? <img src={icon} className="w-full h-full object-cover rounded-[12px]" /> : <ImageIcon className="w-5 h-5" />}
              </button>
              {ICONS.map(i => {
                const IconComp = { Users, GraduationCap, Laptop: Cpu, BookOpen, Gamepad2, Stethoscope, Camera, Home }[i] || Users;
                return (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-colors ${
                      icon === i ? "bg-[#22C55E]/10 border-2 border-[#22C55E] text-[#22C55E]" : "bg-gray-100 border-2 border-transparent text-gray-500"
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Soko Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-[32px] px-3 py-2.5 text-sm outline-none focus:border-[#22C55E]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full mt-1 border border-gray-200 rounded-[32px] px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] resize-none" />
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={updateMutation.isPending} className="w-full mt-6 gradient-green text-white font-bold py-3.5 rounded-[32px] text-sm">
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
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
        className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-bold text-[#0F172A] text-lg text-center mb-2">Join {community.name}</h3>
        <p className="text-gray-500 text-sm text-center mb-4">Enter the invite code to join this private community.</p>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Invite Code"
          className="w-full border border-gray-200 rounded-[32px] px-4 py-3 text-sm outline-none focus:border-[#22C55E] uppercase text-center font-bold tracking-widest mb-6"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-[32px] text-sm font-bold bg-gray-100 text-gray-600">Cancel</button>
          <button onClick={() => onJoin(code)} className="flex-1 py-3 rounded-[32px] text-sm font-bold gradient-green text-white">Join</button>
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
          <div className="w-[100px] h-[100px] rounded-[32px] bg-gray-100 border-[4px] border-[#F8FAFC] shadow-sm mb-4"></div>
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
            <div className="h-32 w-full bg-gray-200 rounded-[24px]"></div>
            <div className="h-32 w-full bg-gray-200 rounded-[24px]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-[24px] bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4"><Package className="w-8 h-8" /></div>
        <p className="font-bold text-[#0F172A]">Community not found</p>
        <button onClick={() => navigate("/communities")} className="mt-4 text-[#2563EB] text-sm font-semibold">
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
      {/* Header */}
      <div className="bg-[#0F172A] px-4 pt-4 pb-6 relative overflow-hidden rounded-b-[32px]">
        {icon && (icon.startsWith("data:image") || icon.startsWith("http")) ? (
          <div className="absolute inset-0">
            <img src={icon} className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ) : (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#2563EB] rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
        )}

        <div className="relative flex items-center justify-between mb-4">
          <button onClick={() => navigate("/communities")} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            {isAdmin && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEdit(true)}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
              >
                <Edit2 className="w-4 h-4 text-white" />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toast("Share link copied!")}
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
            >
              <Share2 className="w-4 h-4 text-white" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsReporting(true)}
              className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20"
            >
              <Flag className="w-4 h-4 text-red-400" />
            </motion.button>
          </div>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-[32px] bg-white/10 flex items-center justify-center text-white overflow-hidden">
            {(() => {
              if (icon && typeof icon === "string") {
                if (icon.startsWith("data:image") || icon.startsWith("http")) {
                  return <img src={icon} className="w-full h-full object-cover" />;
                }
                const iconMap: Record<string, any> = { Users, GraduationCap, Laptop: Cpu, BookOpen, Gamepad2, Stethoscope, Camera, Home };
                const IconComp = iconMap[icon] || Users;
                return <IconComp className="w-8 h-8" />;
              }
              return <Users className="w-8 h-8" />;
            })()}
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-white text-xl">{community.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <Users className="w-3 h-3" />
                {(community.memberCount || 0).toLocaleString()} members
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                community.type === "public" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-orange-500/20 text-orange-400"
              }`}>
                {community.type === "public" ? "Public" : "Private"}
              </span>
            </div>
          </div>
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
          return (
            <p className="relative text-gray-400 text-sm mt-3 leading-relaxed">
              {textToShow}
            </p>
          );
        })()}

        <div className="relative mt-4 flex gap-2">
          {community.creatorId === user?.id && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                toast("Are you sure you want to delete this community?", {
                  id: "delete-community",
                  action: {
                    label: "Yes, Delete",
                    onClick: () => deleteMutation.mutate({ id: communityId }, {
                      onSuccess: () => {
                        utils.communities.list.invalidate();
                        utils.communities.myMemberships.invalidate();
                        toast.success("Community deleted");
                        navigate("/communities");
                      }
                    })
                  }
                });
              }}
              disabled={deleteMutation.isPending}
              className="flex-1 py-2.5 rounded-[32px] text-sm font-bold transition-colors bg-red-500/20 text-red-500 border border-red-500/30"
            >
              {deleteMutation.isPending ? "..." : "Delete Soko"}
            </motion.button>
          )}
          {(!isJoined || community.creatorId !== user?.id) && (
            <div className="flex-1 flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                   if (community.type === "private" && !isJoined) {
                      setShowJoinCodeModal(true);
                   } else {
                      handleJoinLeave();
                   }
                }}
                disabled={joinMutation.isPending || leaveMutation.isPending || (hasRequested && community.type === "private")}
                className={`flex-1 py-2.5 rounded-[32px] text-sm font-bold transition-colors ${
                  isJoined || (hasRequested && community.type === "private")
                    ? "bg-white/10 text-white border border-white/20"
                    : "gradient-green text-white"
                }`}
              >
                {joinMutation.isPending || leaveMutation.isPending
                  ? "..."
                  : isJoined ? <span className="flex items-center gap-1 justify-center"><Check className="w-4 h-4"/> Leave</span> 
                  : (hasRequested && community.type === "private") ? "Requested" 
                  : community.type === "private" ? "Join with Code" : "Join Community"}
              </motion.button>
              
              {!isJoined && community.type === "private" && !hasRequested && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleJoinLeave}
                  className="flex-1 py-2.5 rounded-[32px] text-sm font-bold transition-colors bg-white text-[#0F172A]"
                >
                  Request to Join
                </motion.button>
              )}
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const newVal = !notificationsEnabled;
              setNotificationsEnabled(newVal);
              localStorage.setItem(`notif_comm_${communityId}`, String(newVal));
              toast(newVal ? "Notifications enabled for this community" : "Notifications disabled");
            }}
            className="w-10 h-10 bg-white/10 rounded-[32px] flex items-center justify-center"
          >
            {notificationsEnabled ? <Bell className="w-4 h-4 text-white" /> : <BellOff className="w-4 h-4 text-white" />}
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-[32px]">
          {[
            { id: "feed", label: "Community Feed", icon: <Package className="w-3.5 h-3.5" /> },
            { id: "discussions", label: "Discussions", icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: "members", label: "Members", icon: <Users className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[32px] text-xs font-semibold transition-colors ${
                activeTab === tab.id ? "bg-white text-[#0F172A] card-shadow" : "text-gray-500"
              }`}
            >
              {tab.icon} {tab.label}
            </motion.button>
          ))}
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
                  <p className="font-semibold text-[#0F172A]">Join to see listings</p>
                  <p className="text-gray-400 text-sm mt-1">This is a private community</p>
                </div>
              ) : feedQuery.isLoading || wishesQuery.isLoading ? (
                <div className="space-y-3 mt-4">
                  {[1, 2, 3].map(i => (
                    <div key={`sk-cfeed-${i}`} className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-[16px]"></div>
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
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="font-semibold text-[#0F172A]">No posts yet</p>
                      {isJoined ? (
                        <>
                          <p className="text-gray-400 text-sm mt-1">Be the first to post in this community!</p>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowActionSheet(true)}
                            className="mt-4 gradient-green text-white font-semibold px-6 py-2.5 rounded-[32px] text-sm"
                          >
                            Post Something
                          </motion.button>
                        </>
                      ) : (
                        <p className="text-gray-400 text-sm mt-1">Join the community to post the first item!</p>
                      )}
                    </div>
                  );
                }

                return combinedFeed.map((item: any) => 
                  item._type === 'listing' ? (
                    <motion.div
                      key={`listing-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white rounded-[32px] overflow-hidden card-shadow mb-3"
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
                            <p className="font-bold text-[#0F172A]">{item.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.campus?.split(",")[0]}</p>
                          </div>
                          <div className="flex gap-2">
                            {item.matchScore && (
                              <span className="text-xs font-bold text-[#22C55E] bg-[#F0FDF4] px-2 py-0.5 rounded-full">
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
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Wants</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {wants.map((w: string, i: number) => (
                                  <span key={i} className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-full">{w}</span>
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
                            className={`w-full mt-3 text-xs font-bold py-2.5 rounded-[32px] ${isJoined ? 'gradient-green text-white' : 'bg-gray-100 text-gray-500'}`}
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
                  <p className="font-semibold text-[#0F172A]">Join to see discussions</p>
                  <p className="text-gray-400 text-sm mt-1">This is a private community</p>
                </div>
              ) : (
                <>
                  {isJoined && (
                    <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 mb-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 gradient-green" />
                      <p className="font-extrabold text-[#0F172A] text-[17px] mb-4 mt-1">Post to Community</p>
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
                      }} className="space-y-4">
                        <input name="title" placeholder="Title" className="w-full text-[14px] font-semibold bg-gray-50 border border-transparent rounded-[16px] px-4 py-3 focus:outline-none focus:bg-white focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10 transition-all placeholder:text-gray-400" />
                        <textarea name="content" placeholder="Write something..." className="w-full text-[14px] font-medium bg-gray-50 border border-transparent rounded-[16px] px-4 py-3 focus:outline-none focus:bg-white focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10 transition-all placeholder:text-gray-400 resize-none h-24" />
                        <div className="flex justify-between items-center pt-2">
                          {isAdmin ? (
                            <select name="type" className="text-[12px] font-extrabold text-gray-600 bg-gray-100 border-none rounded-full px-4 py-2 outline-none cursor-pointer hover:bg-gray-200 transition-colors">
                              <option value="announcement">Announcement</option>
                              <option value="question">Question</option>
                            </select>
                          ) : (
                            <input type="hidden" name="type" value="question" />
                          )}
                          <button type="submit" disabled={createPostMutation.isPending} className="bg-[#22C55E] text-white px-6 py-2.5 rounded-[20px] text-[13px] font-extrabold shadow-[0_4px_15px_rgba(34,197,94,0.3)] hover:scale-105 transition-transform">
                            Post
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {postsQuery.isLoading ? (
                    <div className="space-y-3 mt-4">
                      {[1, 2, 3].map(i => (
                        <div key={`sk-cpost-${i}`} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm animate-pulse">
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
                        <div key={post.id} className={`bg-white rounded-[28px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 relative overflow-hidden flex flex-col`}>
                          <div className={`absolute top-0 bottom-0 left-0 w-[6px] ${post.type === 'announcement' ? 'bg-[#F97316]' : 'bg-[#3B82F6]'}`} />
                          
                          <div className="pl-3">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-[8px] uppercase tracking-wider ${post.type === 'announcement' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
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
                            <h4 className="font-extrabold text-[16px] text-[#0F172A] leading-snug">{post.title}</h4>
                            <p className="text-[13.5px] font-medium text-gray-600 mt-1.5 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                            
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-extrabold text-gray-400">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] text-[#0F172A]">
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
                                  <div key={reply.id} className="bg-gray-50 rounded-[16px] p-3">
                                    <p className="text-xs text-[#0F172A]">{reply.content}</p>
                                    <div className="flex justify-between items-center mt-1">
                                      <div className="flex items-center gap-1">
                                        <p className="text-[10px] text-gray-400">@{(() => {
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
                                      <p className="text-[10px] text-gray-400">{new Date(reply.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
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
                                <button type="submit" disabled={createReplyMutation.isPending} className="gradient-green text-white px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap">
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
                  <p className="font-semibold text-[#0F172A]">Join to see members</p>
                  <p className="text-gray-400 text-sm mt-1">This is a private community</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(community.communityMembers || []).map((m: any, i: number) => {
                    const isMemberAdmin = community.admins?.includes(m.userId) || (m.userId === community.creatorId && (!community.admins || community.admins.length === 0));
                    return (
                      <div 
                        key={m.id || i} 
                        className="bg-white rounded-[32px] p-4 flex items-center justify-between card-shadow cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => navigate(`/profile/${m.userId}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                            {m.profile?.avatarUrl ? <img src={m.profile.avatarUrl} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-gray-400" />}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F172A]">{m.userId === user?.id ? "You" : m.profile?.name}</p>
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
        <ReportModal isOpen={isReporting} onClose={() => setIsReporting(false)} targetType="community" targetId={communityId} />
      </AnimatePresence>
      {/* Floating Action Button for Posting in Soko (Constrained to mobile frame) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-40 h-full">
        {isJoined && activeTab === "feed" && !showActionSheet && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowActionSheet(true)}
            className="absolute bottom-24 right-4 w-14 h-14 bg-[#3B82F6] rounded-[32px] shadow-[0_8px_30px_rgba(59,130,246,0.3)] flex items-center justify-center pointer-events-auto"
          >
            <Plus className="w-6 h-6 text-white" />
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
              className="bg-white w-full max-w-md rounded-t-[36px] p-6 pb-28 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <h3 className="font-extrabold text-[#0F172A] text-xl mb-6 text-center tracking-tight">Post to {community.name}</h3>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    if (!isAuthenticated) return toast("Please login first");
                    if (!isJoined) return toast("Join the community first");
                    setShowActionSheet(false); navigate(`/post?communityId=${communityId}`); 
                  }}
                  className="w-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-extrabold py-4.5 rounded-[24px] flex items-center justify-center gap-2.5 shadow-sm hover:bg-blue-100 transition-colors"
                >
                  <Package className="w-5 h-5" /> Post a Swap Listing
                </button>
                <button
                  onClick={() => {
                    if (!isAuthenticated) return toast("Please login first");
                    if (!isJoined) return toast("Join the community first");
                    setShowActionSheet(false); setShowCreateWish(true); 
                  }}
                  className="w-full bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] font-extrabold py-4.5 rounded-[24px] flex items-center justify-center gap-2.5 shadow-sm hover:bg-red-50 transition-colors"
                >
                  <Star className="w-5 h-5" /> Post a Swish (Wish)
                </button>
                <button
                  onClick={() => setShowActionSheet(false)}
                  className="w-full bg-gray-50 border border-gray-100 text-gray-500 font-extrabold py-4.5 rounded-[24px] mt-2 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
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
