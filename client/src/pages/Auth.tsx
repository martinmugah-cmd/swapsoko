import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, User as UserIcon, CheckSquare, Square, Loader2 } from "@/lib/icons";
import { toast } from "sonner";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<"landing" | "login" | "signup">("landing");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isStudent, setIsStudent] = useState(true);

  const STUDENT_DOMAINS = ["students.jkuat.ac.ke", "students.uonbi.ac.ke", "students.ku.ac.ke", "strathmore.edu", "usiu.ac.ke", "students.tukenya.ac.ke", "daystar.ac.ke", "cuea.edu", "students.mku.ac.ke", "mmu.ac.ke", "pacuniversity.ac.ke", "riarauniversity.ac.ke", "students.kca.ac.ke", "zetech.ac.ke", "anu.ac.ke"];
  const emailDomain = email.split("@")[1]?.toLowerCase();
  const emailWarning = view === "signup" && isStudent && emailDomain && !STUDENT_DOMAINS.some(d => emailDomain.endsWith(d));

  const handleGoogleAuth = async () => {
    if (view === "signup") {
      localStorage.setItem('auth_intent_type', isStudent ? 'student' : 'non-student');
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/onboarding'
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google authentication failed");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (view === "signup") {
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        toast.error("Please fill in all fields");
        return;
      }
      if (isStudent && emailWarning) {
        toast.error("Please use a supported school email domain to sign up as a student.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (!agreed) {
        toast.error("You must agree to the Terms & Privacy Policy");
        return;
      }
      localStorage.setItem('auth_intent_type', isStudent ? 'student' : 'non-student');
    } else {
      if (!email || !password) {
        toast.error("Please enter email and password");
        return;
      }
    }

    setLoading(true);
    try {
      try { await supabase.auth.signOut(); } catch(e) {}
      localStorage.removeItem('sb-placeholder-project-auth-token'); 

      if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Successfully logged in!");
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: `${firstName} ${lastName}`
            }
          }
        });
        if (error) throw error;
        
        if (!data.session) {
          toast.success("Check your email to verify your account.");
          setView("login");
          return;
        }

        toast.success("Account created!");
        navigate("/onboarding");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-[420px] bg-white/60 backdrop-blur-[40px] saturate-[1.1] border border-white/60 rounded-[32px] p-8 shadow-[0_8px_32px_rgba(15,23,42,0.08)] relative overflow-hidden flex flex-col items-center"
          >
            <motion.div 
              className="mb-8 relative z-10"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src="/logo.png" alt="SwapSoko" className="w-24 h-24 object-contain drop-shadow-xl" />
            </motion.div>
            
            <h1 className="text-[32px] font-black text-slate-900 tracking-tight mb-2 text-center relative z-10">
              Welcome to SwapSoko
            </h1>
            <p className="text-[15px] text-slate-500 mb-10 text-center font-medium relative z-10">
              The secure marketplace for students and trusted swappers.
            </p>

            <div className="w-full flex flex-col gap-3 relative z-10">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("signup")}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-[24px] shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-slate-800 hover:shadow-xl"
              >
                Create Account
              </motion.button>
              
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("login")}
                className="w-full bg-white/60 backdrop-blur-md text-slate-900 border border-white/60 font-bold py-4 rounded-[24px] shadow-sm transition-all flex items-center justify-center gap-2 hover:bg-slate-200"
              >
                Sign In
              </motion.button>
            </div>
            
            <div className="mt-8 text-center text-xs font-semibold text-slate-400 relative z-10">
              By continuing, you agree to our Terms & Privacy Policy
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-[420px] bg-white/60 backdrop-blur-[40px] saturate-[1.1] border border-white/60 rounded-[32px] p-8 shadow-[0_8px_32px_rgba(15,23,42,0.08)] relative overflow-hidden"
          >
            
            <div className="flex justify-center mb-8 relative z-10">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView("landing")}
                className="cursor-pointer"
              >
                <img src="/logo.png" alt="SwapSoko" className="w-16 h-16 object-contain drop-shadow-md" />
              </motion.div>
            </div>
            
            <h1 className="text-[28px] font-black text-slate-900 text-center mb-2 tracking-tight relative z-10">
              {view === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-[14px] text-slate-500 text-center font-medium mb-8 relative z-10">
              {view === "login" ? "Sign in to continue to SwapSoko." : "Join the SwapSoko community today."}
            </p>

            <div className="relative z-10">
              {view === "signup" && (
                <div className="flex bg-white/40 p-1.5 rounded-[24px] mb-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-white/50 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setIsStudent(true)}
                    className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${isStudent ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:bg-white/50'}`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStudent(false)}
                    className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${!isStudent ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:bg-white/50'}`}
                  >
                    Non-Student
                  </button>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleAuth}
                className="w-full bg-white/60 border border-white/60 backdrop-blur-xl text-slate-700 font-bold py-3.5 rounded-[24px] mb-6 shadow-sm flex items-center justify-center gap-3 hover:bg-white transition-colors"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Continue with Google
              </motion.button>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">or email</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {view === "signup" && (
                  <div className="flex gap-3">
                    <div className="space-y-1.5 flex-1">
                      <label className="text-[11px] font-extrabold text-slate-500 ml-1 uppercase tracking-widest">First Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full pl-11 pr-4 py-3.5 bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm rounded-[24px] text-[15px] font-bold text-slate-900 shadow-sm focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 peer"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <label className="text-[11px] font-extrabold text-slate-500 ml-1 uppercase tracking-widest">Last Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full pl-11 pr-4 py-3.5 bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm rounded-[24px] text-[15px] font-bold text-slate-900 shadow-sm focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 peer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 ml-1 uppercase tracking-widest">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={view === "signup" && isStudent ? "you@students.jkuat.ac.ke" : "you@example.com"}
                      className={`w-full pl-11 pr-4 py-3.5 bg-white backdrop-blur-md border ${emailWarning ? "border-red-400 focus:ring-4 focus:ring-red-500/10" : "border-white/60 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"} rounded-[24px] text-[15px] font-bold text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 peer`}
                    />
                  </div>
                  {emailWarning && (
                    <p className="text-[11px] text-red-500 font-bold ml-2 mt-1">Please use a supported school email.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 ml-1 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm rounded-[24px] text-[15px] font-bold text-slate-900 shadow-sm focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 peer"
                    />
                  </div>
                </div>

                {view === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 ml-1 uppercase tracking-widest">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3.5 bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm rounded-[24px] text-[15px] font-bold text-slate-900 shadow-sm focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 peer"
                      />
                    </div>
                  </div>
                )}
                
                {view === "signup" && (
                  <div 
                    className="flex items-start gap-2 mt-4 cursor-pointer px-1 group"
                    onClick={() => setAgreed(!agreed)}
                  >
                    <div className={`mt-0.5 transition-colors ${agreed ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-500'}`}>
                      {agreed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </div>
                    <span className="text-[13px] text-slate-500 font-medium leading-tight">
                      I agree to the <span className="font-bold text-slate-700">Terms of Service</span> and <span className="font-bold text-slate-700">Privacy Policy</span>
                    </span>
                  </div>
                )}

                {view === "login" && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={async () => {
                         if (!email) {
                            toast.error("Please enter your email first");
                            return;
                         }
                         const { error } = await supabase.auth.resetPasswordForEmail(email, {
                           redirectTo: window.location.origin + '/reset-password',
                         });
                         if (error) {
                           toast.error(error.message);
                         } else {
                           toast.success("Password reset email sent! Check your inbox.");
                         }
                      }}
                      className="text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-[20px] shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <>
                      {view === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-5 h-5 text-white" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-8 text-center space-y-4">
                <button
                  type="button"
                  onClick={() => setView(view === "login" ? "signup" : "login")}
                  className="text-[14px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {view === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Log in"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
