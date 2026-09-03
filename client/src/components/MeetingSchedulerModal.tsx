import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle } from '@/lib/icons';

export function MeetingSchedulerModal({
  onClose,
  onSuggest,
  cycleInfo
}: {
  onClose: () => void;
  onSuggest: (date: string, time: string, location: string) => void;
  cycleInfo: any;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  const locations = [
    "JKUAT Main Gate",
    "Student Centre",
    "TRM Mall",
    "Custom"
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-6">
             <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
               <Calendar className="w-8 h-8 text-blue-500" />
             </div>
             <h3 className="font-extrabold text-gray-900 text-xl tracking-tight">Schedule Meeting</h3>
             <p className="text-xs font-bold text-gray-500 mt-1">Everyone has accepted the cycle.</p>
          </div>

          <div className="space-y-4">
             {/* Date */}
             <div>
               <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3 h-3" /> Date
               </label>
               <input 
                 type="date" 
                 value={date}
                 onChange={e => setDate(e.target.value)}
                 className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
               />
             </div>

             {/* Time */}
             <div>
               <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3 h-3" /> Time
               </label>
               <input 
                 type="time" 
                 value={time}
                 onChange={e => setTime(e.target.value)}
                 className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
               />
             </div>

             {/* Location */}
             <div>
               <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-3 h-3" /> Location
               </label>
               <div className="grid grid-cols-2 gap-2 mb-2">
                 {locations.slice(0, 3).map(loc => (
                   <button
                     key={loc}
                     onClick={() => setLocation(loc)}
                     className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${location === loc ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                   >
                     {loc}
                   </button>
                 ))}
               </div>
               <input 
                 type="text" 
                 placeholder="Custom Location..."
                 value={!locations.slice(0,3).includes(location) && location !== '' ? location : ''}
                 onChange={e => setLocation(e.target.value)}
                 className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
               />
             </div>
          </div>

          <div className="mt-8 flex gap-3">
             <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl font-extrabold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all">
                Cancel
             </button>
             <button 
                disabled={!date || !time || !location}
                onClick={() => {
                   if (date && time && location) {
                       onSuggest(date, time, location);
                       onClose();
                   }
                }} 
                className={`flex-1 py-3.5 rounded-2xl font-extrabold text-sm transition-all shadow-sm flex justify-center items-center gap-2 ${date && time && location ? 'bg-blue-500 text-white hover:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
             >
                <CheckCircle className="w-4 h-4" /> Suggest
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
