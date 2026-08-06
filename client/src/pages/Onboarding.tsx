import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, BookOpen, Monitor, Camera, Trophy, Shirt, Sofa, Code, Music, Palette, Plane, ChefHat, Dumbbell, Film, Sparkles, Gamepad2, MapPin, ArrowRight, CheckCircle2, User as UserIcon, Navigation, Mail, GraduationCap } from "lucide-react";
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
  { id: "gaming", label: "Gaming", icon: <Gamepad2 className="w-6 h-6" />, color: "bg-purple-100 text-purple-600" },
  { id: "phones", label: "Phones", icon: <Smartphone className="w-6 h-6" />, color: "bg-blue-100 text-blue-600" },
  { id: "books", label: "Books", icon: <BookOpen className="w-6 h-6" />, color: "bg-orange-100 text-orange-600" },
  { id: "electronics", label: "Electronics", icon: <Monitor className="w-6 h-6" />, color: "bg-gray-100 text-gray-600" },
  { id: "photography", label: "Photography", icon: <Camera className="w-6 h-6" />, color: "bg-pink-100 text-pink-600" },
  { id: "sports", label: "Sports", icon: <Trophy className="w-6 h-6" />, color: "bg-green-100 text-green-600" },
  { id: "fashion", label: "Fashion", icon: <Shirt className="w-6 h-6" />, color: "bg-rose-100 text-rose-600" },
  { id: "furniture", label: "Furniture", icon: <Sofa className="w-6 h-6" />, color: "bg-amber-100 text-amber-600" },
  { id: "programming", label: "Programming", icon: <Code className="w-6 h-6" />, color: "bg-indigo-100 text-indigo-600" },
  { id: "music", label: "Music", icon: <Music className="w-6 h-6" />, color: "bg-yellow-100 text-yellow-600" },
  { id: "art", label: "Art", icon: <Palette className="w-6 h-6" />, color: "bg-red-100 text-red-600" },
  { id: "travel", label: "Travel", icon: <Plane className="w-6 h-6" />, color: "bg-sky-100 text-sky-600" },
  { id: "cooking", label: "Cooking", icon: <ChefHat className="w-6 h-6" />, color: "bg-orange-50 text-orange-700" },
  { id: "fitness", label: "Fitness", icon: <Dumbbell className="w-6 h-6" />, color: "bg-teal-100 text-teal-600" },
  { id: "movies", label: "Movies", icon: <Film className="w-6 h-6" />, color: "bg-violet-100 text-violet-600" },
  { id: "other", label: "Other", icon: <Sparkles className="w-6 h-6" />, color: "bg-gray-100 text-gray-700" },
];

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { user, refresh } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { data: myProfile, isSuccess } = trpc.profile.me.useQuery(undefined, { enabled: !!user });
  const utils = trpc.useUtils();

  useEffect(() => {
    // Only skip onboarding if user is onboarded AND they actually have a profile row
    const hasProfile = isSuccess && myProfile?.userId;
    if (user?.isOnboarded && hasProfile) {
      navigate("/");
    }
  }, [user, isSuccess, myProfile, navigate]);

  // Form State
  const [accountType, setAccountType] = useState<"student" | "non-student" | null>(null);
  
  // Student fields
  const [selectedUniName, setSelectedUniName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

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
          toast.error("You signed in as a student but used a generic email. You will proceed as a non-student.");
          setAccountType("non-student");
        }
        localStorage.removeItem('auth_intent_type');
      } else if (intent === 'non-student') {
        setAccountType("non-student");
        localStorage.removeItem('auth_intent_type');
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
    }
  }, [user?.email, emailVerified, accountType]);

  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  
  // General fields
  const [avatarUrl, setAvatarUrl] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.email?.split('@')[0] || "user");
  const [locationAllowed, setLocationAllowed] = useState<boolean | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const selectedUni = UNIVERSITIES.find(u => u.name === selectedUniName);

  const handleNext = () => setStep(step + 1);

  
  
  
  const handleToggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(prev => prev.filter(i => i !== id));
    } else {
      setSelectedInterests(prev => [...prev, id]);
    }
  };

  const handleLocationAllow = async () => {
    if ("geolocation" in navigator) {
      toast.loading("Detecting location...", { id: 'loc' });
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            // Reverse geocode using Nominatim
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            const address = data.address || {};
            
            const readableLoc = {
              lat,
              lng: lon,
              country: address.country || "",
              county: address.county || address.state || "",
              town: address.city || address.town || address.village || address.suburb || "Unknown",
            };
            
            setLocationAllowed(true);
            toast.success("Location found!", { id: 'loc' });
            completeOnboarding(JSON.stringify(readableLoc));
          } catch(e) {
            setLocationAllowed(true);
            toast.success("Location found (GPS only)", { id: 'loc' });
            completeOnboarding(JSON.stringify({ lat: position.coords.latitude, lng: position.coords.longitude }));
          }
        },
        () => {
          toast.error("Location permission denied.", { id: 'loc' });
          setLocationAllowed(false);
          completeOnboarding("");
        }
      );
    } else {
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
        isStudentVerified: emailVerified
      } : { val: "Other / Not a student", isStudentVerified: false };

      const { error: upsertError } = await supabase.from("profiles").upsert({
        user_id: user?.id,
        name: fullName || "SwapSoko User",
        campus: locationStr,
        university: JSON.stringify({ 
          ...universityData, 
          username,
          avatarUrl,
          interests: selectedInterests,
          isStudentVerified: emailVerified
        })
      }, { onConflict: "user_id" });

      if (upsertError) throw upsertError;

      await supabase.auth.updateUser({
        data: { isOnboarded: true, name: fullName, username, isStudentVerified: emailVerified, studentEmail: emailVerified ? studentEmail : null, studentOtp: null, interests: selectedInterests }
      });

      await refresh();
      toast.success("Welcome to SwapSoko!");
      
      // Use hard redirect to guarantee fresh App state and avoid React Query cache race conditions
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e.message || "Failed to complete onboarding");
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 flex flex-col h-full max-w-lg mx-auto w-full">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Let's get to know you</h2>
              <p className="text-gray-500 mt-2 font-medium">Set up your profile to start swapping.</p>
            </div>
            
            <div className="space-y-5 bg-white p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 pl-1">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-gray-50/50 rounded-2xl px-5 py-4 border border-gray-100 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 pl-1">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. johndoe" className="w-full bg-gray-50/50 rounded-2xl px-5 py-4 border border-gray-100 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400" />
              </div>
              
              {accountType === "student" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 mt-6 border-t border-gray-100/80 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><GraduationCap className="w-4 h-4" /></div>
                    <p className="text-sm font-bold text-gray-900">Student Info</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 pl-1">Course</label>
                    <input value={course} onChange={e => setCourse(e.target.value)} placeholder="e.g. BSc. Computer Science" className="w-full bg-gray-50/50 rounded-2xl px-5 py-4 border border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700 pl-1">Year of Study</label>
                      <input value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} placeholder="e.g. Year 3" className="w-full bg-gray-50/50 rounded-2xl px-5 py-4 border border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700 pl-1">Graduation</label>
                      <input value={graduationYear} onChange={e => setGraduationYear(e.target.value)} placeholder="e.g. 2026" type="number" className="w-full bg-gray-50/50 rounded-2xl px-5 py-4 border border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="mt-auto pt-6 pb-8">
              <button onClick={handleNext} disabled={!fullName || !username} className="w-full gradient-green text-white font-bold py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-lg hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]">Continue</button>
            </div>
          </motion.div>
        );

      case 2:
        const unselectedInterests = INTERESTS.filter(i => !selectedInterests.includes(i.id));
        const selectedInterestObjs = INTERESTS.filter(i => selectedInterests.includes(i.id));

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 flex flex-col h-full max-w-lg mx-auto w-full">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Interests</h2>
              <p className="text-gray-500 mt-2 font-medium">Tap to add to your deck. Pick at least one.</p>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {unselectedInterests.map(interest => (
                    <motion.button
                      layoutId={`interest-${interest.id}`}
                      key={interest.id}
                      onClick={() => handleToggleInterest(interest.id)}
                      className="bg-white px-2 py-4 rounded-[24px] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all"
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl ${interest.color} bg-opacity-40`}> 
                        {interest.icon}
                      </div>
                      <span className="font-bold text-sm text-gray-700">{interest.label}</span>
                    </motion.button>
                  ))}
              </div>

              {/* Stacked Deck at the bottom */}
              <div className="mt-8 h-28 relative flex justify-center items-end bg-gray-100/50 rounded-[32px] border border-dashed border-gray-200">
                {selectedInterestObjs.map((interest, index) => {
                    const isTop = index === selectedInterestObjs.length - 1;
                    return (
                      <motion.div
                        layoutId={`interest-${interest.id}`}
                        key={interest.id}
                        onClick={() => handleToggleInterest(interest.id)}
                        className={`absolute w-28 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 flex flex-col items-center gap-2 cursor-pointer
                          ${isTop ? 'border-2 border-green-500 ring-4 ring-green-500/20' : 'opacity-90'}
                        `}
                        style={{
                          bottom: index * 4,
                          zIndex: index,
                          rotate: index % 2 === 0 ? (index * 2) : -(index * 2),
                        }}
                        whileHover={{ y: -10 }}
                      >
                        <div className={`text-2xl ${interest.color}`}>{interest.icon}</div>
                        <span className="font-extrabold text-xs text-gray-800">{interest.label}</span>
                      </motion.div>
                    );
                  })}
                {selectedInterests.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium">
                    Empty Deck
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto pt-6 pb-8">
              <button onClick={handleNext} disabled={selectedInterests.length === 0} className="w-full gradient-green text-white font-bold py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]">Continue</button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 flex flex-col h-full max-w-lg mx-auto w-full text-center">
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-[32px] flex items-center justify-center mx-auto text-blue-500 mb-8 shadow-inner rotate-3">
                <MapPin className="w-14 h-14 -rotate-3" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Enable Location</h2>
              <p className="text-gray-500 text-[15px] px-6 mt-4 font-medium leading-relaxed max-w-sm mx-auto">
                SwapSoko uses your location to show you relevant listings and reliable swappers near your campus or current area.
              </p>
            </div>
            <div className="mt-auto pt-8 pb-8 flex flex-col gap-3">
              <button onClick={handleLocationAllow} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-[0_8px_30px_rgba(37,99,235,0.24)] hover:bg-blue-700 hover:shadow-lg transition-all active:scale-[0.98]">Allow Location</button>
              <button onClick={() => completeOnboarding("")} className="w-full bg-white text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-colors">Not right now</button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Progress */}
      <div className="px-6 pt-12 pb-8 max-w-lg mx-auto w-full">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                i < step ? "bg-green-500" : i === step ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
        
        <div className="mt-4 text-center">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem('sb-placeholder-project-auth-token');
              window.location.href = '/login';
            }}
            className="text-xs text-gray-400 font-medium hover:text-gray-600 transition-colors"
          >
            Wrong account? Start over
          </button>
        </div>
      </div>
    </div>
  );
}
