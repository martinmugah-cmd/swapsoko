import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, QrCode } from 'lucide-react';
import { trpc } from '../lib/trpc';

function PreviewUser({ uid }: { uid: string }) {
   const profileQuery = trpc.profile.get.useQuery({ id: uid }, { enabled: !!uid });
   let partnerName = profileQuery.isLoading ? "Loading..." : (uid ? uid.slice(0,5) : "Unknown");
   try {
      if (profileQuery.data) {
        const desc = JSON.parse(profileQuery.data?.university || "{}");
        partnerName = desc.username || profileQuery.data?.name || partnerName;
      }
   } catch(e) {
      if (profileQuery.data?.name) partnerName = profileQuery.data.name;
   }
   return <span>@{partnerName}</span>;
}

export function TradeCertificate({
  onClose,
  cycleInfo,
  currentUserId
}: {
  onClose: () => void;
  cycleInfo: any;
  currentUserId: string;
}) {
  const latestRevision = cycleInfo.revisions ? cycleInfo.revisions[cycleInfo.revisions.length - 1] : cycleInfo;
  const cycle = latestRevision.cycle;
  
  // Dummy receipt number
  const receiptNo = `MS-2026-${Math.floor(Math.random() * 90000) + 10000}`;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#fafafa] w-full max-w-lg rounded-[24px] shadow-2xl relative my-8"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-black text-white p-6 rounded-t-[24px] flex justify-between items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
             <div>
                <h3 className="font-black text-2xl tracking-tight">Trade Certificate</h3>
                <p className="text-white/60 text-xs font-bold font-mono mt-1 tracking-widest">{receiptNo}</p>
             </div>
             <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors z-10">
                <X className="w-5 h-5 text-white" />
             </button>
          </div>

          <div className="p-6 space-y-8">
             {/* Status Grid */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                   <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                   <p className="font-black text-green-600 text-sm flex items-center gap-1.5">
                     <CheckCircle2 className="w-4 h-4" /> ACCEPTED
                   </p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                   <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Revision</p>
                   <p className="font-black text-gray-800 text-sm">#{latestRevision.id || 1}</p>
                </div>
             </div>

             {/* Trade Flow */}
             <div>
                <h4 className="font-extrabold text-gray-900 text-sm mb-4 border-b border-gray-200 pb-2">Trade Flow</h4>
                <div className="space-y-4">
                  {cycle.legs?.map((leg: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 shrink-0">
                            <img src={leg.images?.[0] || leg.receiveImages?.[0] || 'https://via.placeholder.com/150'} alt="item" className="w-full h-full object-cover rounded-xl" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{leg.title || leg.receiveTitle}</p>
                            <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                              Given by <PreviewUser uid={leg.userId} />
                            </p>
                          </div>
                       </div>
                       {leg.cashTopUp && (
                          <div className="mt-1 flex items-center justify-between border-t border-gray-50 pt-2">
                             <span className="text-[10px] font-bold text-gray-500">Pays Top-up</span>
                             <span className="text-xs font-black text-red-500">- KES {leg.cashTopUp}</span>
                          </div>
                       )}
                       {!leg.cashTopUp && cycle.cashTopUp && cycle.topUpSenderId === leg.id && (
                          <div className="mt-1 flex items-center justify-between border-t border-gray-50 pt-2">
                             <span className="text-[10px] font-bold text-gray-500">Pays Top-up</span>
                             <span className="text-xs font-black text-red-500">- KES {cycle.cashTopUp}</span>
                          </div>
                       )}
                    </div>
                  ))}
                </div>
             </div>

             {/* Meeting Details */}
             {(latestRevision.cycle.meetingLocation || latestRevision.cycle.meetingDate || latestRevision.cycle.meetingTime) && (
               <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100">
                  <h4 className="font-extrabold text-purple-900 text-sm mb-4 border-b border-purple-200/50 pb-2">Meeting Arrangements</h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    {latestRevision.cycle.meetingDate && (
                      <div>
                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Date</p>
                        <p className="text-xs font-black text-purple-900">{latestRevision.cycle.meetingDate}</p>
                      </div>
                    )}
                    {latestRevision.cycle.meetingTime && (
                      <div>
                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Time</p>
                        <p className="text-xs font-black text-purple-900">{latestRevision.cycle.meetingTime}</p>
                      </div>
                    )}
                    {latestRevision.cycle.meetingLocation && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Location</p>
                        <p className="text-xs font-bold text-purple-800 bg-white p-3 rounded-xl border border-purple-100">{latestRevision.cycle.meetingLocation}</p>
                      </div>
                    )}
                  </div>
               </div>
             )}

             {/* Signatures / Audit Trail */}
             <div>
                <h4 className="font-extrabold text-gray-900 text-sm mb-4 border-b border-gray-200 pb-2">Digital Signatures</h4>
                <div className="space-y-3">
                   {cycleInfo.participants.map((pid: string) => {
                      const hasAccepted = latestRevision.accepted_users?.includes(pid);
                      return (
                        <div key={pid} className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                             <CheckCircle2 className={`w-4 h-4 ${hasAccepted ? 'text-green-500' : 'text-gray-300'}`} />
                             <span className="text-xs font-bold text-gray-700">
                               <PreviewUser uid={pid} />
                             </span>
                           </div>
                           <span className="text-[10px] text-gray-400 font-mono">
                             {hasAccepted ? 'Signed digitally' : 'Pending'}
                           </span>
                        </div>
                      )
                   })}
                </div>
             </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
