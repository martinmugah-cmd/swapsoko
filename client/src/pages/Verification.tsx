import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, CheckCircle, ShieldCheck, ArrowLeft, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function VerificationPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'show' | 'scan' | 'certificate'>('show');
  const [isScanning, setIsScanning] = useState(false);
  const [verifiedTrade, setVerifiedTrade] = useState<any | null>(null);

  // Mock a unique trade code for the user
  const myCode = `SWAP-${user?.id?.substring(0, 4)?.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setVerifiedTrade({
        id: `TRD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        date: new Date().toLocaleString(),
        item1: "iPhone 13 Pro",
        item2: "Samsung Galaxy S22",
        partner: "Alex",
        status: "VERIFIED"
      });
      setActiveTab('certificate');
      toast.success("Trade verified successfully!");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden relative">
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center shadow-sm z-10 sticky top-0">
        <button onClick={() => setLocation('/chat')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="ml-2 flex-1">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">In-Person Verification</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3">
            <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-green-900">Safe Trade Guarantee</h3>
              <p className="text-xs text-green-700 mt-1 leading-relaxed">
                Scan your partner's code when you meet in person to confirm the exchange. This generates an official Trade Certificate and finalizes the transaction.
              </p>
            </div>
          </div>

          <div className="flex bg-gray-200/50 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('show')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'show' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <QrCode className="w-4 h-4" /> My Code
            </button>
            <button 
              onClick={() => setActiveTab('scan')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'scan' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
                className="bg-white rounded-3xl p-8 card-shadow border border-gray-100 flex flex-col items-center text-center"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-2">Show this to your partner</h2>
                <p className="text-sm text-gray-500 mb-8">They will scan it using their app to verify the trade.</p>
                
                {/* Simulated QR Code */}
                <div className="w-64 h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-4 relative mb-6">
                   <QrCode className="w-32 h-32 text-gray-800" strokeWidth={1} />
                   <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-green-500/10 rounded-3xl"></div>
                   <div className="absolute -inset-1 border border-green-500/20 rounded-[1.75rem]"></div>
                </div>

                <div className="bg-gray-100 px-6 py-3 rounded-2xl flex flex-col items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Manual Code</span>
                  <span className="text-xl font-mono font-bold text-gray-900 tracking-widest">{myCode}</span>
                </div>
              </motion.div>
            )}

            {activeTab === 'scan' && (
              <motion.div 
                key="scan"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 rounded-3xl p-6 card-shadow flex flex-col items-center text-center relative overflow-hidden h-[400px]"
              >
                <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center">
                   {isScanning ? (
                     <div className="flex flex-col items-center">
                       <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
                       <p className="text-white font-medium text-lg">Verifying Trade...</p>
                     </div>
                   ) : (
                     <>
                        <div className="w-56 h-56 border-2 border-green-500 rounded-3xl relative mb-6">
                            {/* Scanning line animation */}
                            <motion.div 
                              animate={{ y: [0, 220, 0] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="w-full h-0.5 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] absolute top-0"
                            />
                            
                            {/* Corner markers */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white rounded-tl-lg -translate-x-1 -translate-y-1"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white rounded-tr-lg translate-x-1 -translate-y-1"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white rounded-bl-lg -translate-x-1 translate-y-1"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white rounded-br-lg translate-x-1 translate-y-1"></div>
                        </div>
                        <Button 
                          onClick={handleSimulateScan}
                          className="bg-white hover:bg-gray-100 text-gray-900 rounded-full px-8 py-6 font-bold shadow-xl"
                        >
                          <Camera className="w-5 h-5 mr-2" /> Simulate Scan
                        </Button>
                     </>
                   )}
                </div>
              </motion.div>
            )}

            {activeTab === 'certificate' && verifiedTrade && (
              <motion.div 
                key="cert"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 card-shadow border border-gray-100"
              >
                <div className="flex flex-col items-center text-center border-b border-dashed border-gray-200 pb-6 mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Trade Verified</h2>
                  <p className="text-gray-500 mt-1">Official SwapSoko Certificate</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500 font-medium">Transaction ID</span>
                    <span className="text-sm font-bold text-gray-900 font-mono">{verifiedTrade.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500 font-medium">Date & Time</span>
                    <span className="text-sm font-bold text-gray-900">{verifiedTrade.date}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500 font-medium">Trading Partner</span>
                    <span className="text-sm font-bold text-blue-600">@{verifiedTrade.partner}</span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-4 mt-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Exchanged Items</span>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 font-medium text-sm text-gray-900 text-center">{verifiedTrade.item1}</div>
                      <div className="px-4 text-gray-300">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M21 3 9 15"/><path d="M8 21H3v-5"/><path d="M3 21l12-12"/></svg>
                      </div>
                      <div className="flex-1 font-medium text-sm text-gray-900 text-center">{verifiedTrade.item2}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl py-6 font-bold text-gray-700">
                    <Download className="w-4 h-4 mr-2" /> Save PDF
                  </Button>
                  <Button onClick={() => setLocation('/chat')} className="flex-1 rounded-xl py-6 font-bold bg-green-500 hover:bg-[#16A34A] text-white">
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
