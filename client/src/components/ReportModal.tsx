import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'listing' | 'user' | 'message' | 'community' | 'review' | 'voice_note' | 'profile_photo';
  targetId: string;
};

const REASONS = {
  listing: ["Fake item", "Counterfeit product", "Misleading photos", "Incorrect description", "Spam listing", "Scam attempt", "Offensive content", "Other"],
  user: ["Scammer", "Harassment", "Impersonation", "Fake account", "Offensive profile", "Threatening behavior", "Spam", "Other"],
  message: ["Harassment", "Hate speech", "Threats", "Spam", "Scam attempt", "Suspicious payment methods", "Other"],
  community: ["Hate speech", "Illegal activity", "Spam", "Fraud", "Adult content", "Offensive content", "Other"],
  review: ["False review", "Offensive language", "Spam", "Personal information", "Retaliatory review", "Other"],
  voice_note: ["Threats", "Harassment", "Spam", "Scam", "Offensive content", "Other"],
  profile_photo: ["Inappropriate image", "Fake identity", "Copyright violation", "Offensive content", "Other"]
};

export function ReportModal({ isOpen, onClose, targetType, targetId }: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  const createReport = trpc.reports.create.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = () => {
    if (!reason || !user) return;
    
    createReport.mutate({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      description,
      status: "submitted",
      priority: ["Scammer", "Threats", "Scam attempt", "Hate speech", "Fraud"].includes(reason) ? "high" : "medium"
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="bg-[#F2F2F7] w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Grabber for Mobile */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="text-[22px] font-bold text-gray-900 tracking-tight">Report</h3>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-200/50 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 pt-2 overflow-y-auto hide-scrollbar">
              {submitted ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </motion.div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Report Submitted</h4>
                    <p className="text-gray-500 mt-2 text-[15px] leading-relaxed max-w-[280px] mx-auto">
                      Thank you for keeping SwapSoko safe. Our Trust & Safety team will review this shortly.
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="mt-8 bg-black text-white font-bold py-3.5 px-10 rounded-full shadow-lg hover:bg-gray-800 transition-all active:scale-95"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-4">Why are you reporting this?</label>
                    <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-200/60">
                      {(REASONS[targetType] || []).map((r, i, arr) => (
                        <button
                          key={r}
                          onClick={() => setReason(r)}
                          className={`flex items-center justify-between w-full px-5 py-3.5 text-left transition-colors active:bg-gray-50 ${
                            i !== arr.length - 1 ? 'border-b border-gray-100' : ''
                          }`}
                        >
                          <span className={`text-[16px] font-medium ${reason === r ? 'text-red-600' : 'text-gray-900'}`}>{r}</span>
                          <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${reason === r ? "border-red-500 bg-red-500" : "border-gray-300"}`}>
                            {reason === r && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-4">Additional Details</label>
                    <div className="bg-white rounded-[20px] shadow-sm border border-gray-200/60 overflow-hidden p-1">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide extra context (optional)..."
                        className="w-full bg-transparent px-4 py-3 text-[16px] text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none h-24"
                      />
                    </div>
                  </div>

                  <div className="pt-2 pb-6">
                    <button
                      onClick={handleSubmit}
                      disabled={!reason || createReport.isLoading}
                      className={`w-full py-4 rounded-full font-bold text-[17px] text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                        !reason || createReport.isLoading
                          ? "bg-gray-300 cursor-not-allowed shadow-none text-gray-500"
                          : "bg-red-500 hover:bg-red-600 hover:shadow-red-500/25 active:scale-95"
                      }`}
                    >
                      {createReport.isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Report"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
