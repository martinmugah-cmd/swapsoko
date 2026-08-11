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
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className="flex flex-col h-full max-w-md mx-auto w-full">
            <div className="text-center mt-4">
              <h2 className="text-h1 mb-2">Who are you?</h2>
              <p className="text-body">Set up your profile identity.</p>
            </div>
            
            <div className="space-y-6 mt-12 px-2">
              <div className="relative border-b border-border">
                <label className="text-caption text-muted-foreground absolute -top-5 left-0">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-transparent py-4 text-xl font-semibold focus:outline-none transition-all placeholder:text-gray-300" />
              </div>
              
              <div className="relative border-b border-border mt-8">
                <label className="text-caption text-muted-foreground absolute -top-5 left-0">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. johndoe" className="w-full bg-transparent py-4 text-xl font-semibold focus:outline-none transition-all placeholder:text-gray-300" />
              </div>
              
              {accountType === "student" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-8 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><GraduationCap className="w-4 h-4" /></div>
                    <p className="text-sm font-bold text-foreground">Student Verification Active</p>
                  </div>
                  <div className="relative border-b border-border">
                    <label className="text-caption text-muted-foreground absolute -top-5 left-0">Course</label>
                    <input value={course} onChange={e => setCourse(e.target.value)} placeholder="e.g. BSc. Computer Science" className="w-full bg-transparent py-3 text-lg font-medium focus:outline-none placeholder:text-gray-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative border-b border-border">
                      <label className="text-caption text-muted-foreground absolute -top-5 left-0">Year of Study</label>
                      <input value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} placeholder="e.g. Year 3" className="w-full bg-transparent py-3 text-lg font-medium focus:outline-none placeholder:text-gray-300" />
                    </div>
                    <div className="relative border-b border-border">
                      <label className="text-caption text-muted-foreground absolute -top-5 left-0">Graduation</label>
                      <input value={graduationYear} onChange={e => setGraduationYear(e.target.value)} placeholder="e.g. 2026" type="number" className="w-full bg-transparent py-3 text-lg font-medium focus:outline-none placeholder:text-gray-300" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="mt-auto pt-6 pb-6 px-4 fixed bottom-0 left-0 w-full bg-gradient-to-t from-background to-transparent pointer-events-none flex justify-center">
              <div className="w-full max-w-[90%] pointer-events-auto">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleNext} disabled={!fullName || !username} className="w-full bg-foreground text-background font-bold py-4 rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all">Continue</motion.button>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        const unselectedInterests = INTERESTS.filter(i => !selectedInterests.includes(i.id));
        const selectedInterestObjs = INTERESTS.filter(i => selectedInterests.includes(i.id));

        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className="flex flex-col h-full max-w-md mx-auto w-full">
            <div className="text-center mt-4 mb-8">
              <h2 className="text-h1 mb-2">Interests</h2>
              <p className="text-body">Tap to add to your deck. Pick at least one.</p>
            </div>
            
            <div className="flex-1 flex flex-col pb-32 overflow-y-auto hide-scrollbar px-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {unselectedInterests.map(interest => (
                    <motion.button
                      layoutId={`interest-${interest.id}`}
                      key={interest.id}
                      onClick={() => handleToggleInterest(interest.id)}
                      className="bg-muted px-2 py-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-all"
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${interest.color} bg-opacity-40`}> 
                        {interest.icon}
                      </div>
                      <span className="font-semibold text-sm text-foreground">{interest.label}</span>
                    </motion.button>
                  ))}
              </div>

              {/* Stacked Deck at the bottom */}
              <div className="mt-12 h-28 relative flex justify-center items-end bg-muted/50 rounded-3xl border border-dashed border-border p-4">
                {selectedInterestObjs.map((interest, index) => {
                    const isTop = index === selectedInterestObjs.length - 1;
                    return (
                      <motion.div
                        layoutId={`interest-${interest.id}`}
                        key={interest.id}
                        onClick={() => handleToggleInterest(interest.id)}
                        className={`absolute w-28 bg-background rounded-2xl card-shadow p-4 flex flex-col items-center gap-2 cursor-pointer
                          ${isTop ? 'ring-2 ring-green-500' : 'opacity-90'}
                        `}
                        style={{
                          bottom: index * 6,
                          zIndex: index,
                          rotate: index % 2 === 0 ? (index * 2) : -(index * 2),
                        }}
                        whileHover={{ y: -10 }}
                      >
                        <div className={`text-2xl ${interest.color}`}>{interest.icon}</div>
                        <span className="font-extrabold text-xs text-foreground">{interest.label}</span>
                      </motion.div>
                    );
                  })}
                {selectedInterests.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-medium">
                    Empty Deck
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto pt-6 pb-6 px-4 fixed bottom-0 left-0 w-full bg-gradient-to-t from-background to-transparent pointer-events-none flex justify-center z-50">
              <div className="w-full max-w-[90%] pointer-events-auto">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleNext} disabled={selectedInterests.length === 0} className="w-full bg-foreground text-background font-bold py-4 rounded-full shadow-lg disabled:opacity-50 transition-all">Continue</motion.button>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className="flex flex-col h-full max-w-md mx-auto w-full text-center">
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="w-32 h-32 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-blue-500 mb-8 shadow-inner">
                <MapPin className="w-14 h-14" strokeWidth={1.5} />
              </div>
              <h2 className="text-h1 mb-2">Enable Location</h2>
              <p className="text-body max-w-[280px] mx-auto mt-2">
                SwapSoko uses your location to show you relevant listings and reliable swappers near you.
              </p>
            </div>
            
            <div className="mt-auto pt-6 pb-6 px-4 fixed bottom-0 left-0 w-full bg-gradient-to-t from-background to-transparent pointer-events-none flex justify-center">
              <div className="w-full max-w-[90%] pointer-events-auto flex flex-col gap-3">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleLocationAllow} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-full shadow-lg hover:bg-blue-700 transition-all">Allow Location</motion.button>
                <button onClick={() => completeOnboarding("")} className="w-full text-muted-foreground font-bold py-4 rounded-full hover:bg-muted transition-colors">Not right now</button>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      {/* Soft mesh background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Navigation Progress (Page View dots style) */}
      <div className="px-6 pt-12 pb-4 max-w-md mx-auto w-full z-10">
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-foreground" : i < step ? "w-2 bg-foreground/50" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col z-10 relative">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
        
        <div className="absolute top-8 right-6 z-20">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem('sb-placeholder-project-auth-token');
              window.location.href = '/login';
            }}
            className="text-xs text-muted-foreground font-medium hover:text-foreground transition-colors uppercase tracking-widest"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}
