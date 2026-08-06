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
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
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
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Report {targetType}</h3>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {submitted ? (
                <div className="py-8 flex flex-col items-center text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </motion.div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Report Submitted</h4>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-[250px] mx-auto">
                      Thank you for keeping SwapSoko safe. Our Trust & Safety team will review this shortly.
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="mt-6 bg-gray-900 text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-gray-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Why are you reporting this?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {(REASONS[targetType] || []).map((r) => (
                        <button
                          key={r}
                          onClick={() => setReason(r)}
                          className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
                            reason === r 
                              ? "bg-red-50 border-red-200 text-red-700 shadow-sm" 
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {r}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${reason === r ? "border-red-500 bg-red-500" : "border-gray-300"}`}>
                            {reason === r && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Additional details (optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please provide any extra context to help our moderators investigate..."
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none h-24"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!reason || createReport.isLoading}
                    className={`w-full py-4 rounded-full font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                      !reason || createReport.isLoading
                        ? "bg-gray-300 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-red-600 to-red-500 hover:shadow-red-500/25 active:scale-[0.98]"
                    }`}
                  >
                    {createReport.isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Report"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
