import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { ArrowRight, CheckCircle2, ShieldCheck, MapPin, Shuffle, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MultiSwap() {
  const { data: chains, isLoading } = trpc.multiSwap.discover.useQuery({ userId: 'user_martin' });
  const [selectedChain, setSelectedChain] = useState<any>(null);

  if (isLoading) {
      return (
          <div className="min-h-screen pt-24 px-4 bg-gray-50 flex flex-col items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Shuffle className="w-8 h-8 text-emerald-500" />
              </motion.div>
              <p className="mt-4 text-gray-500 font-medium">Discovering swap cycles...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen pb-24 bg-gray-50 pt-20">
      <div className="px-4 mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shuffle className="w-6 h-6 text-emerald-500" />
            Multi-Swaps
        </h1>
        <p className="text-sm text-gray-500 mt-1">We found chains where everyone gets what they want.</p>
      </div>

      <div className="px-4 space-y-4">
        {chains?.map((chain: any, idx: number) => (
            <motion.div 
               key={chain.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               onClick={() => setSelectedChain(chain)}
               className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Chain #{idx + 1}</div>
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                {chain.chainScore}% Match
                            </span>
                            <span className="bg-gray-50 text-gray-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> High Trust
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">{chain.chainLength}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Participants</div>
                    </div>
                </div>

                {/* Visual Chain Preview */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                   {chain.participants.map((p: any, i: number) => (
                       <React.Fragment key={i}>
                           <div className="flex flex-col items-center">
                               <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 text-xs font-bold text-slate-700">
                                   {p.userId.split('_')[1]?.[0]?.toUpperCase() || 'U'}
                               </div>
                           </div>
                           {i < chain.participants.length - 1 && (
                               <ArrowRight className="w-4 h-4 text-gray-300" />
                           )}
                       </React.Fragment>
                   ))}
                   <ArrowRight className="w-4 h-4 text-gray-300" />
                   <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm text-xs font-bold text-white">
                            You
                        </div>
                   </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> ~{chain.logisticsKm} km logistics</span>
                    <span className="text-emerald-500 font-bold">Review Chain &rarr;</span>
                </div>
            </motion.div>
        ))}

        {(!chains || chains.length === 0) && (
            <div className="text-center py-12">
                <p className="text-gray-400 font-medium">No multi-swap cycles found right now.</p>
            </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
          {selectedChain && (
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center p-4"
              >
                  <motion.div 
                     initial={{ y: "100%" }}
                     animate={{ y: 0 }}
                     exit={{ y: "100%" }}
                     className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative"
                  >
                      <button onClick={() => setSelectedChain(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500">
                          <X className="w-5 h-5" />
                      </button>

                      <h3 className="text-xl font-black text-slate-900 mb-6">Multi-Swap Proposal</h3>
                      
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                          {selectedChain.edges.map((edge: any, i: number) => (
                              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                      <span className="text-xs font-bold">{i+1}</span>
                                  </div>
                                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                      <div className="flex justify-between items-start mb-1">
                                         <span className="text-xs font-bold text-slate-800 uppercase">{edge.fromUser.replace('user_', '')}</span>
                                         <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{edge.matchScore}% Match</span>
                                      </div>
                                      <div className="text-sm text-slate-600">Gives item <span className="font-mono text-xs bg-gray-50 px-1 rounded">{edge.fromItem.substring(0,6)}</span></div>
                                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500"/> Verified Trader</div>
                                  </div>
                              </div>
                          ))}
                      </div>

                      <div className="mt-8 flex gap-3">
                          <button className="flex-1 bg-emerald-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform flex justify-center items-center gap-2">
                              Propose Swap
                          </button>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

    </div>
  );
}
