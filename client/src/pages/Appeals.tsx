import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, CheckCircle, XCircle, ChevronRight, MessageSquare, AlertTriangle, FileText, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function AppealsPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [selectedAppeal, setSelectedAppeal] = useState<any | null>(null);
  
  const [appealReason, setAppealReason] = useState("");
  const [appealStatement, setAppealStatement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app we'd fetch this from TRPC, but we don't have a myAppeals route yet so we mock it.
  const submitAppeal = trpc.reporting.submitAppeal.useMutation();

  const mockAppeals = [
    {
      id: "APL-X7B9K2",
      case_id: "CASE-992M1",
      target_type: "listing",
      target_title: "iPhone 13 Pro (Used)",
      status: "SUBMITTED",
      reason: "incorrect_flag",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      original_violation: "Suspected Counterfeit",
    },
    {
      id: "APL-Y2M4N8",
      case_id: "CASE-883J9",
      target_type: "community",
      target_title: "UoN Tech Traders",
      status: "UNDER_REVIEW",
      reason: "missing_context",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      original_violation: "Spam / Promotion",
    }
  ];

  const handleAppealSubmit = async () => {
    if (!appealReason || !appealStatement.trim()) {
      toast.error("Please provide a reason and a statement.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Mocking submission to an existing case for the sake of UI demo
      await submitAppeal.mutateAsync({
        caseId: selectedAppeal.case_id,
        reason: appealReason,
        statement: appealStatement,
        evidence: []
      });
      toast.success("Appeal submitted successfully. We will review it shortly.");
      setSelectedAppeal(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit appeal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'SUBMITTED':
      case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'UNDER_REVIEW': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'APPROVED':
      case 'OVERTURNED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
      case 'UPHELD': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'Submitted';
      case 'UNDER_REVIEW': return 'Under Review';
      case 'OVERTURNED': return 'Overturned (Successful)';
      case 'UPHELD': return 'Upheld (Rejected)';
      default: return status;
    }
  };

  if (!isAuthenticated) {
      return (
          <div className="flex flex-col items-center justify-center h-[100dvh] bg-gray-50 p-6">
              <Shield className="w-16 h-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-500 text-center mb-6">Please log in to view and manage your appeals.</p>
              <Button onClick={() => setLocation('/login')} className="w-full max-w-xs">Log In</Button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center shadow-sm z-10 sticky top-0">
        <button onClick={() => setLocation('/profile')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="ml-2 flex-1">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Support & Appeals</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Dashboard Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <Shield className="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-blue-900">Fairness Guarantee</h3>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                Appeals are reviewed by a specialized human Trust & Safety team, not automated systems. We strive to process all appeals within 48 hours.
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!selectedAppeal ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex bg-gray-200/50 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Active Appeals
                  </button>
                  <button 
                    onClick={() => setActiveTab('resolved')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'resolved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Past Decisions
                  </button>
                </div>

                <div className="space-y-3">
                  {mockAppeals.filter(a => activeTab === 'active' ? ['SUBMITTED', 'PENDING', 'UNDER_REVIEW'].includes(a.status) : !['SUBMITTED', 'PENDING', 'UNDER_REVIEW'].includes(a.status)).map(appeal => (
                    <Card 
                      key={appeal.id} 
                      className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => setSelectedAppeal(appeal)}
                    >
                      <CardContent className="p-0">
                        <div className="p-4 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                {appeal.target_type}
                              </span>
                              <span className="text-xs text-gray-400 font-mono">{appeal.id}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              ['SUBMITTED', 'PENDING'].includes(appeal.status) ? 'bg-amber-50 text-amber-700' :
                              appeal.status === 'UNDER_REVIEW' ? 'bg-blue-50 text-blue-700' :
                              ['APPROVED', 'OVERTURNED'].includes(appeal.status) ? 'bg-green-50 text-green-700' :
                              'bg-red-50 text-red-700'
                            }`}>
                              <StatusIcon status={appeal.status} />
                              {getStatusLabel(appeal.status)}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 text-base">{appeal.target_title}</h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">Original Action: {appeal.original_violation}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-50">
                            <span className="text-xs text-gray-400">
                              Updated {new Date(appeal.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex items-center text-blue-600 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                              View Case <ChevronRight className="w-3 h-3 ml-0.5" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {mockAppeals.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No {activeTab} appeals found.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Appeal {selectedAppeal.id}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Filed on {new Date(selectedAppeal.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                      ['SUBMITTED', 'PENDING'].includes(selectedAppeal.status) ? 'bg-amber-50 text-amber-700' :
                      selectedAppeal.status === 'UNDER_REVIEW' ? 'bg-blue-50 text-blue-700' :
                      ['APPROVED', 'OVERTURNED'].includes(selectedAppeal.status) ? 'bg-green-50 text-green-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      <StatusIcon status={selectedAppeal.status} />
                      {getStatusLabel(selectedAppeal.status)}
                    </div>
                  </div>
                  
                  <div className="h-px w-full bg-gray-100" />
                  
                  <div className="grid gap-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Subject</span>
                      <p className="font-medium text-gray-900">{selectedAppeal.target_title} <span className="text-gray-400 font-normal">({selectedAppeal.target_type})</span></p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Original Moderation Action</span>
                      <div className="bg-red-50/50 border border-red-100 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-semibold text-red-900">{selectedAppeal.original_violation}</span>
                        </div>
                        <p className="text-xs text-red-700/80">This action triggered the appeal process.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appeal Submission Form (if status is draft or we want to allow more info) */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-5">
                  <h3 className="text-base font-bold text-gray-900">Provide Additional Context</h3>
                  <p className="text-sm text-gray-500">Help our Trust & Safety team understand why this action was incorrect.</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Reason for Appeal</label>
                      <select 
                        value={appealReason}
                        onChange={(e) => setAppealReason(e.target.value)}
                        className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                      >
                        <option value="" disabled>Select a reason...</option>
                        <option value="incorrect_flag">I did not violate the rules</option>
                        <option value="missing_context">Missing context or misunderstanding</option>
                        <option value="false_positive">Automated system error (False Positive)</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Your Statement</label>
                      <textarea 
                        value={appealStatement}
                        onChange={(e) => setAppealStatement(e.target.value)}
                        placeholder="Please explain in detail why the moderation action should be reversed..."
                        className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
                      />
                      <p className="text-xs text-gray-400 text-right">{appealStatement.length} / 500</p>
                    </div>
                    
                    <Button 
                      onClick={handleAppealSubmit} 
                      disabled={isSubmitting || !appealReason || !appealStatement}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-6 shadow-md"
                    >
                      {isSubmitting ? 'Submitting...' : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Appeal Updates
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 pb-8 flex justify-center">
                  <Button variant="ghost" onClick={() => setSelectedAppeal(null)} className="text-gray-500">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Appeals List
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
