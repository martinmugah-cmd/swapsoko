import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckSquare, Square } from 'lucide-react';
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

export function CycleReviewModal({
  onClose,
  onAccept,
  cycleInfo,
  currentUserId,
}: {
  onClose: () => void;
  onAccept: () => void;
  cycleInfo: any;
  currentUserId: string;
}) {
  const [agreed, setAgreed] = useState(false);
  
  const latestRevision = cycleInfo.revisions ? cycleInfo.revisions[cycleInfo.revisions.length - 1] : cycleInfo;
  const cycle = latestRevision.cycle;
  
  // Find what I'm giving and receiving
  const myIndex = cycle.legs?.findIndex((l: any) => l.userId === currentUserId);
  const myLeg = myIndex !== -1 ? cycle.legs[myIndex] : undefined;
  
  // I receive from the NEXT person in the cycle array
  const receivingLeg = myIndex !== -1 ? cycle.legs[(myIndex + 1) % cycle.legs.length] : undefined;
  
  // I give my item to the PREVIOUS person in the cycle array
  const receiverLeg = myIndex !== -1 ? cycle.legs[(myIndex - 1 + cycle.legs.length) % cycle.legs.length] : undefined;

  const receivingItemName = receivingLeg?.title || receivingLeg?.receiveTitle || 'An Item';
  const receivingItemImage = receivingLeg?.images?.[0] || receivingLeg?.receiveImages?.[0] || 'https://via.placeholder.com/150';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-[480px] rounded-t-[36px] p-6 pb-28 max-h-[90vh] overflow-y-auto shadow-2xl relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-xl tracking-tight">Review Agreement</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Revision #{latestRevision.id || 1}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Giving */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative">
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2 relative z-10">You are Giving</p>
              <div className="flex flex-col gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <img src={myLeg?.images?.[0] || myLeg?.receiveImages?.[0] || 'https://via.placeholder.com/150'} alt="item" className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                     <p className="font-bold text-gray-900 text-sm">{myLeg?.title || myLeg?.receiveTitle || 'Your Item'}</p>
                  </div>
                </div>
                {myLeg?.cashTopUp && (
                  <div className="mt-1 flex items-center justify-between border-t border-gray-200/50 pt-2">
                    <span className="text-xs font-bold text-gray-600">Cash Top-up (You Pay)</span>
                    <span className="text-sm font-black text-red-500">- KES {myLeg.cashTopUp}</span>
                  </div>
                )}
                {!myLeg?.cashTopUp && cycle.cashTopUp && myLeg?.id === cycle.topUpSenderId && (
                  <div className="mt-1 flex items-center justify-between border-t border-gray-200/50 pt-2">
                    <span className="text-xs font-bold text-gray-600">Cash Top-up (You Pay)</span>
                    <span className="text-sm font-black text-red-500">- KES {cycle.cashTopUp}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Receiving */}
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
              <p className="text-xs font-extrabold text-green-600 uppercase tracking-widest mb-2 relative z-10">You are Receiving</p>
              <div className="flex flex-col gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <img src={receivingItemImage} alt="item" className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                     <p className="font-bold text-gray-900 text-sm">{receivingItemName}</p>
                  </div>
                </div>
                {receiverLeg?.cashTopUp && (
                  <div className="mt-1 flex items-center justify-between border-t border-green-200/50 pt-2">
                    <span className="text-xs font-bold text-gray-600">Cash Top-up (You Receive)</span>
                    <span className="text-sm font-black text-green-600">+ KES {receiverLeg.cashTopUp}</span>
                  </div>
                )}
                {!receiverLeg?.cashTopUp && cycle.cashTopUp && receivingLeg?.id === cycle.topUpSenderId && (
                  <div className="mt-1 flex items-center justify-between border-t border-green-200/50 pt-2">
                    <span className="text-xs font-bold text-gray-600">Cash Top-up (You Receive)</span>
                    <span className="text-sm font-black text-green-600">+ KES {cycle.cashTopUp}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Participants Status */}
            <div>
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Participants Status</p>
              <div className="flex flex-col gap-2">
                {cycleInfo.participants.map((pid: string) => {
                  const hasAccepted = latestRevision.accepted_users?.includes(pid);
                  const isMe = pid === currentUserId;
                  return (
                    <div key={pid} className={`flex items-center justify-between border p-3 rounded-2xl ${isMe ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center gap-2">
                         <PreviewUser uid={pid} />
                         {isMe && <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest bg-blue-100 px-1.5 py-0.5 rounded-sm ml-1">You</span>}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${hasAccepted ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
                        {hasAccepted ? 'Accepted' : 'Waiting'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div 
              className="mt-6 flex items-start gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:bg-gray-100"
              onClick={() => setAgreed(!agreed)}
            >
              <div className="mt-0.5">
                {agreed ? (
                  <CheckSquare className="w-5 h-5 text-green-500" />
                ) : (
                  <Square className="w-5 h-5 text-gray-300" />
                )}
              </div>
              <p className="text-xs font-bold text-gray-600 leading-snug">
                I have reviewed this agreement. I understand that once all parties accept, this multi-swap will be locked for scheduling.
              </p>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              disabled={!agreed}
              onClick={() => {
                if (agreed) {
                  onAccept();
                  onClose();
                }
              }}
              className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all shadow-sm ${agreed ? 'bg-black text-white hover:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              Accept Agreement
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
