import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useAppStore } from "@/store";
import { 
  ChevronLeft, Camera, CheckCircle, Shield, AlertCircle, 
  MapPin, Settings, LogOut, Trash2, Mail, Phone, Lock, Eye, EyeOff, GraduationCap,
  Smartphone, BookOpen, Monitor, Trophy, Shirt, Sofa, Code, Music, Palette, Plane, ChefHat, Dumbbell, Film, Sparkles, Gamepad2
} from "lucide-react";

const UNIVERSITIES = [
  { name: "JKUAT", campuses: ["Main Campus (Juja)", "Karen", "CBD Campus"] },
  { name: "University of Nairobi (UoN)", campuses: ["Main Campus", "Chiromo", "Kikuyu", "Parklands", "Lower Kabete", "Kenya Science"] },
  { name: "Kenyatta University (KU)", campuses: ["Main Campus (Kenyatta)", "Ruiru", "City Campus", "Parklands"] },
  { name: "Strathmore University", campuses: ["Main Campus (Madaraka)"] },
  { name: "USIU-Africa", campuses: ["Main Campus (Kasarani)"] },
  { name: "Technical University of Kenya (TUK)", campuses: ["Main Campus (CBD)"] },
  { name: "Daystar University", campuses: ["Nairobi Campus (Valley Road)", "Athi River"] },
  { name: "Catholic University of Eastern Africa (CUEA)", campuses: ["Langata Campus", "Rongai"] },
  { name: "Mount Kenya University (MKU)", campuses: ["Nairobi Campus", "Parklands"] },
  { name: "Multimedia University of Kenya (MMU)", campuses: ["Main Campus (Rongai)", "CBD Campus"] },
  { name: "Pan African Christian (PAC) University", campuses: ["Main Campus (Roysambu)"] },
  { name: "Riara University", campuses: ["Main Campus (Mbagathi Way)"] },
  { name: "KCA University", campuses: ["Main Campus (Ruaraka)", "CBD Campus"] },
  { name: "Zetech University", campuses: ["Main Campus (Ruiru)", "Agriculture Campus (Thika Road)", "Pioneer Campus (CBD)"] },
  { name: "Africa Nazarene University", campuses: ["Main Campus (Ongata Rongai)", "CBD Campus"] },
  { name: "Other / Not a student", campuses: ["N/A"] }
];

const ALL_INTERESTS = [
  { id: "gaming", label: "Gaming", icon: <Gamepad2 className="w-4 h-4" />, color: "bg-purple-100 text-purple-700" },
  { id: "phones", label: "Phones", icon: <Smartphone className="w-4 h-4" />, color: "bg-blue-100 text-blue-700" },
  { id: "books", label: "Books", icon: <BookOpen className="w-4 h-4" />, color: "bg-orange-100 text-orange-700" },
  { id: "electronics", label: "Electronics", icon: <Monitor className="w-4 h-4" />, color: "bg-gray-200 text-gray-700" },
  { id: "photography", label: "Photography", icon: <Camera className="w-4 h-4" />, color: "bg-pink-100 text-pink-700" },
  { id: "sports", label: "Sports", icon: <Trophy className="w-4 h-4" />, color: "bg-green-100 text-green-700" },
  { id: "fashion", label: "Fashion", icon: <Shirt className="w-4 h-4" />, color: "bg-rose-100 text-rose-700" },
  { id: "furniture", label: "Furniture", icon: <Sofa className="w-4 h-4" />, color: "bg-amber-100 text-amber-700" },
  { id: "programming", label: "Programming", icon: <Code className="w-4 h-4" />, color: "bg-indigo-100 text-indigo-700" },
  { id: "music", label: "Music", icon: <Music className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-700" },
  { id: "art", label: "Art", icon: <Palette className="w-4 h-4" />, color: "bg-red-100 text-red-700" },
  { id: "travel", label: "Travel", icon: <Plane className="w-4 h-4" />, color: "bg-sky-100 text-sky-700" },
  { id: "cooking", label: "Cooking", icon: <ChefHat className="w-4 h-4" />, color: "bg-orange-100 text-orange-700" },
  { id: "fitness", label: "Fitness", icon: <Dumbbell className="w-4 h-4" />, color: "bg-teal-100 text-teal-700" },
  { id: "movies", label: "Movies", icon: <Film className="w-4 h-4" />, color: "bg-violet-100 text-violet-700" },
  { id: "other", label: "Other", icon: <Sparkles className="w-4 h-4" />, color: "bg-gray-200 text-gray-700" },
];

// Helper for file upload
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
        
        // Use JPEG for better compression, quality 0.7
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => reject(new Error("Failed to load image for resizing"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function EditProfilePage() {
  const { user } = useAuth();
  const profileQuery = trpc.profile.get.useQuery({ id: user?.id as string }, { enabled: !!user?.id });

  const isReady = profileQuery.isSuccess && (profileQuery.data !== undefined);

  if (!user || !isReady) {
    return (
      <div className="min-h-[100dvh] bg-[#F8FAFC]">
        <div className="h-48 bg-gray-200 animate-pulse w-full"></div>
        <div className="max-w-[800px] mx-auto px-4 -mt-12 relative z-10">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-6 animate-pulse">
            <div className="flex flex-col items-center gap-4">
              <div className="w-[100px] h-[100px] rounded-[32px] bg-gray-200 border-[4px] border-[#F8FAFC]"></div>
              <div className="w-32 h-6 bg-gray-200 rounded-full"></div>
              <div className="w-24 h-4 bg-gray-200 rounded-full"></div>
            </div>
            <div className="mt-8 space-y-4">
               <div className="w-full h-[50px] bg-gray-100 rounded-xl"></div>
               <div className="w-full h-[50px] bg-gray-100 rounded-xl"></div>
               <div className="w-full h-[50px] bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profileData = profileQuery.data as any;
  const profile = profileData?.items?.[0] || (Array.isArray(profileData) ? profileData[0] : profileData);

  return <EditProfileForm user={user} profile={profile} />;
}

function EditProfileForm({ user, profile }: { user: any, profile: any }) {
  const [, navigate] = useLocation();
  const { refresh, logout } = useAuth();
  const utils = trpc.useUtils();

  const [loading, setLoading] = useState(false);
  
  const safeParse = (data: any) => {
    if (!data) return {};
    if (typeof data === 'object') return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'string') return JSON.parse(parsed);
        return parsed;
      } catch(e) { return {}; }
    }
    return {};
  };

  const prof = profile || {};
  const existingUniData = safeParse(prof.university);
  
  const nameParts = (user.metadata?.name || prof.name || "").split(" ");
  
  const initAvatarUrl = user.avatarUrl || prof.avatarUrl || existingUniData.avatarUrl || "";
  const initFirstName = nameParts[0] || "";
  const initLastName = nameParts.slice(1).join(" ") || "";
  const initUsername = existingUniData.username || user.metadata?.username || nameParts.join("").toLowerCase() || "";
  const initBio = existingUniData.bio || "";
  const initUniversity = existingUniData.val || "";
  const initCampus = prof.campus || "";
  const initLocationName = user.metadata?.locationName || "Juja";
  const initRadius = useAppStore.getState().nearbyRadiusKm || user.metadata?.radius || 15;
  const rawInterests = user.metadata?.interests || existingUniData.interests;
  const initInterests = Array.isArray(rawInterests) ? rawInterests : [];
  const initCourse = existingUniData.course || "";
  const initYearOfStudy = existingUniData.yearOfStudy || "";
  const initGraduationYear = existingUniData.graduationYear || "";
  const initStudentEmail = existingUniData.studentEmail || "";
  const initPrefs = existingUniData.prefs || { notifications: true, nearby: true, communities: true, proposals: true };
  const initPrivacy = existingUniData.privacy || { visibility: "SwapSoko Users", showDistance: true, showLastActive: true };

  // Initial States derived directly from guaranteed data
  const [avatarUrl, setAvatarUrl] = useState(initAvatarUrl);
  const [firstName, setFirstName] = useState(initFirstName);
  const [lastName, setLastName] = useState(initLastName);
  const [username, setUsername] = useState(initUsername);
  const [bio, setBio] = useState(initBio);
  const [university, setUniversity] = useState(initUniversity);
  const [campus, setCampus] = useState(initCampus);
  const [locationName, setLocationName] = useState(initLocationName);
  const [radius, setRadius] = useState(initRadius);
  const [interests, setInterests] = useState<Set<string>>(new Set(initInterests));
  const [course, setCourse] = useState(initCourse);
  const [yearOfStudy, setYearOfStudy] = useState(initYearOfStudy);
  const [graduationYear, setGraduationYear] = useState(initGraduationYear);
  const [studentEmail, setStudentEmail] = useState(initStudentEmail);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  const [prefs, setPrefs] = useState(initPrefs);
  const [privacy, setPrivacy] = useState(initPrivacy);

  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const hasChanges = 
    avatarUrl !== initAvatarUrl ||
    firstName !== initFirstName ||
    lastName !== initLastName ||
    username !== initUsername ||
    bio !== initBio ||
    university !== initUniversity ||
    campus !== initCampus ||
    course !== initCourse ||
    yearOfStudy !== initYearOfStudy ||
    graduationYear !== initGraduationYear ||
    studentEmail !== initStudentEmail ||
    locationName !== initLocationName ||
    radius !== initRadius ||
    JSON.stringify(Array.from(interests).sort()) !== JSON.stringify(Array.from(new Set(initInterests)).sort()) ||
    JSON.stringify(prefs) !== JSON.stringify(initPrefs) ||
    JSON.stringify(privacy) !== JSON.stringify(initPrivacy);

  const handleSave = async () => {
    if (!hasChanges) return;
    
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      toast.error("Username must be 3-20 characters, containing only letters, numbers, and underscores (no spaces).");
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      
      const metadata = {
        name: fullName,
        username,
        interests: Array.from(interests),
        locationName,
        radius,
        ...(avatarUrl && !avatarUrl.startsWith('data:image') && { avatar_url: avatarUrl })
      };
      
      const { error } = await supabase.auth.updateUser({ data: metadata });
      if (error) throw error;

      const safeParse = (data: any) => {
        if (!data) return {};
        if (typeof data === 'object') return data;
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            if (typeof parsed === 'string') return JSON.parse(parsed);
            return parsed;
          } catch(e) { return {}; }
        }
        return {};
      };

      let existingUniData = safeParse(profile?.university);

      const uniDataObj = {
        ...existingUniData,
        val: university,
        avatarUrl: avatarUrl || undefined,
        bio,
        course,
        yearOfStudy,
        graduationYear,
        studentEmail,
        prefs,
        privacy,
        username,
        interests: Array.from(interests)
      };
      
      // If student email changed, reset verification
      if (studentEmail && studentEmail !== initStudentEmail) {
        uniDataObj.isStudentVerified = false;
        toast.info("Student email changed. Re-verification will be required.");
      }
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: user?.id,
        name: fullName || user?.metadata?.name || user?.email?.split('@')[0] || "User",
        campus,
        university: JSON.stringify(uniDataObj)
      }, { onConflict: "user_id" });
      if (profileError) throw profileError;

      useAppStore.setState({ nearbyRadiusKm: radius });
      try {
        const parsedLoc = JSON.parse(locationName);
        if (parsedLoc.lat && parsedLoc.lng) {
          useAppStore.setState(s => ({ filters: { ...s.filters, coords: { lat: parsedLoc.lat, lng: parsedLoc.lng } } }));
        }
      } catch(e) {}

      await refresh();
      await utils.profile.get.invalidate();
      toast.success("Changes Saved Successfully");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = () => {
    if ("geolocation" in navigator) {
      toast.loading("Detecting location...", { id: "loc" });
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
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
            setLocationName(JSON.stringify(readableLoc));
            toast.success("Location updated!", { id: "loc" });
          } catch(e) {
            setLocationName(JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
            toast.success("Location updated (GPS only)!", { id: "loc" });
          }
        },
        () => {
          toast.error("Location permission denied", { id: "loc" });
        }
      );
    }
  };

  const toggleInterest = (i: string) => {
    const next = new Set(interests);
    if (next.has(i)) next.delete(i); else next.add(i);
    setInterests(next);
  };

  const handleChangePassword = async () => {
    if (!newPassword) return;
    toast.loading("Updating password...", { id: "pw" });
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!", { id: "pw" });
      setShowPasswordModal(false);
      setNewPassword("");
    } catch(e: any) {
      toast.error(e.message || "Failed to update password", { id: "pw" });
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) return;
    toast.loading("Sending verification...", { id: "em" });
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("Verification links sent to both emails!", { id: "em" });
      setShowEmailModal(false);
      setNewEmail("");
    } catch(e: any) {
      toast.error(e.message || "Failed to change email", { id: "em" });
    }
  };

  const sendStudentOtp = async () => {
    if (!studentEmail) return toast.error("Please enter a student email first");
    setLoading(true);
    try {
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      await supabase.auth.updateUser({ data: { studentOtp: pin } });
      
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { email: studentEmail.trim(), code: pin }
      });
      if (error) throw error;
      toast.success("Verification code sent!");
      setOtpSent(true);
    } catch(e: any) {
      toast.error(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyStudentOtp = async () => {
    setVerifyingOtp(true);
    try {
      const session = await supabase.auth.getSession();
      const expectedOtp = session.data.session?.user?.user_metadata?.studentOtp;
      if (otpCode === expectedOtp && otpCode.length === 6) {
         let uniDataObj = safeParse(profile?.university);
         uniDataObj.isStudentVerified = true;
         
         await supabase.auth.updateUser({ data: { studentOtp: null, isStudentVerified: true } });
         await supabase.from("profiles").update({ university: JSON.stringify(uniDataObj) }).eq("user_id", user?.id);
         
         toast.success("Student email verified!");
         setOtpSent(false);
         setOtpCode("");
         await refresh();
      } else {
         toast.error("Invalid verification code");
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("Are you sure you want to delete your account? This action is permanent and will delete all your data, listings, chats, and communities.");
    if (!confirm) return;
    toast.loading("Deleting account and all data...", { id: "del" });
    try {
       // Delete all associated records to ensure clean wipe and no foreign key constraint errors
       const uid = user.id;
       await Promise.all([
         supabase.from('listings').delete().eq('user_id', uid),
         supabase.from('wishes').delete().eq('user_id', uid),
         supabase.from('profiles').delete().eq('user_id', uid),
         supabase.from('proposals').delete().or(`sender_id.eq.${uid},receiver_id.eq.${uid}`),
         supabase.from('chat_rooms').delete().or(`user1_id.eq.${uid},user2_id.eq.${uid}`),
         supabase.from('messages').delete().eq('sender_id', uid),
         supabase.from('community_members').delete().eq('user_id', uid),
         supabase.from('community_posts').delete().eq('user_id', uid),
         supabase.from('community_post_replies').delete().eq('user_id', uid),
         supabase.from('communities').delete().eq('creator_id', uid),
         supabase.from('notifications').delete().eq('user_id', uid),
         supabase.from('saved_items').delete().eq('user_id', uid)
       ]);
       
       // Hard delete from auth.users using admin api (since client has service role key via env)
       const { error } = await supabase.auth.admin.deleteUser(uid);
       if (error) throw error;
       
       toast.success("Account permanently deleted.", { id: "del" });
       setTimeout(() => logout(), 1000);
    } catch(e: any) {
       toast.error(e.message || "Failed to delete account", { id: "del" });
    }
  };



  let isStudentVerified = false;
  try {
    isStudentVerified = user?.metadata?.isStudentVerified || profile?.isStudentVerified || JSON.parse(profile?.university || "{}").isStudentVerified;
  } catch(e) {}
  
  const isOther = university === "Other / Not a student";
  const numFields = isOther ? 2 : 4;
  const numCompleted = (avatarUrl ? 1 : 0) + (bio ? 1 : 0) + (isOther ? 0 : (isStudentVerified ? 1 : 0) + (campus ? 1 : 0));
  const profileComplete = Math.round((numCompleted / numFields) * 100);

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="bg-[#0F172A] px-5 pt-4 pb-12 relative overflow-hidden rounded-b-[40px] shadow-[0_10px_40px_rgba(15,23,42,0.15)]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#22C55E] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2563EB] rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <button onClick={() => navigate("/profile")} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-white text-lg">Edit Profile</h1>
          <button onClick={handleSave} disabled={loading || !hasChanges} className={`px-4 py-1.5 rounded-full font-bold text-xs tracking-wide transition-colors ${hasChanges ? 'text-[#22C55E] bg-white/10 hover:bg-white/20' : 'text-gray-400 bg-white/5 cursor-not-allowed'}`}>
            {loading ? "..." : (hasChanges ? "Save" : "Saved")}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-20 space-y-5">
        
        {/* Profile Summary */}
        <div className="bg-white/70 backdrop-blur-md rounded-[24px] p-6 card-shadow text-center relative overflow-hidden">
          <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 mb-4 relative group overflow-hidden border-4 border-white shadow-md">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera w-8 h-8"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div>`; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Camera className="w-8 h-8" />
              </div>
            )}
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
              <span className="text-white text-xs font-bold">Change</span>
              <input 
                type="file" accept="image/*" className="hidden" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const base64 = await uploadFile(file);
                  setAvatarUrl(base64);
                }}
              />
            </label>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A]">{firstName} {lastName}</h2>
          <div className="flex items-center gap-1 justify-center mb-2 mt-0.5">
            <p className="text-sm text-gray-500">@{username}</p>
            {isStudentVerified && <GraduationCap className="w-3.5 h-3.5 text-blue-500" />}
          </div>
          <div className="flex justify-center mt-1">
            {isOther ? (
              <span className="trust-badge py-0.5 px-2 text-[10px] bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1 rounded-full font-bold w-max">
                <CheckCircle className="w-3 h-3" /> Not a student
              </span>
            ) : isStudentVerified ? (
              <span className="trust-badge-green trust-badge py-0.5 px-2 text-[10px] flex items-center gap-1 w-max">
                <CheckCircle className="w-3 h-3" /> Verified Student
              </span>
            ) : (
              <span className="trust-badge py-0.5 px-2 text-[10px] bg-orange-50 text-orange-600 border border-orange-200 flex items-center gap-1 rounded-full font-bold w-max">
                <AlertCircle className="w-3 h-3" /> Student Not Verified
              </span>
            )}
          </div>
          
          {profileComplete < 100 && (
            <div className="mt-4 bg-gray-50 rounded-xl p-3 text-left">
              <div className="flex justify-between items-center mb-1 text-xs font-semibold">
                <span className="text-gray-600">Profile Completion</span>
                <span className="text-[#2563EB]">{profileComplete}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                 <motion.div 
                   className="h-full bg-[#2563EB] rounded-full"
                   animate={{ width: `${profileComplete}%` }}
                 />
              </div>
            </div>
          )}
        </div>

        {/* Verification Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-[24px] p-5 card-shadow">
          <h3 className="font-bold text-[#0F172A] mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-[#22C55E]" /> Verifications</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-[#22C55E]" /> Email Verified
            </div>
            <div className="flex items-center gap-2 text-sm w-full">
              {university === "Other / Not a student" ? (
                <><CheckCircle className="w-4 h-4 text-gray-400" /> <span className="text-gray-600">Not a student</span></>
              ) : isStudentVerified ? (
                <><CheckCircle className="w-4 h-4 text-[#22C55E]" /> <span className="text-gray-700">Student Verified</span></>
              ) : (
                <div className="flex flex-col w-full gap-2">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400" /> <span className="text-orange-500">Student Not Verified</span>
                    </div>
                    {!otpSent && (
                      <button onClick={sendStudentOtp} disabled={loading} className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold hover:bg-orange-200 transition-colors">
                        {loading ? "Sending..." : "Verify Now"}
                      </button>
                    )}
                  </div>
                  {otpSent && (
                    <div className="mt-2 bg-orange-50 p-3 rounded-xl border border-orange-100">
                       <p className="text-xs text-orange-600 mb-2 font-medium">Enter the 6-digit code sent to {studentEmail}</p>
                       <div className="flex gap-2">
                         <input type="text" maxLength={6} placeholder="000000" value={otpCode} onChange={e => setOtpCode(e.target.value.trim())} className="w-full py-1 text-center tracking-[0.3em] font-bold text-sm bg-white border border-orange-200 rounded-lg outline-none focus:border-orange-400" />
                         <button onClick={verifyStudentOtp} disabled={verifyingOtp || otpCode.length !== 6} className="bg-orange-500 text-white px-4 text-xs font-bold rounded-lg disabled:opacity-50">
                           {verifyingOtp ? "..." : "Verify"}
                         </button>
                       </div>
                       <button onClick={() => setOtpSent(false)} className="text-[10px] text-orange-400 mt-2 hover:underline">Cancel / Change Email</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white p-4 rounded-[20px] card-shadow text-center">
            <p className="text-xs text-gray-500 font-semibold uppercase">Completed Swaps</p>
            <p className="text-2xl font-black text-[#0F172A] mt-1">{profile?.completedSwaps || 0}</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-4">
          <h3 className="font-extrabold text-[#0F172A] pb-2 border-b border-gray-100">Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 outline-none transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Username</label>
            <div className="flex items-center mt-1.5 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 focus-within:bg-white focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]/20 transition-all">
              <span className="text-gray-400 font-bold mr-1.5">@</span>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full text-sm font-bold text-[#0F172A] outline-none bg-transparent" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Bio</label>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{bio.length}/150</span>
            </div>
            <textarea maxLength={150} value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-[#0F172A] focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 outline-none transition-all resize-none" rows={3} placeholder="Tell the community about yourself..." />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Email</label>
            <input type="email" disabled value={user.email} className="w-full mt-1.5 bg-gray-100 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none" />
          </div>
        </div>

        {/* Education */}
        {university !== "Other / Not a student" && (
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-4">
            <h3 className="font-extrabold text-[#0F172A] pb-2 border-b border-gray-100">Education</h3>
            
            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">University</label>
              <div className="w-full mt-1.5 bg-white border border-[#22C55E] ring-1 ring-[#22C55E]/20 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] flex items-center justify-between">
                <span>{university}</span>
              </div>
            </div>
            
            {university && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Campus</label>
                  <select value={campus} onChange={e => setCampus(e.target.value)} className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 outline-none transition-all appearance-none">
                    <option value="">Select Campus</option>
                    {UNIVERSITIES.find(u => u.name === university)?.campuses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Course</label>
                  <input type="text" value={course} onChange={e => setCourse(e.target.value)} className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 outline-none transition-all" placeholder="e.g. Computer Science" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Year of Study</label>
                    <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 outline-none transition-all appearance-none">
                      <option value="">Select Year</option>
                      {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Graduation Year</label>
                    <select value={graduationYear} onChange={e => setGraduationYear(e.target.value)} className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 outline-none transition-all appearance-none">
                      <option value="">Select Year</option>
                      {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Student Email</label>
                  <input type="email" disabled value={studentEmail} className="w-full mt-1.5 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none cursor-not-allowed" />
                  <p className="text-[10px] text-gray-400 mt-1">Bound to your verified account domain.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location */}
        <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-4">
          <h3 className="font-extrabold text-[#0F172A] pb-2 border-b border-gray-100">Location</h3>
          
          <div>
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Current Location</label>
            <div className="flex items-center justify-between mt-1.5 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5">
              <span className="text-[#0F172A] text-sm font-bold truncate pr-2">
                 {(() => {
                    try {
                      const l = JSON.parse(locationName);
                      if (l.town || l.county) return `${l.town || ''}, ${l.county || ''}`.replace(/^, | ,$/, '').trim();
                      return locationName || "Not set";
                    } catch(e) {
                      return locationName || "Not set";
                    }
                 })()}
              </span>
              <button onClick={handleLocationUpdate} className="text-[#2563EB] text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors shrink-0">
                <MapPin className="w-3 h-3" /> Update
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Search Radius</label>
              <span className="text-sm font-black text-[#22C55E] bg-green-50 px-3 py-1 rounded-full">{radius} KM</span>
            </div>
            <input type="range" min={5} max={50} step={5} value={radius} onChange={e => setRadius(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#22C55E]" />
            <div className="flex justify-between text-[10px] font-extrabold text-gray-400 mt-2">
              <span>5 KM</span><span>50 KM</span>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <h3 className="font-extrabold text-[#0F172A] pb-3 border-b border-gray-100 mb-4">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {ALL_INTERESTS.map(interest => {
              const selected = interests.has(interest.id);
              return (
                <button
                  key={interest.id} onClick={() => toggleInterest(interest.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-[16px] text-xs font-bold transition-all ${
                    selected ? `${interest.color} shadow-sm scale-105 border-2 border-transparent` : 'bg-gray-50 border-2 border-gray-100 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {interest.icon}
                  {interest.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferences & Privacy */}
        <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-4">
          <h3 className="font-extrabold text-[#0F172A] pb-2 border-b border-gray-100">Preferences & Privacy</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#0F172A] font-bold">Profile Visibility</span>
              <select value={privacy.visibility} onChange={e => setPrivacy({...privacy, visibility: e.target.value})} className="text-xs font-extrabold uppercase tracking-wide text-[#2563EB] bg-blue-50 px-4 py-2 rounded-[16px] outline-none appearance-none cursor-pointer">
                <option>Public</option>
                <option>SwapSoko Users</option>
              </select>
            </div>
            
            <div className="h-px bg-gray-50 w-full" />
            <ToggleRow label="Show Distance" checked={privacy.showDistance} onChange={c => setPrivacy({...privacy, showDistance: c})} />
            <div className="h-px bg-gray-50 w-full" />
            <ToggleRow label="Show Last Active" checked={privacy.showLastActive} onChange={c => setPrivacy({...privacy, showLastActive: c})} />
            <div className="h-px bg-gray-50 w-full" />
            <ToggleRow label="Push Notifications" checked={prefs.notifications} onChange={c => setPrefs({...prefs, notifications: c})} />
          </div>
        </div>        {/* Account */}
        <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-2">
          <h3 className="font-extrabold text-[#0F172A] pb-2 border-b border-gray-100 mb-2">Account</h3>
          
          <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-gray-200 text-[#0F172A] transition-all text-sm font-bold">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Lock className="w-4 h-4 text-gray-500" />
            </div>
            Change Password
          </button>
          <button onClick={() => setShowEmailModal(true)} className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-gray-200 text-[#0F172A] transition-all text-sm font-bold">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Mail className="w-4 h-4 text-gray-500" />
            </div>
            Change Email
          </button>
          
          <div className="pt-2">
            <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-red-50 hover:bg-red-100 text-red-600 transition-all text-sm font-extrabold">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <LogOut className="w-4 h-4 text-red-500" />
              </div>
              Log Out
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 pb-8 flex justify-center">
          <button onClick={handleDeleteAccount} className="text-xs font-extrabold text-red-400 hover:text-red-500 flex items-center gap-1.5 uppercase tracking-wider">
            <Trash2 className="w-3.5 h-3.5" /> Delete Account Permanently
          </button>
        </div>

      </div>

      {/* Sticky Mobile Save Button */}
      <div className="sticky bottom-6 z-[250] mt-8 flex justify-center pointer-events-none">
        <button onClick={handleSave} disabled={loading} className="pointer-events-auto flex items-center justify-center gap-2 gradient-green text-white font-bold px-8 py-3 rounded-full shadow-[0_8px_30px_rgba(34,197,94,0.3)] border border-green-400 disabled:opacity-50 transition-transform active:scale-95">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/70 backdrop-blur-md rounded-[24px] p-6 w-full max-w-sm">
            <h3 className="font-bold text-[#0F172A] mb-4">Change Password</h3>
            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#22C55E] mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 text-gray-500 font-bold bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleChangePassword} className="flex-1 py-3 text-white font-bold gradient-green rounded-xl">Update</button>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/70 backdrop-blur-md rounded-[24px] p-6 w-full max-w-sm">
            <h3 className="font-bold text-[#0F172A] mb-4">Change Email</h3>
            <input type="email" placeholder="New Email Address" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#22C55E] mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowEmailModal(false)} className="flex-1 py-3 text-gray-500 font-bold bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleChangeEmail} className="flex-1 py-3 text-white font-bold gradient-green rounded-xl">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-[#22C55E]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
