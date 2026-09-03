import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smartphone, BookOpen, Monitor, Camera, Trophy, Shirt, Sofa, Code, 
  Music, Palette, Plane, ChefHat, Dumbbell, Film, Sparkles, Gamepad2, 
  MapPin, ArrowRight, CheckCircle2, User as UserIcon, Navigation, Mail, 
  GraduationCap, Camera as CameraIcon 
} from "@/lib/icons";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const UNIVERSITIES = [
  { name: "JKUAT", domain: "students.jkuat.ac.ke", campuses: ["Main Campus (Juja)", "Karen", "CBD Campus"] },
  { name: "University of Nairobi (UoN)", domain: "students.uonbi.ac.ke", campuses: ["Main Campus", "Chiromo", "Kikuyu", "Parklands", "Lower Kabete", "Kenya Science"] },
  { name: "Kenyatta University (KU)", domain: "students.ku.ac.ke", campuses: ["Main Campus (Kenyatta)", "Ruiru", "City Campus", "Parklands"] },
  { name: "Strathmore University", domain: "strathmore.edu", campuses: ["Main Campus (Madaraka)"] },
  { name: "USIU-Africa", domain: "usiu.ac.ke", campuses: ["Main Campus (Kasarani)"] },
  { name: "Technical University of Kenya (TUK)", domain: "students.tukenya.ac.ke", campuses: ["Main Campus (CBD)"] },
  { name: "Daystar University", domain: "daystar.ac.ke", campuses: ["Nairobi Campus (Valley Road)", "Athi River"] },
  { name: "Catholic University of Eastern Africa (CUEA)", domain: "cuea.edu", campuses: ["Langata Campus", "Rongai"] },
  { name: "Mount Kenya University (MKU)", domain: "students.mku.ac.ke", campuses: ["Nairobi Campus", "Parklands"] },
  { name: "Multimedia University of Kenya (MMU)", domain: "mmu.ac.ke", campuses: ["Main Campus (Rongai)", "CBD Campus"] },
  { name: "Pan African Christian (PAC) University", domain: "pacuniversity.ac.ke", campuses: ["Main Campus (Roysambu)"] },
  { name: "Riara University", domain: "riarauniversity.ac.ke", campuses: ["Main Campus (Mbagathi Way)"] },
  { name: "KCA University", domain: "students.kca.ac.ke", campuses: ["Main Campus (Ruaraka)", "CBD Campus"] },
  { name: "Zetech University", domain: "zetech.ac.ke", campuses: ["Main Campus (Ruiru)", "Agriculture Campus (Thika Road)", "Pioneer Campus (CBD)"] },
  { name: "Africa Nazarene University", domain: "anu.ac.ke", campuses: ["Main Campus (Ongata Rongai)", "CBD Campus"] },
];

const INTERESTS = [
  { id: "gaming", label: "Gaming", icon: <Gamepad2 className="w-6 h-6" />, color: "text-purple-500", bg: "bg-purple-50" },
  { id: "phones", label: "Phones", icon: <Smartphone className="w-6 h-6" />, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "books", label: "Books", icon: <BookOpen className="w-6 h-6" />, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "electronics", label: "Electronics", icon: <Monitor className="w-6 h-6" />, color: "text-slate-600", bg: "bg-slate-100" },
  { id: "photography", label: "Photography", icon: <Camera className="w-6 h-6" />, color: "text-pink-500", bg: "bg-pink-50" },
  { id: "sports", label: "Sports", icon: <Trophy className="w-6 h-6" />, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "fashion", label: "Fashion", icon: <Shirt className="w-6 h-6" />, color: "text-rose-500", bg: "bg-rose-50" },
  { id: "furniture", label: "Furniture", icon: <Sofa className="w-6 h-6" />, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "programming", label: "Coding", icon: <Code className="w-6 h-6" />, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: "music", label: "Music", icon: <Music className="w-6 h-6" />, color: "text-yellow-600", bg: "bg-yellow-50" },
  { id: "art", label: "Art", icon: <Palette className="w-6 h-6" />, color: "text-red-500", bg: "bg-red-50" },
  { id: "travel", label: "Travel", icon: <Plane className="w-6 h-6" />, color: "text-sky-500", bg: "bg-sky-50" },
];

const FloatingInput = ({ label, value, onChange, placeholder, type = "text" }: any) => (
    <div className="relative group mt-2">
      <input 
        type={type}
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className="w-full bg-white border border-slate-200 px-5 py-4 rounded-[24px] text-[16px] font-bold text-slate-900 shadow-sm focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 peer" 
      />
      <label className="absolute -top-2.5 left-4 px-1.5 bg-white text-[11px] font-extrabold text-slate-500 uppercase tracking-widest peer-focus:text-emerald-500 transition-colors rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        {label}
      </label>
    </div>
  );


async function uploadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function OnboardingPage() {

  const [, navigate] = useLocation();
  const { user, refresh } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { data: myProfile, isSuccess } = trpc.profile.me.useQuery(undefined, { enabled: !!user });
  const utils = trpc.useUtils();

  useEffect(() => {
    const hasProfile = isSuccess && myProfile?.userId;
    if (user?.isOnboarded && hasProfile) {
      navigate("/");
    }
  }, [user, isSuccess, myProfile, navigate]);

  const [accountType, setAccountType] = useState<"student" | "non-student" | null>(null);
  
  const [selectedUniName, setSelectedUniName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    if (user?.email && !emailVerified && !accountType) {
      const intent = localStorage.getItem('auth_intent_type');
      const emailDomain = user.email.split("@")[1]?.toLowerCase();
      const matchedUni = emailDomain ? UNIVERSITIES.find(u => emailDomain.endsWith(u.domain.toLowerCase())) : null;
      
      if (intent === 'student') {
        if (matchedUni) {
          setAccountType("student");
          setSelectedUniName(matchedUni.name);
          setStudentEmail(user.email);
          setEmailVerified(true);
        } else {
          toast.error("Signed in as student with generic email. Proceeding as non-student.");
          setAccountType("non-student");
        }
      } else {
        if (matchedUni) {
          setAccountType("student");
          setSelectedUniName(matchedUni.name);
          setStudentEmail(user.email);
          setEmailVerified(true);
        } else {
          setAccountType("non-student");
        }
      }
      localStorage.removeItem('auth_intent_type');
    }
  }, [user?.email, emailVerified, accountType]);

  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  
  const [fullName, setFullName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.email?.split('@')[0] || "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [locationAllowed, setLocationAllowed] = useState<boolean | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleNext = () => setStep(step + 1);

  const handleToggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleLocationAllow = async () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationAllowed(true);
          completeOnboarding(`${position.coords.latitude},${position.coords.longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Location permission denied. You can enable it later in settings.");
          setLocationAllowed(false);
          completeOnboarding("");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setLocationAllowed(false);
      completeOnboarding("");
    }
  };

  const completeOnboarding = async (locationStr: string) => {
    setLoading(true);
    try {
      const universityData = accountType === "student" ? {
        val: selectedUniName,
        course,
        yearOfStudy,
        graduationYear,
        studentEmail,
        isStudentVerified: emailVerified,
        avatarUrl: avatarUrl || undefined,
        location: locationStr,
        interests: selectedInterests,
        username
      } : { 
        val: "Other / Not a student", 
        isStudentVerified: false, 
        avatarUrl: avatarUrl || undefined,
        location: locationStr,
        interests: selectedInterests,
        username
      };

      const updates = {
        
        user_
        name: fullName,
        university: JSON.stringify(universityData),
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase.from('profiles').upsert(updates);
      if (profileError) throw profileError;
      
      const { error: authError } = await supabase.auth.updateUser({
        data: { is_onboarded: true, name: fullName, username: username, avatar_url: avatarUrl || undefined }
      });
      if (authError) throw authError;

      await refresh();
      toast.success("Profile created successfully!");
      utils.profile.me.invalidate();
      
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "Failed to complete onboarding");
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    })
  };



  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            key="step1"
            custom={1}
            variants={slideVariants as any}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col h-full max-w-md mx-auto w-full pb-32 bg-white border border-slate-100 rounded-[32px] p-6 shadow-[0_8px_32px_rgba(15,23,42,0.08)] mt-4 mb-24 overflow-y-auto hide-scrollbar"
          >
            <div className="text-center mt-2 mb-8">
              <h2 className="text-[32px] font-black text-slate-900 tracking-tight mb-2">Create Profile</h2>
              <p className="text-[15px] font-medium text-slate-500">Let's set up your unique identity.</p>
            </div>
            
            <div className="flex justify-center mb-8">
              <label className="relative">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      toast.loading("Compressing image...");
                      try {
                        const base64 = await uploadFile(file);
                        setAvatarUrl(base64);
                        toast.dismiss();
                      } catch (err) {
                        toast.dismiss();
                        toast.error("Failed to process image");
                      }
                    }
                  }}
                />
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-28 h-28 rounded-[32px] bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer shadow-sm hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all relative overflow-hidden group"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <CameraIcon className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                    </>
                  )}
                </motion.div>
              </label>
            </div>

            <div className="space-y-5 px-1">
              <FloatingInput label="Full Name" value={fullName} onChange={(e:any) => setFullName(e.target.value)} placeholder="e.g. John Doe" />
              <FloatingInput label="Username" value={username} onChange={(e:any) => setUsername(e.target.value)} placeholder="e.g. johndoe" />
              
              <AnimatePresence>
                {accountType === "student" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-blue-50/50 border border-blue-100/50 rounded-3xl p-5 mt-6 space-y-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500"><GraduationCap className="w-5 h-5" /></div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-900 leading-tight">Student Details</p>
                          <p className="text-[12px] font-medium text-slate-500">{selectedUniName}</p>
                        </div>
                      </div>
                      
                      <FloatingInput label="Course" value={course} onChange={(e:any) => setCourse(e.target.value)} placeholder="e.g. BSc. Computer Science" />
                      <div className="flex gap-4">
                        <div className="flex-1"><FloatingInput label="Year" value={yearOfStudy} onChange={(e:any) => setYearOfStudy(e.target.value)} placeholder="e.g. 3" /></div>
                        <div className="flex-1"><FloatingInput label="Graduation" type="number" value={graduationYear} onChange={(e:any) => setGraduationYear(e.target.value)} placeholder="e.g. 2026" /></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-auto pt-6 pb-6 px-4 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pointer-events-none flex justify-center z-50">
              <div className="w-full max-w-[420px] pointer-events-auto px-4">
                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }} 
                  onClick={handleNext} 
                  disabled={!fullName || !username} 
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-[20px] shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_24px_rgba(15,23,42,0.2)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        const unselectedInterests = INTERESTS.filter(i => !selectedInterests.includes(i.id));
        const selectedInterestObjs = INTERESTS.filter(i => selectedInterests.includes(i.id));

        return (
          <motion.div 
            key="step2"
            custom={1}
            variants={slideVariants as any}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col h-full max-w-md mx-auto w-full pb-32 bg-white border border-slate-100 rounded-[32px] p-6 shadow-[0_8px_32px_rgba(15,23,42,0.08)] mt-4 mb-24 overflow-y-auto hide-scrollbar"
          >
            <div className="text-center mt-2 mb-8">
              <h2 className="text-[32px] font-black text-slate-900 tracking-tight mb-2">Your Interests</h2>
              <p className="text-[15px] font-medium text-slate-500">Pick what you love to curate your feed.</p>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto hide-scrollbar px-2 pb-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {unselectedInterests.map(interest => (
                    <motion.button
                      layoutId={`interest-${interest.id}`}
                      key={interest.id}
                      onClick={() => handleToggleInterest(interest.id)}
                      className="bg-white border border-slate-100 shadow-[0_8px_32px_rgba(15,23,42,0.08)] px-2 py-4 rounded-[24px] flex flex-col items-center justify-center gap-2 hover:-translate-y-1 hover:border-emerald-200 transition-all overflow-hidden relative cursor-pointer"
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${interest.bg} ${interest.color}`}> 
                        {interest.icon}
                      </div>
                      <span className="font-semibold text-sm text-slate-900">{interest.label}</span>
                    </motion.button>
                  ))}
              </div>

              {/* Stacked Deck at the bottom */}
              <div className="mt-12 h-28 relative flex justify-center items-end bg-slate-100/50 rounded-3xl border border-dashed border-slate-200 p-4">
                {selectedInterestObjs.map((interest, index) => {
                    const isTop = index === selectedInterestObjs.length - 1;
                    return (
                      <motion.div
                        layoutId={`interest-${interest.id}`}
                        key={interest.id}
                        onClick={() => handleToggleInterest(interest.id)}
                        className={`absolute w-32 bg-white rounded-[24px] shadow-[0_16px_40px_-10px_rgba(15,23,42,0.1)] border border-white p-5 flex flex-col items-center gap-3 cursor-pointer
                          ${isTop ? 'ring-[3px] ring-emerald-400 ring-offset-2 ring-offset-[#F8FAFC]' : ''}
                        `}
                        style={{
                          bottom: index * 8,
                          zIndex: index,
                          rotate: index % 2 === 0 ? (index * 4) : -(index * 3),
                        }}
                        whileHover={{ y: -20, rotate: 0, scale: 1.05, boxShadow: '0 0 40px rgba(255,255,255,1)' }}
                      >
                        <div className={`text-2xl ${interest.color}`}>{interest.icon}</div>
                        <span className="font-extrabold text-xs text-slate-900">{interest.label}</span>
                      </motion.div>
                    );
                  })}
                {selectedInterests.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
                    Empty Deck
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto pt-6 pb-6 px-4 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pointer-events-none flex justify-center z-50">
              <div className="w-full max-w-[420px] pointer-events-auto px-4">
                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }} 
                  onClick={handleNext} 
                  disabled={selectedInterests.length === 0} 
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-[20px] shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_24px_rgba(15,23,42,0.2)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            key="step3"
            custom={1}
            variants={slideVariants as any}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col h-full max-w-md mx-auto w-full pb-32 bg-white border border-slate-100 rounded-[32px] p-6 shadow-[0_8px_32px_rgba(15,23,42,0.08)] mt-4 mb-24 overflow-y-auto hide-scrollbar text-center"
          >
            <div className="flex-1 flex flex-col justify-center items-center mt-10">
              <div className="relative w-40 h-40 flex items-center justify-center mb-10">
                <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-32 h-32 bg-white/60 backdrop-blur-[40px] saturate-[1.1] rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-500 mb-8 shadow-[0_8px_32px_rgba(15,23,42,0.08)] border border-white/60 relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/10 to-transparent mix-blend-overlay"></div><MapPin className="w-14 h-14 relative z-10" strokeWidth={1.5} /></motion.div>
              </div>
              
              <h2 className="text-[32px] font-black text-slate-900 tracking-tight mb-4">Discover Local</h2>
              <p className="text-[15px] font-medium text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                SwapSoko uses your location to show you relevant listings and reliable swappers right in your area.
              </p>
            </div>
            
            <div className="mt-auto pt-6 pb-6 px-4 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pointer-events-none flex justify-center z-50">
              <div className="w-full max-w-[420px] pointer-events-auto px-4 flex flex-col gap-3">
                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }} 
                  onClick={handleLocationAllow} 
                  disabled={loading} 
                  className="w-full bg-emerald-500 text-white font-bold py-4 rounded-[20px] shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_24px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-all"
                >
                  Allow Location
                </motion.button>
                <button 
                  onClick={() => completeOnboarding("")} 
                  className="w-full text-slate-400 font-bold py-4 rounded-[20px] hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Not right now
                </button>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col relative overflow-hidden">
      
      {/* Premium Progress Bar */}
      <div className="px-6 pt-12 pb-2 w-full z-10 relative">
        <div className="w-full max-w-[420px] mx-auto flex items-center justify-between mb-4">
          <div className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest">
            Step {step} <span className="text-slate-300">of 3</span>
          </div>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem('sb-placeholder-project-auth-token');
              window.location.href = '/login';
            }}
            className="text-[12px] font-extrabold text-rose-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
        <div className="w-full max-w-[420px] mx-auto h-2 bg-slate-200/50 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-slate-900 rounded-full"
            initial={{ width: "33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col z-10 relative">
        <AnimatePresence mode="wait" custom={1}>
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}
