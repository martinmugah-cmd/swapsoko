import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowRight, User as UserIcon, CheckSquare, Square, Loader2 } from "lucide-react";
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
    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* High-End Fluid Mesh Gradient Background */}
      <motion.div 
        animate={{ 
           scale: [1, 1.2, 1],
           rotate: [0, 90, 0],
        }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-20%] w-[70vw] h-[70vw] rounded-full blur-[120px] pointer-events-none opacity-40 mix-blend-screen"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.8) 0%, rgba(0,0,0,0) 70%)' }}
      />
      <motion.div 
        animate={{ 
           scale: [1, 1.5, 1],
           rotate: [0, -90, 0],
        }} 
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full blur-[140px] pointer-events-none opacity-30 mix-blend-screen"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(0,0,0,0) 70%)' }}
      />

      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="w-full max-w-md flex flex-col items-center z-10"
          >
            <motion.div 
              className="w-24 h-24 rounded-3xl overflow-hidden mb-10 shadow-2xl border border-white/10 bg-black/50 backdrop-blur-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
            >
              <img src="/logo.jpg" alt="SwapSoko Logo" className="w-full h-full object-cover mix-blend-lighten" />
            </motion.div>
            
            <motion.h1 
              className="text-h1 text-white text-center mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Swap what you have.<br/>
              <span className="text-green-400">Get what you need.</span>
            </motion.h1>
            
            <motion.p 
              className="text-body text-gray-300 text-center mb-12 px-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Join thousands of students and traders exchanging goods seamlessly, without relying entirely on cash.
            </motion.p>

            <motion.div 
              className="w-full space-y-4 px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={() => setView("signup")}
                className="w-full bg-white text-black font-bold py-4 rounded-full shadow-lg hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Create an account
                <ArrowRight className="w-4 h-4 text-black/70" />
              </button>
              
              <div className="relative py-2 mt-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-black px-4 text-gray-500 font-medium tracking-widest uppercase">or</span>
                </div>
              </div>

              <button
                onClick={handleGoogleAuth}
                className="w-full apple-glass-dark text-white font-bold py-4 rounded-full shadow-sm hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </motion.div>
          </motion.div>
        )}

        {(view === "login" || view === "signup") && (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="w-full max-w-md apple-glass-dark rounded-[40px] p-8 shadow-2xl z-10"
          >
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-6 shadow-lg border border-white/10 bg-black/50 backdrop-blur-md">
                <img src="/logo.jpg" alt="SwapSoko Logo" className="w-full h-full object-cover mix-blend-lighten" />
              </div>
              <h1 className="text-h2 text-white text-center">
                {view === "login" ? "Welcome back" : "Join SwapSoko"}
              </h1>
              <p className="text-body text-gray-400 mt-2 text-center">
                {view === "login"
                  ? "Enter your details to access your account"
                  : "Keep it simple. Sign up below."}
              </p>
            </div>

            {view === "signup" && (
              <div className="mb-6">
                <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setIsStudent(true)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isStudent ? "bg-white/10 shadow text-white" : "text-gray-400"}`}
                  >
                    I am a Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStudent(false)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isStudent ? "bg-white/10 shadow text-white" : "text-gray-400"}`}
                  >
                    Not a Student
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full bg-white/5 text-white font-bold py-3.5 rounded-full shadow-sm hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2 mb-4"
                >
                  {isStudent && <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full mr-1">Recommended</span>}
                  Continue with Google
                </button>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-black/50 backdrop-blur-md px-2 text-gray-400 font-medium tracking-widest uppercase">or email</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {view === "signup" && (
                <div className="flex gap-3">
                  <div className="space-y-1 flex-1">
                    <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider">First Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:border-green-500 focus:ring-1 focus:ring-[#22C55E] outline-none transition-all placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 flex-1">
                    <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider">Last Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:border-green-500 focus:ring-1 focus:ring-[#22C55E] outline-none transition-all placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={view === "signup" && isStudent ? "you@students.jkuat.ac.ke" : "you@example.com"}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border ${emailWarning ? "border-red-400 focus:ring-red-400" : "border-white/10 focus:border-green-500 focus:ring-[#22C55E]"} rounded-2xl text-sm text-white outline-none transition-all focus:ring-1 placeholder:text-gray-500`}
                  />
                </div>
                {emailWarning && (
                  <p className="text-[11px] text-red-400 font-medium ml-2 mt-1">Please use a supported school email.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:border-green-500 focus:ring-1 focus:ring-[#22C55E] outline-none transition-all placeholder:text-gray-500"
                  />
                </div>
              </div>

              {view === "signup" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:border-green-500 focus:ring-1 focus:ring-[#22C55E] outline-none transition-all placeholder:text-gray-500"
                    />
                  </div>
                </div>
              )}
              
              {view === "signup" && (
                <div 
                  className="flex items-start gap-2 mt-4 cursor-pointer px-1"
                  onClick={() => setAgreed(!agreed)}
                >
                  <div className="mt-0.5 text-green-400">
                    {agreed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
                  </div>
                  <span className="text-xs text-gray-400 leading-tight">
                    I agree to the Terms & Privacy Policy
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
                    className="text-xs font-semibold text-green-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full mt-6 bg-white text-black font-bold py-3.5 rounded-full shadow-lg hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-black" />
                ) : (
                  <>
                    {view === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-5 h-5 text-black" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <button
                type="button"
                onClick={() => setView(view === "login" ? "signup" : "login")}
                className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                {view === "login"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Log in"}
              </button>
              
              <div>
                <button
                  type="button"
                  onClick={() => setView("landing")}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Back to start
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
