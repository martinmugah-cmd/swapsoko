import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, ArrowLeft, Download, Loader2, RefreshCw, X, FileText, Smartphone } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function VerificationPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  const proposalIdStr = new URLSearchParams(window.location.search).get("proposal");
  const proposalId = proposalIdStr ? parseInt(proposalIdStr, 10) : null;

  const proposalQuery = trpc.proposals.myProposals.useQuery({ userId: user?.id }, { enabled: !!user?.id });
  const proposal = proposalQuery.data?.items?.find((p: any) => p.id === proposalId);
  const updateProposalMutation = trpc.proposals.update.useMutation({
     onSuccess: () => {
         proposalQuery.refetch();
         toast.success("Trade Verified Successfully!");
     }
  });

  const [activeTab, setActiveTab] = useState<'show' | 'scan'>('show');
  const [isScanning, setIsScanning] = useState(false);

  // Secure randomized payload
  const myCodePayload = JSON.stringify({
      type: "SWAPSOKO_VERIFY",
      proposalId: proposalId,
      signer: user?.id,
      nonce: Math.random().toString(36).substring(2, 10)
  });

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    if (activeTab === 'scan' && proposal?.status === 'accepted') {
       scanner = new Html5QrcodeScanner(
         "reader",
         { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
         false
       );
       scanner.render(
         (decodedText) => {
            try {
               const data = JSON.parse(decodedText);
               if (data.type === "SWAPSOKO_VERIFY" && data.proposalId === proposalId) {
                  if (data.signer !== user?.id) {
                     scanner?.clear();
                     updateProposalMutation.mutate({ id: proposalId, status: 'completed' });
                  }
               }
            } catch(e) {
               console.error("Invalid QR code");
            }
         },
         (error) => {}
       );
    }
    
    return () => {
       if (scanner) {
          scanner.clear().catch(e => console.error(e));
       }
    };
  }, [activeTab, proposal]);

  if (proposalQuery.isLoading) {
      return (
         <div className="flex flex-col h-[100dvh] bg-[#F8FAFC] items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
         </div>
      );
  }

  if (!proposal) {
      return (
         <div className="flex flex-col h-[100dvh] bg-[#F8FAFC] items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/80 backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white max-w-md w-full relative z-10 flex flex-col items-center">
               <div className="w-24 h-24 bg-red-500/10 rounded-[32px] flex items-center justify-center mb-6 shadow-inner">
                  <X className="w-10 h-10 text-red-500" />
               </div>
               <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Proposal Not Found</h2>
               <p className="text-slate-500 mb-8 font-medium leading-relaxed">We could not locate the trade proposal for verification. It may have been canceled or removed.</p>
               <Button onClick={() => setLocation("/chat")} className="w-full bg-slate-900 text-white rounded-[24px] py-6 shadow-[0_8px_20px_rgba(15,23,42,0.2)] font-extrabold text-[15px] hover:scale-[1.02] transition-transform">Return to Chat</Button>
            </motion.div>
         </div>
      );
  }

  const isCompleted = proposal.status === 'completed';
  const isAccepted = proposal.status === 'accepted';
  
  return (
    <div className="flex flex-col h-[100dvh] bg-[#F8FAFC] overflow-hidden relative">
      {/* Liquid Glass Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      </div>

      <div className="bg-white/70 backdrop-blur-3xl px-4 py-4 border-b border-white shadow-sm z-10 sticky top-0 flex items-center">
        <button onClick={() => setLocation(`/chat/${proposal.id}`)} className="p-2 -ml-2 rounded-full hover:bg-white/50 text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="ml-2 flex-1">
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Trade Verification</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 relative z-10 flex flex-col items-center">
        
        {!isAccepted && !isCompleted ? (
           <div className="bg-white/80 backdrop-blur-3xl p-8 rounded-[32px] shadow-sm border border-white mt-12 w-full max-w-md text-center">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <RefreshCw className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Trade Not Accepted Yet</h2>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">Both parties must accept the trade proposal in the chat before verification codes are generated.</p>
              <Button onClick={() => setLocation(`/chat/${proposal.id}`)} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-[20px] py-6 font-bold shadow-xl">Return to Proposal</Button>
           </div>
        ) : isCompleted ? (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="bg-white/80 backdrop-blur-3xl rounded-[32px] p-6 shadow-sm border border-white w-full max-w-md mt-6"
           >
             <div className="flex flex-col items-center text-center border-b border-dashed border-slate-200 pb-6 mb-6">
               <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle className="w-10 h-10 text-emerald-500" />
               </div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">Trade Verified</h2>
               <p className="text-slate-500 mt-1 font-bold text-sm">Official SwapSoko Certificate</p>
             </div>
             
             <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center py-2 border-b border-white/50">
                 <span className="text-sm text-slate-500 font-bold">Transaction ID</span>
                 <span className="text-sm font-black text-slate-900 font-mono">TRD-{proposal.id.toString().padStart(6, '0')}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-white/50">
                 <span className="text-sm text-slate-500 font-bold">Date & Time</span>
                 <span className="text-sm font-black text-slate-900">{new Date(proposal.updatedAt || Date.now()).toLocaleDateString()}</span>
               </div>
               
               <div className="bg-white/50 rounded-[24px] p-5 mt-6 border border-white">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 text-center">Exchanged Value</span>
                 <div className="flex items-center justify-between">
                   <div className="flex-1 font-bold text-sm text-slate-900 text-center bg-white p-3 rounded-[16px] shadow-sm">{proposal.listings?.title || "Cash"}</div>
                   <div className="px-3 text-slate-300">
                      <RefreshCw className="w-5 h-5 text-emerald-500" />
                   </div>
                   <div className="flex-1 font-bold text-sm text-slate-900 text-center bg-white p-3 rounded-[16px] shadow-sm">{proposal.offeredListings?.title || `Ksh ${proposal.cashOffered}`}</div>
                 </div>
               </div>
             </div>
             
             <div className="flex gap-3">
               <Button variant="outline" className="flex-1 rounded-[20px] py-6 font-bold text-slate-700 bg-white border-white shadow-sm hover:bg-white">
                 <Download className="w-4 h-4 mr-2" /> Save PDF
               </Button>
               <Button onClick={() => setLocation('/chat')} className="flex-1 rounded-[20px] py-6 font-bold bg-emerald-500 hover:bg-emerald-600 shadow-[0_8px_20px_rgba(16,185,129,0.25)] text-white border-none">
                 Done
               </Button>
             </div>
           </motion.div>
        ) : (
          <div className="w-full max-w-md mt-6">
            <div className="bg-white/80 backdrop-blur-3xl p-2 rounded-[24px] flex mb-6 shadow-sm border border-white">
              <button 
                onClick={() => setActiveTab('show')}
                className={`flex-1 py-3 text-sm font-bold rounded-[16px] transition-all flex items-center justify-center gap-2 ${activeTab === 'show' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Smartphone className="w-4 h-4" /> Show Code
              </button>
              <button 
                onClick={() => setActiveTab('scan')}
                className={`flex-1 py-3 text-sm font-bold rounded-[16px] transition-all flex items-center justify-center gap-2 ${activeTab === 'scan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Camera className="w-4 h-4" /> Scan Code
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'show' && (
                <motion.div 
                  key="show"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/80 backdrop-blur-3xl rounded-[32px] p-8 shadow-sm border border-white flex flex-col items-center text-center"
                >
                  <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Your Verification Code</h2>
                  <p className="text-sm text-slate-500 font-medium mb-8">Show this to your partner so they can scan it with their device.</p>
                  
                  <div className="bg-white p-4 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 mb-6">
                     <QRCode value={myCodePayload} size={200} className="w-full h-full object-contain" />
                  </div>

                  <div className="bg-emerald-500/10 px-6 py-4 rounded-[20px] flex flex-col items-center border border-emerald-500/20 w-full">
                    <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Proposal ID</span>
                    <span className="text-lg font-mono font-black text-emerald-700 tracking-widest">TRD-{proposal.id.toString().padStart(6, '0')}</span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'scan' && (
                <motion.div 
                  key="scan"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/80 backdrop-blur-3xl rounded-[32px] p-4 shadow-sm border border-white flex flex-col items-center text-center relative overflow-hidden"
                >
                   <h2 className="text-xl font-black text-slate-900 mb-2 mt-4 tracking-tight">Scan Partner's Code</h2>
                   <p className="text-sm text-slate-500 font-medium mb-6">Position your partner's QR code inside the frame to verify.</p>
                   
                   <div className="w-full rounded-[24px] overflow-hidden shadow-inner border-[4px] border-slate-100 relative">
                       {updateProposalMutation.isPending ? (
                          <div className="w-full h-[300px] bg-slate-900 flex flex-col items-center justify-center">
                              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                              <p className="text-white font-bold tracking-tight">Verifying Trade...</p>
                          </div>
                       ) : (
                          <div id="reader" className="w-full h-full bg-slate-900"></div>
                       )}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
