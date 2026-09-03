import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, Camera, Plus, X, Tag, Upload, CheckCircle2, Image as ImageIcon, Loader2, Package, Wrench, Gift, ClipboardList, Lightbulb, ArrowRight, Check } from "@/lib/icons";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { LocationSelector, CAMPUSES } from "@/components/LocationSelector";
import { useAppStore } from "@/store";

const CATEGORIES = [
  "Electronics", "Books", "Furniture", "Clothing", "Sports",
  "Music", "Gaming", "Tools", "Kitchen", "Services", "Other"
];

const CONDITIONS = [
  { value: "brand_new", label: "Brand New", color: "bg-emerald-500" },
  { value: "like_new", label: "Like New", color: "bg-green-500" },
  { value: "good", label: "Good", color: "bg-blue-500" },
  { value: "fair", label: "Fair", color: "bg-yellow-500" },
  { value: "repair", label: "Needs Repair", color: "bg-red-500" },
];

// Read file as base64 data URL
async function uploadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function PostPage() {
    const { user, isAuthenticated } = useAuth();
  const { coords, setCoords } = useAppStore();
  const [, navigate] = useLocation();
  const createMutation = trpc.listings.create.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (navigator.geolocation && !coords) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Location not available:', err),
        { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true }
      );
    }
  }, []);

  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [condition, setCondition] = useState("good");
  const [estimatedValue, setEstimatedValue] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [purchaseYear, setPurchaseYear] = useState<string>("");
  const [wantItems, setWantItems] = useState<string[]>([]);
  const [wantInput, setWantInput] = useState("");
  const [cashTopUpAllowed, setCashTopUpAllowed] = useState(false);
  const [cashTopUpAmount, setCashTopUpAmount] = useState(0);
  const filters = useAppStore(state => state.filters);
  const detectedLocationName = (() => {
    try {
      const loc = user?.user_metadata?.locationName ? JSON.parse(user.user_metadata.locationName) : null;
      if (loc && loc.town) return `${loc.town}${loc.county ? `, ${loc.county}` : ''}`;
    } catch(e) {}
    return null;
  })();
  const [campus, setCampus] = useState(detectedLocationName || filters.campus || user?.user_metadata?.campus || CAMPUSES[0].name);
  const [university, setUniversity] = useState(filters.university || CAMPUSES[0].university);
  const [type, setType] = useState<"item" | "service" | "donation">("item");
  const [serviceLocation, setServiceLocation] = useState<"remote" | "in-person">("in-person");
  const [lookingFor, setLookingFor] = useState("");
  const [duration, setDuration] = useState("");
  const [locationType, setLocationType] = useState("remote");
  const [availability, setAvailability] = useState("");
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [portfolioLink, setPortfolioLink] = useState("");
  
  // Video States
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Donation fields
  const [recipientType, setRecipientType] = useState("Any Student");
  const [pickupPreference, setPickupPreference] = useState("On Campus");
  const [expiry, setExpiry] = useState("1 Week");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addWantItem = () => {
    if (wantInput.trim() && !wantItems.includes(wantInput.trim())) {
      setWantItems(prev => [...prev, wantInput.trim()]);
      setWantInput("");
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { // 50MB max
       toast.error("Video is too large (max 50MB)");
       return;
    }
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = 4 - images.length;
    const toUpload = files.slice(0, remaining);

    setUploadingImages(true);
    try {
      const uploaded = await Promise.all(
        toUpload.map(async (file) => {
          // Validate size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`${file.name} is too large (max 5MB)`);
          }
          try {
            return await uploadFile(file);
          } catch {
            // Fallback: create object URL for preview (won't persist after page reload)
            return URL.createObjectURL(file);
          }
        })
      );
      setImages(prev => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} added!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photos");
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [images.length]);

  const handleLocationSelect = useCallback((loc: { campus: typeof CAMPUSES[0]; radius: number }) => {
    setCampus(loc.campus.name);
    setUniversity(loc.campus.university);
  }, []);

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast("Please login to post listings", { action: { label: "Login", onClick: () => window.location.href = getLoginUrl() } });
      return;
    }
    if (!title.trim()) { toast.error("Please add a title"); return; }
    if (images.length === 0 && !videoFile) { toast.error("Please add at least one photo or video"); return; }
    const finalWantItems = type === "donation" ? ["FREE / DONATION"] : (lookingFor.trim() ? [lookingFor.trim()] : []);
    if (finalWantItems.length === 0) { toast.error("Please describe what you are looking for"); return; }

    const searchParams = new URLSearchParams(window.location.search);
    const communityId = searchParams.get("communityId");

    let finalDesc = description;
    if (type === "service") {
      finalDesc = `[Service Details]\nDuration: ${duration || 'N/A'}\nLocation: ${locationType}\nAvailability: ${availability || 'N/A'}\nSkill Level: ${skillLevel}\nPortfolio: ${portfolioLink || 'N/A'}\n\n${description}`;
    } else if (type === "donation") {
      finalDesc = `[Donation Details]\nRecipient Priority: ${recipientType}\nPickup Preference: ${pickupPreference}\nExpires in: ${expiry}\n\n${description}`;
    }
    
    // Embed Value Engine payload
    const valueMeta = { estimatedValue, originalPrice, purchaseYear };
    finalDesc = `${finalDesc}\n\n<!--value_engine:${JSON.stringify(valueMeta)}-->`;

    if (communityId) finalDesc = `${finalDesc}\n\n<!--soko:${communityId}-->`;

    createMutation.mutate({
      userId: user?.id,
      title,
      description: finalDesc,
      category,
      condition: condition as any,
      images,
      wantItems: finalWantItems,
      cashTopUpAllowed: type === "donation" ? false : cashTopUpAllowed,
      cashTopUpAmount,
      campus,
      lat: coords?.lat,
      lng: coords?.lng,
    }, {
      onSuccess: async (data: any) => {
        
        // Upload video if provided
        if (videoFile && data?.id) {
           const ext = videoFile.name.split('.').pop() || 'mp4';
           const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
           toast.loading("Uploading video...");
           
           const { data: uploadData, error: uploadError } = await supabase.storage.from('listing-videos').upload(fileName, videoFile);
           if (!uploadError && uploadData) {
               const { data: publicUrlData } = supabase.storage.from('listing-videos').getPublicUrl(fileName);
               
               await supabase.from('listing_media').insert({
                   listing_id: data.id,
                   type: 'video',
                   url: publicUrlData.publicUrl
               });
           } else {
               toast.error("Video upload failed.");
           }
           toast.dismiss();
        }

        utils.listings.feed.invalidate();
        utils.listings.myListings.invalidate();
        toast.success("Listing posted successfully!");
        navigate("/");
      },
      onError: (err: any) => {
        console.error(err);
        toast.error(err.message || "Failed to post listing");
      },
    });
  };

  const steps = [
    { id: 1, label: "Photos" },
    { id: 2, label: "Details" },
    { id: 3, label: type === "donation" ? "Confirm" : "Trade" },
  ];


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white flex flex-col relative overflow-hidden font-sans"
    >
      {/* Premium Background Blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      </div>

      {/* Sleek Header */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-2">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_8px_32px_rgba(15,23,42,0.08)] rounded-[32px] px-4 py-3 max-w-[800px] mx-auto w-full flex flex-col gap-4"
        >
          <div className="flex items-center justify-between relative">
            <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/")} className="w-11 h-11 flex items-center justify-center rounded-[20px] bg-white/50 hover:bg-white/80 border border-white/60 shadow-sm transition-colors text-slate-900 relative z-10">
              <ChevronLeft className="w-6 h-6 -ml-0.5" />
            </button>
            
            <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
              <h1 className="font-black text-slate-900 text-[20px] flex items-center justify-center gap-1.5 tracking-tight drop-shadow-sm">
                <Plus className="w-5 h-5 text-emerald-500" strokeWidth={3} /> Post Listing
              </h1>
            </div>

            <div className="w-11 h-11 relative z-10" />
          </div>

          {/* Apple-style Step indicator */}
          <div className="flex items-center justify-between px-2 pb-1">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className={`w-8 h-8 rounded-[14px] flex items-center justify-center text-[13px] font-extrabold transition-all duration-300 ${
                    step >= s.id ? "bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-white/50 border border-white/60 text-slate-400"
                  }`}>
                    {step > s.id ? <Check className="w-4 h-4" strokeWidth={3} /> : s.id}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${step >= s.id ? "text-slate-800" : "text-slate-400"}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-1.5 mx-2 rounded-full bg-white/50 border border-white/60 overflow-hidden relative">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: step > s.id ? "100%" : "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto bottom-nav-safe relative z-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Photos */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/40 backdrop-blur-2xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(15,23,42,0.08)] border border-white/60 space-y-8 mb-8 max-w-[800px] mx-auto w-full"
            >
              <div className="text-center">
                <h2 className="font-black text-slate-900 text-[28px] tracking-tight drop-shadow-sm">Media</h2>
                <p className="text-slate-500 text-[15px] font-bold mt-1">Make your listing stand out</p>
              </div>

              {/* Hidden file inputs */}
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
              <input ref={videoInputRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={handleVideoSelect} />

              {/* 2x2 Photo Grid Layout */}
              <div className="grid grid-cols-2 gap-3">
                {images.length === 0 ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImages}
                    className="col-span-2 aspect-[4/3] rounded-[28px] border-2 border-dashed border-slate-300/60 bg-white/50 backdrop-blur-md hover:bg-white/80 flex flex-col items-center justify-center gap-4 transition-all shadow-sm"
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-[24px] bg-white shadow-md flex items-center justify-center">
                          <Camera className="w-8 h-8 text-emerald-500" strokeWidth={2.5} />
                        </div>
                        <span className="text-[14px] font-bold text-slate-600">Tap to add photos</span>
                      </>
                    )}
                  </motion.button>
                ) : (
                  <>
                    {images.map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`relative rounded-[24px] overflow-hidden bg-slate-100 shadow-md ${i === 0 && images.length % 2 !== 0 ? 'col-span-2 aspect-[4/3]' : 'aspect-square'}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center z-10 shadow-sm"
                        >
                          <X className="w-4 h-4 text-white" strokeWidth={3} />
                        </motion.button>
                        {i === 0 && (
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-black px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                            Cover
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {images.length > 0 && images.length < 4 && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImages}
                        className="aspect-square rounded-[24px] border-2 border-dashed border-slate-300/60 bg-white/50 backdrop-blur-md hover:bg-white/80 flex flex-col items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        {uploadingImages ? (
                          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-8 h-8 text-slate-400" strokeWidth={2.5} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Add More</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </>
                )}

                {/* Video slot */}
                {videoUrl ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative rounded-[24px] overflow-hidden bg-slate-900 shadow-md ${images.length === 0 ? 'col-span-2 aspect-[4/3]' : 'col-span-2 aspect-video'}`}
                  >
                    <video src={videoUrl} className="w-full h-full object-cover" controls />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setVideoUrl("")}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center z-10 shadow-sm"
                    >
                      <X className="w-4 h-4 text-white" strokeWidth={3} />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => videoInputRef.current?.click()}
                    disabled={false}
                    className={`rounded-[24px] border-2 border-dashed border-slate-300/60 bg-white/50 backdrop-blur-md hover:bg-white/80 flex flex-col items-center justify-center gap-3 transition-all shadow-sm ${images.length === 0 ? 'col-span-2 py-6' : 'col-span-2 py-5'}`}
                  >
                    {false ? (
                      <>
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Uploading Video...</span>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[18px] bg-white shadow-sm flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-500" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-[14px] font-bold text-slate-700">Add a Video</span>
                          <span className="text-[11px] font-bold text-slate-400">Optional (max 50MB)</span>
                        </div>
                      </div>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Type selector */}
              <div className="pt-2">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-3">Listing Type</label>
                <div className="flex gap-2 p-1.5 bg-white/60 backdrop-blur-xl border border-white/60 rounded-[28px] shadow-sm">
                  {(["item", "service", "donation"] as const).map(lt => (
                    <motion.button
                      key={lt}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setType(lt)}
                      className={`flex-1 py-3.5 flex flex-col items-center gap-1.5 rounded-[22px] text-[13px] font-bold capitalize transition-all ${
                        type === lt ? "bg-white text-emerald-600 shadow-md shadow-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                      }`}
                    >
                      {lt === "item" ? <Package className="w-5 h-5" /> : lt === "service" ? <Wrench className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                      {lt}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                disabled={images.length === 0}
                className={`w-full py-4.5 rounded-[24px] font-black text-[16px] mt-6 transition-all flex items-center justify-center gap-2 ${images.length > 0 ? "bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.25)] hover:shadow-[0_12px_25px_rgba(15,23,42,0.35)] hover:-translate-y-0.5" : "bg-white/50 backdrop-blur-md text-slate-400 border border-white/60"}`}
              >
                Continue <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/40 backdrop-blur-2xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(15,23,42,0.08)] border border-white/60 space-y-6 mb-8 max-w-[800px] mx-auto w-full"
            >
              <div className="text-center">
                <h2 className="font-black text-slate-900 text-[28px] tracking-tight drop-shadow-sm">Details</h2>
                <p className="text-slate-500 text-[15px] font-bold mt-1">Tell people about your offering</p>
              </div>

              <div>
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={type === "service" ? "e.g. Graphic Design for 1 Month" : "e.g. iPhone 11 64GB"}
                  className="w-full mt-2 border-none bg-white/70 backdrop-blur-xl rounded-[20px] px-5 py-4 text-[16px] outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)] font-bold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {type === "service" && (
                <div className="space-y-6 p-6 bg-blue-50/50 backdrop-blur-2xl border border-white/60 rounded-[28px] shadow-sm">
                  <p className="text-[16px] font-black text-blue-600 flex items-center gap-2"><Wrench className="w-5 h-5" /> Service Details</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-black text-blue-500/70 uppercase tracking-widest ml-2">Duration</label>
                      <input
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        placeholder="e.g. 2 weeks, 1 hr"
                        className="w-full mt-2 border-none bg-white/70 backdrop-blur-xl rounded-[18px] px-5 py-3.5 text-[15px] outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm font-bold text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-blue-500/70 uppercase tracking-widest ml-2">Location</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {["remote", "in-person"].map(loc => (
                          <button
                            key={loc}
                            onClick={() => setServiceLocation(loc as any)}
                            className={`px-5 py-3 rounded-[16px] text-[13px] font-bold capitalize transition-all ${
                              serviceLocation === loc ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" : "bg-white/60 text-slate-500 hover:bg-white shadow-sm"
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Category *</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2.5 rounded-[16px] text-[13px] font-bold transition-all border ${
                        category === cat ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20" : "bg-white/50 border-white/60 text-slate-500 hover:bg-white shadow-sm"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {type !== "service" && (
                <div>
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Condition *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONDITIONS.map(cond => (
                      <button
                        key={cond.value}
                        onClick={() => setCondition(cond.value)}
                        className={`px-4 py-3 rounded-[16px] text-[13px] font-bold flex items-center justify-between transition-all border ${
                          condition === cond.value ? "bg-emerald-50 border-emerald-500 shadow-sm" : "bg-white/50 border-white/60 text-slate-500 hover:bg-white shadow-sm"
                        }`}
                      >
                        <span className={condition === cond.value ? "text-emerald-700" : ""}>{cond.label}</span>
                        <div className={`w-3 h-3 rounded-full ${cond.color} ${condition === cond.value ? "shadow-md scale-110" : "opacity-50"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Description *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your item, its features, and any defects..."
                  className="w-full mt-2 border-none bg-white/70 backdrop-blur-xl rounded-[20px] px-5 py-4 text-[15px] outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)] font-medium text-slate-900 placeholder:text-slate-400 min-h-[120px] resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(1)}
                  className="flex-1 py-4.5 rounded-[24px] font-black text-[16px] bg-white/60 backdrop-blur-md text-slate-600 border border-white/80 shadow-sm hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(3)}
                  disabled={!title || !category || (type !== 'service' && !condition) || !description || (type === 'service' && !duration)}
                  className={`flex-[2] py-4.5 rounded-[24px] font-black text-[16px] transition-all flex items-center justify-center gap-2 ${
                    title && category && (type === 'service' || condition) && description && (type !== 'service' || duration)
                      ? "bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.25)] hover:shadow-[0_12px_25px_rgba(15,23,42,0.35)] hover:-translate-y-0.5"
                      : "bg-white/50 text-slate-400 border border-white/60"
                  }`}
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Value */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/40 backdrop-blur-2xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(15,23,42,0.08)] border border-white/60 space-y-6 mb-8 max-w-[800px] mx-auto w-full"
            >
              <div className="text-center">
                <h2 className="font-black text-slate-900 text-[28px] tracking-tight drop-shadow-sm">Value</h2>
                <p className="text-slate-500 text-[15px] font-bold mt-1">What are you looking for?</p>
              </div>

              {type !== "donation" && (
                <div className="bg-emerald-50/60 backdrop-blur-xl border border-emerald-100 rounded-[28px] p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-black text-emerald-800 text-[16px]">Estimated Value</h3>
                  </div>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">KES</span>
                    <input
                      type="number"
                      value={estimatedValue}
                      onChange={e => setEstimatedValue(e.target.value as any)}
                      placeholder="0"
                      className="w-full border-none bg-white/80 backdrop-blur-xl rounded-[20px] pl-16 pr-5 py-4 text-[18px] outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-sm font-black text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                </div>
              )}

              {type === "item" && (
                <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <h3 className="font-bold text-slate-700 text-[14px]">Original Price</h3>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">KES</span>
                      <input
                        type="number"
                        value={originalPrice}
                        onChange={e => setOriginalPrice(e.target.value as any)}
                        placeholder="Price"
                        className="w-full border-none bg-white rounded-[16px] pl-12 pr-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm font-bold text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={purchaseYear}
                        onChange={e => setPurchaseYear(e.target.value)}
                        placeholder="Year (e.g. 2022)"
                        className="w-full border-none bg-white rounded-[16px] px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm font-bold text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {type !== "donation" && (
                <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-700 text-[14px]">Accept Cash Top Up</h3>
                      <p className="text-[12px] text-slate-500 font-medium mt-1">Allow others to offer cash alongside items</p>
                    </div>
                    <button
                      onClick={() => setCashTopUpAllowed(!cashTopUpAllowed)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${cashTopUpAllowed ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${cashTopUpAllowed ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  {cashTopUpAllowed && (
                    <div className="pt-2">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">KES</span>
                        <input
                          type="number"
                          value={cashTopUpAmount || ''}
                          onChange={e => setCashTopUpAmount(Number(e.target.value))}
                          placeholder="Min amount (optional)"
                          className="w-full border-none bg-white rounded-[16px] pl-12 pr-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm font-bold text-slate-900 placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {type !== "donation" && (
                <div>
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Looking For *</label>
                  <textarea
                    value={lookingFor}
                    onChange={e => setLookingFor(e.target.value)}
                    placeholder="e.g. Looking to swap for a MacBook Pro or cash"
                    className="w-full mt-2 border-none bg-white/70 backdrop-blur-xl rounded-[20px] px-5 py-4 text-[15px] outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)] font-medium text-slate-900 placeholder:text-slate-400 min-h-[100px] resize-none"
                  />
                </div>
              )}

              <div>
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-3">Campus Location *</label>
                <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[24px] p-2 shadow-sm">
                  <LocationSelector currentCampus={campus} onLocationSelect={(loc) => setCampus(loc.campus.name)} />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(2)}
                  className="flex-1 py-4.5 rounded-[24px] font-black text-[16px] bg-white/60 backdrop-blur-md text-slate-600 border border-white/80 shadow-sm hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || (type !== "donation" && (!estimatedValue || !lookingFor)) || !campus}
                  className={`flex-[2] py-4.5 rounded-[24px] font-black text-[16px] transition-all flex items-center justify-center gap-2 ${
                    ((type === "donation" || (estimatedValue && lookingFor)) && campus)
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_25px_rgba(16,185,129,0.45)] hover:-translate-y-0.5"
                      : "bg-white/50 text-slate-400 border border-white/60"
                  }`}
                >
                  {createMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
                  ) : (
                    <><Upload className="w-5 h-5" /> Publish</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
