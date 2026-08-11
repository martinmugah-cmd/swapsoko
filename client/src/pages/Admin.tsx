import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, Users, Box, Flag, Building2, BarChart2,
  ScrollText, UserCog, User, CheckCircle, XCircle, Search, ChevronRight, Activity, ArrowUpRight, AlertTriangle, X, Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, user, loading } = useAuth();
  
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: !!user });
  const [isChecking, setIsChecking] = useState(true);

  const isSuperAdmin = profileQuery.data?.role === "super_admin";
  const isModerator = profileQuery.data?.role === "moderator";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
      return;
    }
    if (profileQuery.isSuccess) {
      if (profileQuery.data?.role !== "admin" && profileQuery.data?.role !== "super_admin" && profileQuery.data?.role !== "moderator") {
        toast.error("403 Forbidden: You do not have administrator access.");
        navigate("/");
      } else {
        setIsChecking(false);
      }
    }
  }, [loading, isAuthenticated, profileQuery.isSuccess, profileQuery.data]);

  const [activeTab, setActiveTab] = useState(isModerator ? "reports" : "analytics");

  // If a moderator logs in and defaults to analytics but reloads, ensure they are kicked to reports
  useEffect(() => {
     if (isModerator && activeTab !== "reports") setActiveTab("reports");
  }, [isModerator]);

  if (isChecking || loading) {
    return (
      <div className="min-h-screen bg-muted p-6 space-y-6">
        <div className="h-16 bg-white/50 animate-pulse rounded-3xl w-full max-w-4xl mx-auto" />
        <div className="h-12 bg-white/50 animate-pulse rounded-2xl w-full max-w-4xl mx-auto" />
        <div className="h-[400px] bg-white/50 animate-pulse rounded-3xl w-full max-w-4xl mx-auto" />
      </div>
    );
  }

  let tabs = [
    { id: "analytics", icon: BarChart2, label: "Analytics" },
    { id: "users", icon: Users, label: "Platform Users" },
    { id: "reports", icon: Flag, label: "Moderation Queue" },
    { id: "logs", icon: ScrollText, label: "Audit Logs" },
  ];

  if (isModerator) {
     tabs = [
        { id: "reports", icon: Flag, label: "Moderation Queue" }
     ];
  }

  return (
    <div className="min-h-screen bg-muted pb-32 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6 pt-12 pb-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-sm overflow-hidden">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-h1">{isModerator ? 'Moderator Console' : 'Admin Console'}</h1>
              <p className="text-caption mt-1">{isModerator ? 'MODERATOR WORKSPACE' : (isSuperAdmin ? 'SUPER ADMIN WORKSPACE' : 'ADMIN WORKSPACE')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex overflow-x-auto no-scrollbar pb-4 mb-6 border-b border-border">
            <TabsList className="bg-transparent h-10 p-0 gap-2 border-none">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-2 rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground border border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all h-full"
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <TabsContent value="analytics" className="mt-0 outline-none"><AdminAnalytics /></TabsContent>
              <TabsContent value="users" className="mt-0 outline-none"><AdminUsersList isSuperAdmin={isSuperAdmin} /></TabsContent>
              <TabsContent value="reports" className="mt-0 outline-none"><AdminReportsList /></TabsContent>
              <TabsContent value="logs" className="mt-0 outline-none"><AdminAuditLogs /></TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Analytics Component ──────────────────────────────────────────────────────
function AdminAnalytics() {
  const usersQuery = trpc.admin.users.useQuery();
  const reportsQuery = trpc.admin.reports.useQuery();
  const logsQuery = trpc.admin.auditLogs.useQuery();

  const totalUsers = usersQuery.data?.length || 0;
  const activeReports = reportsQuery.data?.filter((r: any) => r.status !== 'resolved' && r.status !== 'dismissed').length || 0;
  const totalLogs = logsQuery.data?.length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Users" value={totalUsers.toLocaleString()} icon={Users} color="text-blue-500" bg="bg-blue-500/10" isLoading={usersQuery.isLoading} />
        <MetricCard title="Active Reports" value={activeReports.toLocaleString()} icon={AlertTriangle} color="text-red-500" bg="bg-red-500/10" isLoading={reportsQuery.isLoading} />
        <MetricCard title="System Events" value={totalLogs.toLocaleString()} icon={Activity} color="text-green-500" bg="bg-green-500/10" isLoading={logsQuery.isLoading} />
      </div>

      <Card className="h-64 flex flex-col items-center justify-center text-center">
        <CardContent className="pt-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 mx-auto">
            <BarChart2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Advanced Analytics</CardTitle>
          <CardDescription className="mt-2 max-w-sm">Detailed metrics and charts will appear here as the platform gathers more data over time.</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg, isLoading }: any) {
  if (isLoading) return <Card className="h-32 animate-pulse bg-muted" />;
  return (
    <Card className="overflow-hidden relative group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-caption">{title}</p>
            <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-muted/50 to-muted rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-500" />
      </CardContent>
    </Card>
  );
}

// ─── Reports Queue Component ──────────────────────────────────────────────────
function AdminReportsList() {
   const [selectedReport, setSelectedReport] = useState<any>(null);
   const [modAction, setModAction] = useState<string>("warn");
   const [internalNotes, setInternalNotes] = useState("");
   const [previewTarget, setPreviewTarget] = useState<string | null>(null);
   
   const utils = trpc.useUtils();
   const reportsQuery = trpc.admin.reports.useQuery();
   const executeModerationMutation = trpc.admin.executeModerationAction.useMutation({
       onSuccess: () => {
           toast.success("Moderation action applied successfully");
           utils.admin.reports.invalidate();
           utils.admin.auditLogs.invalidate();
           setSelectedReport(null);
           setModAction("");
           setInternalNotes("");
       }
   });

   const activeReports = (reportsQuery.data || []).filter((r: any) => r.status !== 'resolved' && r.status !== 'dismissed');

   if (reportsQuery.isLoading) {
     return (
       <div className="space-y-4">
         {[1,2,3].map(i => <div key={i} className="h-40 bg-white/60 animate-pulse rounded-3xl w-full border border-white" />)}
       </div>
     );
   }

   if (activeReports.length === 0) {
     return (
        <div className="bg-white rounded-[40px] p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">Queue is empty</h3>
            <p className="text-gray-500 mt-2">All reports have been reviewed. Great job keeping the community safe!</p>
        </div>
     );
   }

   return (
       <div className="space-y-6">
           {activeReports.map((r: any) => {
               let actualTargetId = r.targetId ? String(r.targetId).replace(/['"]/g, '') : '';
               if (typeof actualTargetId === 'string' && actualTargetId.startsWith('00000000-0000-0000-0000-00000000')) {
                   actualTargetId = parseInt(actualTargetId.replace(/-/g, '')).toString();
               }

               let targetLink = '#';
               if (r.targetType === 'user') targetLink = `/profile/${actualTargetId}`;
               else if (r.targetType === 'community') targetLink = `/communities/${actualTargetId}`;
               else if (r.targetType === 'message' || r.targetType === 'chat') targetLink = `/chat/${r.targetInfo?.roomId || actualTargetId}`;
               else if (r.targetType === 'listing') targetLink = `/#`;

               let displayDesc = r.targetInfo?.email || r.targetInfo?.description || r.targetInfo?.content;
               let parsedDesc: any = null;
               
               if (typeof displayDesc === 'string') {
                   let trimmed = displayDesc.trim();
                   if (trimmed.startsWith('{') || trimmed.startsWith('"')) {
                       try {
                           if (trimmed.startsWith('"')) trimmed = JSON.parse(trimmed);
                           parsedDesc = typeof trimmed === 'string' ? JSON.parse(trimmed) : trimmed;
                       } catch(e) {
                           const textMatch = trimmed.match(/['"]?text['"]?\s*:\s*['"]([^'"]+)['"]/);
                           const descMatch = trimmed.match(/['"]?description['"]?\s*:\s*['"]([^'"]+)['"]/);
                           if (textMatch) parsedDesc = { text: textMatch[1] };
                           else if (descMatch) parsedDesc = { description: descMatch[1] };
                       }
                   }
               } else if (typeof displayDesc === 'object' && displayDesc !== null) {
                   parsedDesc = displayDesc;
               }

               if (parsedDesc && typeof parsedDesc === 'object') {
                   if (parsedDesc.proposalId) {
                       displayDesc = `Started a swap proposal for ${parsedDesc.listingTitle || 'a listing'}`;
                   } else if (parsedDesc.action === 'accept') {
                       displayDesc = `Accepted the swap proposal`;
                   } else if (parsedDesc.action === 'reject' || parsedDesc.action === 'decline') {
                       displayDesc = `Rejected the swap proposal`;
                   } else if (parsedDesc.text || parsedDesc.description || parsedDesc.name) {
                       displayDesc = parsedDesc.text || parsedDesc.description || parsedDesc.name;
                   } else {
                       displayDesc = "System Action / Proposal Update";
                   }
               } else if (typeof displayDesc !== 'string') {
                   displayDesc = "No additional context";
               }

               return (
               <div key={r.id} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all flex flex-col gap-6 relative overflow-hidden group">
                   
                   {r.priority === 'high' && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-[32px]" />}
                   
                   {/* Header Row */}
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${
                             r.priority === 'high' ? 'bg-red-50 text-red-600' :
                             r.priority === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                         }`}>{r.priority} Priority</span>
                         <span className="text-[12px] font-bold text-gray-400">Reported by {r.reporterName || 'Unknown'}</span>
                       </div>
                       <span className="text-xs font-semibold text-gray-400">{formatDistanceToNow(new Date(r.createdAt || r.created_at || Date.now()), { addSuffix: true })}</span>
                   </div>
                   
                   {/* Main Content */}
                   <div className="flex flex-col md:flex-row gap-6">
                       {/* Report Details */}
                       <div className="flex-1 space-y-3">
                           <div className="flex items-center gap-2">
                             <h4 className="font-extrabold text-slate-900 text-xl">{r.reason}</h4>
                             <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{r.targetType}</span>
                           </div>
                           {r.description ? (
                             <p className="text-gray-600 text-sm bg-gray-50 p-5 rounded-2xl border border-gray-100 leading-relaxed shadow-inner">
                                {r.description}
                             </p>
                           ) : (
                             <p className="text-gray-400 text-sm italic">No additional description provided by the reporter.</p>
                           )}
                       </div>

                       {/* Target Context */}
                       <div className="w-full md:w-1/3 bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 flex flex-col justify-between">
                           <div>
                               <h5 className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-3">Reported Entity</h5>
                               {r.targetInfo ? (
                                   <div className="space-y-1">
                                       <p className="font-bold text-slate-900 truncate">
                                          {(() => {
                                              if (r.targetType === 'message' || r.targetType === 'chat') return 'Chat Conversation';
                                              let n = r.targetInfo.name || r.targetInfo.title;
                                              if (!n && r.targetType === 'user' && r.targetInfo.university) {
                                                  try {
                                                      const parsed = JSON.parse(r.targetInfo.university);
                                                      n = parsed.name || parsed.username;
                                                  } catch(e) {}
                                              }
                                              return n || 'Unknown Entity';
                                          })()}
                                       </p>
                                       {displayDesc && (
                                           <p className="text-xs text-gray-500 line-clamp-2">
                                              {displayDesc}
                                           </p>
                                       )}
                                   </div>
                               ) : (
                                   <p className="text-xs text-gray-400 italic">No context available. ID: {actualTargetId || r.targetId}</p>
                               )}
                           </div>
                           <button 
                               onClick={() => setPreviewTarget(`${targetLink}?preview=true`)}
                               className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                           >
                               View Context <ChevronRight className="w-3 h-3" />
                           </button>
                       </div>
                   </div>

                   {/* Action Buttons */}
                   <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                       <button 
                           onClick={() => setSelectedReport(r)}
                           className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
                       >
                           Take Action <ChevronRight className="w-4 h-4" />
                       </button>
                   </div>
               </div>
               );
           })}
           
           {/* Moderation Decision Modal */}
           <AnimatePresence>
               {selectedReport && (
                   <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                       <motion.div
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
                       >
                           <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
                               <h3 className="text-xl font-extrabold text-gray-900">Moderator Decision</h3>
                               <button onClick={() => setSelectedReport(null)} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-200">
                                   <X className="w-5 h-5" />
                               </button>
                           </div>
                           <div className="p-6 overflow-y-auto space-y-6">
                               {/* Report Info Summary */}
                               <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                                   <p><span className="font-bold">Target Type:</span> <span className="uppercase">{selectedReport.targetType}</span></p>
                                   <p><span className="font-bold">Reason:</span> {selectedReport.reason}</p>
                               </div>

                               <div>
                                   <label className="block text-sm font-bold text-gray-900 mb-3">Actions</label>
                                   <div className="space-y-2">
                                       {['dismiss', 'warning'].map(action => (
                                           <label key={action} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${modAction === action ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                               <input type="radio" name="modAction" value={action} checked={modAction === action} onChange={(e) => setModAction(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                               <span className="font-bold text-gray-900 capitalize">{action.replace('_', ' ')}</span>
                                           </label>
                                       ))}
                                       {selectedReport.targetType === 'listing' && ['hide_listing', 'remove_listing'].map(action => (
                                           <label key={action} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${modAction === action ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                               <input type="radio" name="modAction" value={action} checked={modAction === action} onChange={(e) => setModAction(e.target.value)} className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300" />
                                               <span className="font-bold text-gray-900 capitalize">{action.replace('_', ' ')}</span>
                                           </label>
                                       ))}
                                       {selectedReport.targetType === 'user' && ['suspend_user', 'ban_user'].map(action => (
                                           <label key={action} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${modAction === action ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                               <input type="radio" name="modAction" value={action} checked={modAction === action} onChange={(e) => setModAction(e.target.value)} className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300" />
                                               <span className="font-bold text-gray-900 capitalize">{action.replace('_', ' ')}</span>
                                           </label>
                                       ))}
                                       {selectedReport.targetType === 'community' && ['remove_community', 'lock_community'].map(action => (
                                           <label key={action} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${modAction === action ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                               <input type="radio" name="modAction" value={action} checked={modAction === action} onChange={(e) => setModAction(e.target.value)} className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300" />
                                               <span className="font-bold text-gray-900 capitalize">{action.replace('_', ' ')}</span>
                                           </label>
                                       ))}
                                   </div>
                               </div>

                               <div>
                                   <label className="block text-sm font-bold text-gray-900 mb-2">Internal Notes</label>
                                   <textarea 
                                       value={internalNotes} 
                                       onChange={(e) => setInternalNotes(e.target.value)}
                                       placeholder="Add private notes regarding this decision..."
                                       className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                   />
                               </div>
                           </div>
                           <div className="p-6 border-t border-gray-100">
                               <button 
                                   onClick={() => {
                                       if (!modAction) return toast.error('Select an action');
                                       executeModerationMutation.mutate({ 
                                           reportId: selectedReport.id, 
                                           action: modAction, 
                                           notes: internalNotes 
                                       });
                                   }}
                                   disabled={executeModerationMutation.isPending}
                                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full shadow-lg transition-colors flex items-center justify-center gap-2"
                               >
                                   {executeModerationMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Submit Decision</>}
                               </button>
                           </div>
                       </motion.div>
                   </div>
               )}
           </AnimatePresence>

           {/* Preview Panel Modal */}
           <AnimatePresence>
               {previewTarget && (
                   <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
                       <motion.div
                           initial={{ opacity: 0, scale: 0.95, y: 10 }}
                           animate={{ opacity: 1, scale: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95, y: 10 }}
                           className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
                       >
                           {/* Modal Header */}
                           <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white z-10">
                               <div>
                                   <h3 className="font-extrabold text-slate-900 text-xl">Context Preview</h3>
                                   <p className="text-sm text-gray-500 mt-0.5">Read-only view of the reported resource.</p>
                               </div>
                               <button 
                                   onClick={() => setPreviewTarget(null)}
                                   className="p-2.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                               >
                                   <X className="w-5 h-5" />
                               </button>
                           </div>
                           
                           {/* Iframe Content */}
                           <div className="flex-1 w-full bg-gray-50/50 relative">
                               <iframe 
                                   src={previewTarget} 
                                   className="absolute inset-0 w-full h-full border-0"
                                   title="Context Preview"
                               />
                           </div>
                       </motion.div>
                   </div>
               )}
           </AnimatePresence>
       </div>
   );
}

// ─── Audit Logs Component ────────────────────────────────────────────────────
function AdminAuditLogs() {
    const logsQuery = trpc.admin.auditLogs.useQuery();
    const logs = logsQuery.data || [];

    if (logsQuery.isLoading) {
      return (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/60 animate-pulse rounded-2xl w-full border border-white" />)}
        </div>
      );
    }

    if (logs.length === 0) {
      return (
        <div className="bg-white rounded-[40px] p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <ScrollText className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">No Logs Yet</h3>
            <p className="text-gray-500 mt-2">Administrative actions will be recorded here.</p>
        </div>
      );
    }

    return (
        <div className="bg-white rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white overflow-hidden p-2">
            {logs.map((log: any, i: number) => (
                <div key={log.id} className={`p-5 flex items-start gap-4 hover:bg-gray-50/80 transition-colors rounded-3xl ${i !== logs.length - 1 ? 'border-b border-gray-50/50' : ''}`}>
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0 mt-1">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="font-extrabold text-slate-900">{log.action}</h4>
                            <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{formatDistanceToNow(new Date(log.created_at || Date.now()), { addSuffix: true })}</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mb-2">Actor: <span className="font-bold text-gray-700">{log.actorName || log.profiles?.name || log.actorId || log.actor_id}</span></p>
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-xs font-mono text-gray-600">
                            Resource: {log.resourceType || log.resource_type} • {log.resourceName ? log.resourceName : log.resourceId || log.resource_id}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Users List Component ───────────────────────────────────────────────────
function AdminUsersList({ isSuperAdmin }: { isSuperAdmin: boolean }) {
   const utils = trpc.useUtils();
   const usersQuery = trpc.admin.users.useQuery();
   const users = usersQuery.data || [];

   const updateRoleMutation = trpc.admin.updateRole.useMutation({
      onSuccess: () => {
         toast.success("Role updated successfully");
         setEditingUser(null);
         utils.admin.users.invalidate();
      },
      onError: (err: any) => {
         toast.error(err.message || "Failed to update role");
         console.error(err);
      }
   });

   const [editingUser, setEditingUser] = useState<any>(null);
   const [searchQuery, setSearchQuery] = useState("");

   if (usersQuery.isLoading) {
     return (
       <div className="space-y-4">
         <div className="h-16 bg-white/60 animate-pulse rounded-2xl w-full" />
         {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/60 animate-pulse rounded-3xl w-full border border-white" />)}
       </div>
     );
   }

   const filteredUsers = users.filter((u: any) => 
     (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
     (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
   );

   return (
      <div className="space-y-6">
         <div className="relative mb-6">
           <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
           <Input 
             type="text"
             placeholder="Search by name or email..."
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
             className="pl-12 h-14 bg-background border-border shadow-sm rounded-2xl"
           />
         </div>

         <Card className="overflow-hidden">
            {filteredUsers.length === 0 ? (
               <div className="p-12 text-center text-gray-500 font-medium">No users found matching "{searchQuery}"</div>
            ) : (
              filteredUsers.map((u: any, i: number) => {
                 const uData = (() => { try { return JSON.parse(u.university || "{}"); } catch(e) { return {}; } })();
                 const email = uData.email || u.email || "No email";
                 const avatarUrl = uData.avatarUrl || u.avatar_url;
                 const displayName = uData.username || u.name || u.userId || u.user_id;
                 const userRole = uData.role || u.role || "user";
                 const userId = u.userId || u.user_id || u.id;
                 
                 return (
                 <div key={userId} className={`p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors rounded-3xl ${i !== filteredUsers.length - 1 ? "border-b border-gray-50/50" : ""}`}>
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden relative">
                          {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-gray-400" />}
                          {userRole === "super_admin" && <div className="absolute inset-0 border-2 border-yellow-400 rounded-2xl" />}
                       </div>
                       <div>
                          <p className="font-extrabold text-[15px] text-slate-900">{displayName}</p>
                          <p className="text-sm text-gray-500 font-medium mt-0.5">{email}</p>
                       </div>
                    </div>
                    
                    {editingUser === userId ? (
                       <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                          <select 
                             className="text-sm border-none bg-white rounded-xl px-3 py-2 font-bold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#22C55E]/50"
                             defaultValue={userRole}
                             onChange={(e) => {
                               updateRoleMutation.mutate({ userId: userId, role: e.target.value });
                             }}
                          >
                             <option value="user">User</option>
                             <option value="moderator">Moderator</option>
                             <option value="admin" disabled={!isSuperAdmin}>Admin</option>
                             <option value="super_admin" disabled={!isSuperAdmin}>Super Admin</option>
                          </select>
                          <button onClick={() => setEditingUser(null)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-xl shadow-sm">
                            <XCircle className="w-5 h-5" />
                          </button>
                       </div>
                    ) : (
                       <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                             userRole === 'super_admin' ? 'bg-purple-50 text-purple-600' :
                             userRole === 'admin' ? 'bg-blue-600/10 text-blue-600' :
                             userRole === 'moderator' ? 'bg-orange-50 text-orange-600' :
                             'bg-gray-100 text-gray-500'
                          }`}>
                             {userRole.replace("_", " ")}
                          </span>
                          {(isSuperAdmin || (userRole === "user")) && userRole !== "super_admin" && (
                             <button onClick={() => setEditingUser(userId)} className="w-10 h-10 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-gray-200 text-gray-500 flex items-center justify-center transition-all shadow-sm">
                                <UserCog className="w-4 h-4" />
                             </button>
                          )}
                       </div>
                    )}

                 </div>
                 );
              })
            )}
          </Card>
      </div>
   );
}
