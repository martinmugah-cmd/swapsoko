import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { ChevronLeft, Camera, Plus, X, Tag, Upload, CheckCircle2, Image as ImageIcon, Loader2, Package, Wrench, Gift, ClipboardList, Lightbulb, ArrowRight, Check } from "lucide-react";
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
    const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const createMutation = trpc.listings.create.useMutation();
  const utils = trpc.useUtils();

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
    const finalWantItems = type === "donation" ? ["FREE / DONATION"] : wantItems;
    if (finalWantItems.length === 0) { toast.error("Please add at least one item you want"); return; }

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
      className="min-h-screen bg-[#F8FAFC] flex flex-col"
    >
      {/* Header */}
      <div className="page-header px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/")} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#0F172A]" />
          </button>
          <h1 className="font-bold text-[#0F172A] text-base">{"Post Item"}</h1>
          <div className="w-8" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-1.5 ${step >= s.id ? "text-[#22C55E]" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= s.id ? "bg-[#22C55E] text-white" : "bg-gray-200 text-gray-400"}`}>
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full ${step > s.id ? "bg-[#22C55E]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto bottom-nav-safe">
        <AnimatePresence mode="wait">
          {/* Step 1: Photos */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[36px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-6 mb-8 border border-white"
            >
              <div>
                <h2 className="font-extrabold text-[#0F172A] text-xl tracking-tight">Add Media</h2>
                <p className="text-gray-500 text-[13px] font-medium mt-1.5">Add up to 4 photos and 1 video (max 50MB)</p>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={handleVideoSelect}
              />

              {/* Photo grid */}
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square rounded-[32px] overflow-hidden bg-gray-100"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </motion.button>
                    {i === 0 && (
                      <div className="absolute bottom-2 left-2 bg-[#22C55E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Main
                      </div>
                    )}
                  </motion.div>
                ))}
                {images.length < 4 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImages}
                    className="aspect-square rounded-[32px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 bg-white disabled:opacity-50"
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="w-8 h-8 text-[#22C55E] animate-spin" />
                        <span className="text-xs text-gray-400">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-300" />
                        <span className="text-xs text-gray-400">Add Photo</span>
                        <span className="text-[10px] text-gray-300">Tap to upload</span>
                      </>
                    )}
                  </motion.button>
                )}
                {/* Video slot */}
                {videoUrl ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square rounded-[32px] overflow-hidden bg-black"
                  >
                    <video src={videoUrl} autoPlay loop muted className="w-full h-full object-cover opacity-80" />
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => { setVideoFile(null); setVideoUrl(null); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
                    >
                      <X className="w-3 h-3 text-white" />
                    </motion.button>
                    <div className="absolute bottom-2 left-2 bg-[#22C55E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                      Video
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => videoInputRef.current?.click()}
                    className="aspect-square rounded-[32px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 bg-white"
                  >
                    <Upload className="w-8 h-8 text-gray-300" />
                    <span className="text-xs text-gray-400 font-semibold">Add Video</span>
                    <span className="text-[10px] text-gray-300">Tap to record</span>
                  </motion.button>
                )}
              </div>

              {/* Type selector */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Listing Type</label>
                <div className="flex gap-2 mt-2">
                  {(["item", "service", "donation"] as const).map(lt => (
                    <motion.button
                      key={lt}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setType(lt)}
                      className={`flex-1 py-2 flex justify-center items-center gap-1.5 rounded-[24px] text-xs font-semibold capitalize transition-colors ${
                        type === lt ? "gradient-green text-white" : "bg-white text-gray-600 card-shadow"
                      }`}
                    >
                      {lt === "item" ? <><Package className="w-3.5 h-3.5" /> Item</> : lt === "service" ? <><Wrench className="w-3.5 h-3.5" /> Service</> : <><Gift className="w-3.5 h-3.5" /> Donation</>}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                disabled={images.length === 0}
                className={`w-full py-3.5 rounded-[32px] font-bold text-sm ${images.length > 0 ? "gradient-green text-white" : "bg-gray-200 text-gray-400"}`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {"Next"} <ArrowRight className="w-4 h-4" />
                </div>
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
              className="bg-white rounded-[36px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-6 mb-8 border border-white"
            >
              <div>
                <h2 className="font-extrabold text-[#0F172A] text-xl tracking-tight">Item Details</h2>
                <p className="text-gray-500 text-[13px] font-medium mt-1.5">Tell people about what you're offering</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={type === "service" ? "e.g. Graphic Design for 1 Month" : "e.g. iPhone 11 64GB"}
                  className="w-full mt-1 border border-gray-200 rounded-[24px] px-3 py-2.5 text-sm outline-none focus:border-[#22C55E]"
                />
              </div>

              {type === "service" && (
                <div className="space-y-4 p-4 bg-[#EFF6FF] rounded-[24px]">
                  <p className="text-sm font-bold text-[#2563EB] flex items-center gap-2"><Wrench className="w-4 h-4" /> Service Details</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</label>
                      <input
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        placeholder="e.g. 2 weeks, 1 hr"
                        className="w-full mt-1 border border-blue-200 bg-white/70 backdrop-blur-md rounded-[24px] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
                      <select
                        value={locationType}
                        onChange={e => setLocationType(e.target.value)}
                        className="w-full mt-1 border border-blue-200 bg-white/70 backdrop-blur-md rounded-[24px] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                      >
                        <option value="remote">Remote</option>
                        <option value="in-person">In-Person</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Availability</label>
                    <input
                      value={availability}
                      onChange={e => setAvailability(e.target.value)}
                      placeholder="e.g. Weekends only, Evenings"
                      className="w-full mt-1 border border-blue-200 bg-white/70 backdrop-blur-md rounded-[24px] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Skill Level</label>
                      <select
                        value={skillLevel}
                        onChange={e => setSkillLevel(e.target.value)}
                        className="w-full mt-1 border border-blue-200 bg-white/70 backdrop-blur-md rounded-[24px] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Portfolio Link</label>
                      <input
                        value={portfolioLink}
                        onChange={e => setPortfolioLink(e.target.value)}
                        placeholder="e.g. behance.net/..."
                        className="w-full mt-1 border border-blue-200 bg-white/70 backdrop-blur-md rounded-[24px] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {type === "donation" && (
                <div className="space-y-4 p-4 bg-[#F0FDF4] rounded-[24px]">
                  <p className="text-sm font-bold text-[#22C55E] flex items-center gap-2"><Gift className="w-4 h-4" /> Donation Details</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recipient</label>
                      <select
                        value={recipientType}
                        onChange={e => setRecipientType(e.target.value)}
                        className="w-full mt-1 border border-green-200 bg-white/70 backdrop-blur-md rounded-[24px] px-3 py-2 text-sm outline-none focus:border-[#22C55E]"
                      >
                        <option value="Any Student">Any Student</option>
                        <option value="Graduating Student">Graduating Student</option>
                        <option value="Charity/Organization">Charity/Organization</option>
                        <option value="Anyone">Anyone</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pickup</label>
                      <select
                        value={pickupPreference}
                        onChange={e => setPickupPreference(e.target.value)}
                        className="w-full mt-1 border border-green-200 bg-white/70 backdrop-blur-md rounded-[24px] px-3 py-2 text-sm outline-none focus:border-[#22C55E]"
                      >
                        <option value="On Campus">On Campus</option>
                        <option value="My Location">My Location</option>
                        <option value="Public Meetup">Public Meetup</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry</label>
                    <select
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      className="w-full mt-1 border border-green-200 bg-white/70 backdrop-blur-md rounded-[24px] px-3 py-2 text-sm outline-none focus:border-[#22C55E]"
                    >
                      <option value="1 Week">1 Week</option>
                      <option value="2 Weeks">2 Weeks</option>
                      <option value="1 Month">1 Month</option>
                      <option value="Until Claimed">Until Claimed</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the condition, specs, and any extras..."
                  rows={3}
                  className="w-full mt-1 border border-gray-200 rounded-[24px] px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] resize-none"
                />
              </div>

              {type !== "service" && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                  {CATEGORIES.map(cat => (
                    <motion.button
                      key={cat}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-[24px] text-xs font-medium transition-colors ${
                        category === cat ? "bg-[#22C55E] text-white" : "bg-white text-gray-600 card-shadow"
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                  </div>
                </div>
              )}

              {type !== "service" && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Condition</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CONDITIONS.map(c => (
                    <motion.button
                      key={c.value}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCondition(c.value)}
                      className={`px-3 py-1.5 rounded-[24px] text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                      condition === c.value ? "gradient-blue text-white" : "bg-white text-gray-600 card-shadow"
                      }`}
                    >
                      {c.label}
                    </motion.button>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estimated Value (KES)</label>
                      <input
                        type="number"
                        value={estimatedValue}
                        onChange={e => setEstimatedValue(Number(e.target.value))}
                        placeholder="e.g. 30000"
                        className="w-full mt-1.5 px-4 py-3 rounded-[16px] text-sm card-shadow outline-none border border-transparent focus:border-[#22C55E]/30 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Original Price (KES)</label>
                      <input
                        type="number"
                        value={originalPrice}
                        onChange={e => setOriginalPrice(Number(e.target.value))}
                        placeholder="Optional"
                        className="w-full mt-1.5 px-4 py-3 rounded-[16px] text-sm card-shadow outline-none border border-transparent focus:border-[#22C55E]/30 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Purchase Year</label>
                    <input
                      type="number"
                      value={purchaseYear}
                      onChange={e => setPurchaseYear(e.target.value)}
                      placeholder="e.g. 2024"
                      className="w-full mt-1.5 px-4 py-3 rounded-[16px] text-sm card-shadow outline-none border border-transparent focus:border-[#22C55E]/30 bg-white"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Campus picker with Google Maps */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Campus Location</label>
                <LocationSelector
                  onLocationSelect={handleLocationSelect}
                  currentCampus={campus}
                />
                {campus && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#22C55E]" /> {campus} — {university}
                  </p>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(3)}
                disabled={!title.trim()}
                className={`w-full py-3.5 rounded-[32px] font-bold text-sm ${title.trim() ? "gradient-green text-white" : "bg-gray-200 text-gray-400"}`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {"Next"} <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Trade Terms */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[36px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-6 mb-8 border border-white"
            >
              <div>
                <h2 className="font-extrabold text-[#0F172A] text-xl tracking-tight">{type === "donation" ? "Confirm Donation" : "Trade Terms"}</h2>
                <p className="text-gray-500 text-[13px] font-medium mt-1.5">{type === "donation" ? "Confirm and post your free item" : "What do you want in exchange?"}</p>
              </div>

              {type !== "donation" && (
                <>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">I Want (add items)</label>
                <div className="flex gap-2 mt-1">
                  <input
                    value={wantInput}
                    onChange={e => setWantInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addWantItem()}
                    placeholder="e.g. Laptop, iPhone..."
                    className="flex-1 border border-gray-200 rounded-[24px] px-3 py-2.5 text-sm outline-none focus:border-[#22C55E]"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={addWantItem}
                    className="w-10 h-10 gradient-green rounded-[24px] flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <AnimatePresence>
                    {wantItems.map((item, i) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full text-xs font-medium"
                      >
                        <Tag className="w-3 h-3" />
                        {item}
                        <button onClick={() => setWantItems(prev => prev.filter((_, idx) => idx !== i))}>
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {wantItems.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">Add at least one item you want to swap for</p>
                )}
              </div>

              {/* M-Pesa Cash Bridge */}
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[32px] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#22C55E] rounded-[24px] flex items-center justify-center">
                      <span className="text-white text-xs font-black">M</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F172A] text-sm">{"M-Pesa Top-Up"}</p>
                      <p className="text-[10px] text-gray-500">Allow cash difference via M-Pesa</p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCashTopUpAllowed(!cashTopUpAllowed)}
                    className={`w-12 h-6 rounded-full transition-colors ${cashTopUpAllowed ? "bg-[#22C55E]" : "bg-gray-200"}`}
                  >
                    <motion.div
                      animate={{ x: cashTopUpAllowed ? 24 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-5 h-5 bg-white rounded-full shadow"
                    />
                  </motion.button>
                </div>
                <AnimatePresence>
                  {cashTopUpAllowed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3">
                        <label className="text-xs text-gray-500">Maximum top-up I'll accept (KES)</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#22C55E]">KES</span>
                          <input
                            type="number"
                            value={cashTopUpAmount}
                            onChange={e => setCashTopUpAmount(Number(e.target.value))}
                            placeholder="e.g. 2000"
                            className="w-full pl-12 pr-3 border border-[#BBF7D0] rounded-[24px] py-2 text-sm outline-none focus:border-[#22C55E] bg-white"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Payment via M-Pesa at meetup. Recommended for fair trades.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </>
              )}

              {/* Preview */}
              <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-4 card-shadow">
                <h3 className="font-semibold text-[#0F172A] text-sm mb-3 flex items-center gap-1.5"><ClipboardList className="w-4 h-4 text-gray-400" /> Listing Preview</h3>
                <div className="flex gap-3">
                  {images[0] ? (
                    <img src={images[0]} alt="" className="w-16 h-16 rounded-[24px] object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-[24px] bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0F172A] text-sm">{title || "Your item"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{campus}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {(type === "donation" ? ["FREE / DONATION"] : wantItems).slice(0, 2).map((w, i) => (
                        <span key={i} className="bg-[#EFF6FF] text-[#2563EB] text-[10px] px-2 py-0.5 rounded-full">{w}</span>
                      ))}
                    </div>
                    {type !== "donation" && cashTopUpAllowed && cashTopUpAmount > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="bg-[#22C55E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          + KES {cashTopUpAmount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={createMutation.isPending || (type !== "donation" && wantItems.length === 0)}
                className={`w-full py-3.5 rounded-[32px] font-bold text-sm ${
                  !createMutation.isPending && (type === "donation" || wantItems.length > 0)
                    ? "gradient-green text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {createMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Posting...
                  </span>
                ) : type === "donation" ? "Post Donation" : "Post Listing"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
