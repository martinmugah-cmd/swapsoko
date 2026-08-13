import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, Bell, Check, ArrowRightLeft, MessageCircle, Star, Shield, CheckCircle2, Users } from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

function NotificationItem({ notif, index, onMarkRead, onAccept, onDecline, navigate }: any) {
  const [swiped, setSwiped] = useState(false);
  const swipeThreshold = -60;

  return (
    <div className="relative rounded-[24px] overflow-hidden mb-2 shadow-sm bg-gray-100">
      {/* Background Action: Mark Read / Dismiss */}
      <div className="absolute inset-0 bg-green-500 flex items-center justify-end px-6 rounded-[24px]">
        <Check className="w-6 h-6 text-white" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0 }}
        onDragEnd={(e, info) => {
          if (info.offset.x < swipeThreshold) {
            onMarkRead(notif.id);
            toast("Notification marked read", { icon: "✅" });
          }
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ delay: index * 0.04 }}
        onClick={() => {
          onMarkRead(notif.id);
          if (notif.type === 'proposal' || notif.type === 'proposal_received') {
            navigate(`/chat`);
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
        className={`bg-white/90 backdrop-blur-xl rounded-[24px] p-5 border flex items-start gap-4 cursor-pointer relative z-10 hover:bg-white transition-colors ${
          !notif.isRead ? "border-green-500/30 shadow-[0_4px_20px_rgba(34,197,94,0.08)]" : "border-transparent shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
        }`}
      >
        <div
          className="w-[52px] h-[52px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ backgroundColor: notif.color + "15", border: `1px solid ${notif.color}30` }}
        >
          {notif.icon === "proposal" && <ArrowRightLeft size={22} color={notif.color} />}
          {notif.icon === "message" && <MessageCircle size={22} color={notif.color} />}
          {notif.icon === "wish_match" && <Star size={22} color={notif.color} />}
          {notif.icon === "swap_completed" && <CheckCircle2 size={22} color={notif.color} />}
          {notif.icon === "trust" && <Shield size={22} color={notif.color} />}
          {notif.icon === "community" && <Users size={22} color={notif.color} />}
          {!["proposal", "message", "wish_match", "swap_completed", "trust", "community"].includes(notif.icon) && <Bell size={22} color={notif.color} />}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center justify-between mb-1">
            <p className={`text-[15px] truncate pr-2 ${!notif.isRead ? "font-extrabold text-slate-900" : "font-bold text-gray-700"}`}>
              {notif.title}
            </p>
            <span className="text-[11px] font-bold text-gray-400 flex-shrink-0 uppercase tracking-wider">
              {formatDistanceToNow(notif.time, { addSuffix: true })}
            </span>
          </div>
          <p className="text-[14px] text-gray-500 mt-1 leading-relaxed line-clamp-2 font-medium">{notif.body || notif.message}</p>
          {notif.type === "community_request" && !notif.isRead && (
            <div className="flex gap-2 mt-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => onAccept(e, notif)}
                className="px-5 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded-full shadow-md hover:bg-[#1E293B] transition-colors"
              >
                Approve
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => onDecline(e, notif)}
                className="px-5 py-2.5 bg-white border border-gray-200 text-slate-900 text-[13px] font-bold rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              >
                Decline
              </motion.button>
            </div>
          )}
        </div>
        {!notif.isRead && (
          <div className="absolute top-5 right-5 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        )}
      </motion.div>
    </div>
  );
}

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
      {/* Dynamic Floating Header */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-2">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex flex-col gap-3 bg-white/70 backdrop-blur-3xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[24px] px-4 py-3 max-w-[800px] mx-auto w-full"
        >
          <div className="flex items-center justify-between relative">
            <button onClick={() => navigate("/")} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200/80 transition-colors text-slate-900 relative z-10">
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>
            
            <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
              <h1 className="font-extrabold text-slate-900 text-[18px] flex items-center justify-center gap-1.5 tracking-tight">
                <Bell className="w-4 h-4 text-emerald-500" /> Notifications
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Updates</p>
            </div>

            <div className="flex items-center relative z-10">
              {unreadCount > 0 ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={markAllRead}
                  className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[12px] font-bold"
                >
                  Read All
                </motion.button>
              ) : (
                <div className="w-10 h-10" />
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(["all", "unread"] as const).map(f => (
              <motion.button
                key={f}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded-[16px] text-[13px] font-bold capitalize transition-all ${
                  filter === f ? "bg-slate-900 text-white shadow-md" : "bg-slate-100/50 text-slate-600 hover:bg-slate-200/50"
                }`}
              >
                {f === "all" ? "All" : `Unread (${unreadCount})`}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-4 space-y-2">
        <AnimatePresence>
          {filtered.map((notif, i) => (
            <NotificationItem 
               key={notif.id} 
               notif={notif} 
               index={i} 
               onMarkRead={markRead} 
               onAccept={handleAcceptRequest} 
               onDecline={handleDeclineRequest} 
               navigate={navigate} 
            />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">No notifications</p>
            <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
