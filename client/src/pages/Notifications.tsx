import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, Bell, Check, ArrowRightLeft, MessageCircle, Star, Shield, CheckCircle2, Users } from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";



export default function NotificationsPage() {
    const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [localRead, setLocalRead] = useState<Set<number>>(new Set());

  const notifsQuery = trpc.notifications.list.useQuery({ userId: user?.id }, {
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });
  const markReadMutation = trpc.notifications.markRead.useMutation();

  const rawItems: any[] = isAuthenticated
    ? (notifsQuery.data?.items || [])
    : [];

  const notifications = rawItems.map((n: any) => ({
    ...n,
    isRead: n.isRead || localRead.has(n.id),
    time: new Date(n.createdAt || n.time || Date.now()),
    icon: n.icon || n.type || 'proposal',
    color: n.color || (n.type === 'proposal' ? '#22C55E' : n.type === 'message' ? '#2563EB' : '#F59E0B'),
  }));

  const filtered = filter === "unread"
    ? notifications.filter((n: any) => !n.isRead)

    : notifications;

  const markAllRead = () => {
    notifications.forEach((n: any) => {
      if (!n.isRead) {
        setLocalRead(prev => new Set([...Array.from(prev), n.id]));
        if (isAuthenticated) markReadMutation.mutate({ id: n.id });
      }
    });
  };

  const markRead = (id: number) => {
    setLocalRead(prev => new Set([...Array.from(prev), id]));
    if (isAuthenticated) markReadMutation.mutate({ id });
  };

  const joinMutation = trpc.communities.join.useMutation();

  const handleAcceptRequest = (e: React.MouseEvent, notif: any) => {
    e.stopPropagation();
    console.log("handleAcceptRequest clicked", notif);
    if (!notif.link) {
      toast.error("Invalid notification link");
      return;
    }
    
    // Simple parsing of link: /community-request/123?userId=abc
    const match = notif.link.match(/\/community-request\/(\d+)\?userId=(.+)/);
    if (match) {
       const communityId = parseInt(match[1], 10);
       const userId = match[2];
       joinMutation.mutate({ communityId, userId }, {
         onSuccess: () => {
           toast.success("Request approved! User has been added to the community.");
           markRead(notif.id);
         },
         onError: (err: any) => {
           if (err?.code === '23505' || err?.message?.includes('already exists')) {
             toast("User is already in the community.");
             markRead(notif.id);
           } else {
             toast.error("Failed to approve request.");
           }
         }
       });
    }
  };

  const handleDeclineRequest = (e: React.MouseEvent, notif: any) => {
    e.stopPropagation();
    toast.success("Request declined.");
    markRead(notif.id);
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

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
            <ChevronLeft className="w-5 h-5 text-[#0F172A]" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-[#0F172A] text-base">{"Notifications"}</h1>
            {unreadCount > 0 && (
              <div className="w-5 h-5 bg-[#22C55E] rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{unreadCount}</span>
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={markAllRead}
              className="text-xs text-[#22C55E] font-semibold"
            >
              Mark all read
            </motion.button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["all", "unread"] as const).map(f => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition-all shadow-sm ${
                filter === f ? "bg-[#0F172A] text-white" : "bg-white/70 backdrop-blur-md text-gray-500 border border-gray-100 hover:bg-white"
              }`}
            >
              {f === "all" ? "All" : `Unread (${unreadCount})`}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        <AnimatePresence>
          {filtered.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => {
                markRead(notif.id);
                if (notif.type === 'proposal' || notif.type === 'proposal_received') {
                  navigate(`/chat`); // Fallback: Proposals can also be viewed in chat rooms until specific Proposal Details is built
                } else if (notif.type === 'message' || notif.type === 'new_message' || notif.type === 'voice_note') {
                  navigate('/chat');
                } else if (notif.type === 'community_post') {
                  navigate(`/community/${notif.entityId || ''}`);
                } else if (notif.type === 'wishlist_match' || notif.type === 'recommendation') {
                  navigate(`/listing/${notif.entityId || ''}`);
                } else if (notif.type === 'verification') {
                  navigate('/profile');
                } else if (notif.link) {
                  navigate(notif.link);
                }
              }}
              className={`bg-white/80 backdrop-blur-md rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border flex items-start gap-4 cursor-pointer transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:bg-white ${
                !notif.isRead ? "border-l-4 border-l-[#22C55E] border-gray-100/50" : "border-gray-100"
              }`}
            >
              <div
                className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: notif.color + "15" }}
              >
                {notif.icon === "proposal" && <ArrowRightLeft size={20} color={notif.color} />}
                {notif.icon === "message" && <MessageCircle size={20} color={notif.color} />}
                {notif.icon === "wish_match" && <Star size={20} color={notif.color} />}
                {notif.icon === "swap_completed" && <CheckCircle2 size={20} color={notif.color} />}
                {notif.icon === "trust" && <Shield size={20} color={notif.color} />}
                {notif.icon === "community" && <Users size={20} color={notif.color} />}
                {!["proposal", "message", "wish_match", "swap_completed", "trust", "community"].includes(notif.icon) && <Bell size={20} color={notif.color} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-[15px] ${!notif.isRead ? "font-extrabold text-[#0F172A]" : "font-semibold text-gray-700"}`}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] font-semibold text-gray-400 flex-shrink-0 ml-2 uppercase tracking-wider">
                    {formatDistanceToNow(notif.time, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2 font-medium">{notif.body || notif.message}</p>
                {notif.type === "community_request" && !notif.isRead && (
                  <div className="flex gap-2 mt-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleAcceptRequest(e, notif)}
                      className="px-5 py-2.5 bg-[#0F172A] text-white text-xs font-bold rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:bg-[#1E293B] transition-colors"
                    >
                      Approve
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleDeclineRequest(e, notif)}
                      className="px-5 py-2.5 bg-white border border-gray-200 text-[#0F172A] text-xs font-bold rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      Decline
                    </motion.button>
                  </div>
                )}
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 bg-[#22C55E] rounded-full flex-shrink-0 mt-1.5" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-[#0F172A]">No notifications</p>
            <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
