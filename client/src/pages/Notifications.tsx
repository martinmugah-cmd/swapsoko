import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ChevronLeft, Bell, CheckCircle2, ShieldCheck, Shuffle, Handshake, AlertTriangle, MessageCircle, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const [, navigate] = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'ALL' | 'SWAPS' | 'SYSTEM'>('ALL');

  const filtered = notifications.filter(n => {
     if (filter === 'SWAPS') return n.type.includes('OFFER') || n.type.includes('MULTISWAP') || n.type === 'SWAP_COMPLETED';
     if (filter === 'SYSTEM') return n.type === 'SYSTEM' || n.type.includes('REPORT');
     return true;
  });

  const getIcon = (type: string) => {
      if (type.includes('OFFER') || type === 'SWAP_COMPLETED') return <Handshake className="w-5 h-5 text-emerald-500" />;
      if (type.includes('MULTISWAP')) return <Shuffle className="w-5 h-5 text-blue-500" />;
      if (type.includes('MESSAGE')) return <MessageCircle className="w-5 h-5 text-purple-500" />;
      if (type.includes('REPORT') || type === 'SYSTEM') return <AlertTriangle className="w-5 h-5 text-red-500" />;
      return <Bell className="w-5 h-5 text-gray-500" />;
  };

  const handleNotificationClick = (n: any) => {
      if (!n.isRead) markAsRead(n.id);

      // Route based on entityType
      if (n.type.includes('MULTISWAP')) navigate('/multiswap');
      else if (n.type.includes('OFFER') || n.type === 'SWAP_COMPLETED') navigate('/swipes');
      else if (n.type.includes('MESSAGE')) navigate('/chat/123'); // mock route
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-6 h-6 text-slate-800" />
          </button>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Notifications</h1>
          <button onClick={markAllAsRead} className="p-2 -mr-2 text-emerald-500 rounded-full hover:bg-emerald-50 relative">
             <CheckCircle2 className="w-6 h-6" />
             {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
           {['ALL', 'SWAPS', 'SYSTEM'].map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f as any)}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
               >
                  {f.charAt(0) + f.slice(1).toLowerCase()}
               </button>
           ))}
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-3">
         <AnimatePresence>
            {filtered.map(n => (
                <motion.div
                   key={n.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   onClick={() => handleNotificationClick(n)}
                   className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer relative overflow-hidden transition-colors ${!n.isRead ? 'border-emerald-500/30' : 'border-gray-100'}`}
                >
                    {!n.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                    )}
                    <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                            {getIcon(n.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`text-sm ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{n.title}</h3>
                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                    {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                                </span>
                            </div>
                            <p className={`text-sm mt-0.5 leading-snug ${!n.isRead ? 'text-slate-700' : 'text-slate-500'}`}>{n.body}</p>
                            
                            {/* Rich Content Example */}
                            {n.type === 'OFFER_ACCEPTED' && (
                                <div className="mt-3 bg-gray-50 rounded-xl p-2 flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-600">View Swap details &rarr;</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
         </AnimatePresence>

         {filtered.length === 0 && (
             <div className="text-center py-20">
                 <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                 <h3 className="text-lg font-bold text-slate-800">No notifications</h3>
                 <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
             </div>
         )}
      </div>
    </div>
  );
}
