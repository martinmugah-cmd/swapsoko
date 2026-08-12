import { useAppStore } from "@/store";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Search, X, ChevronDown, Check, Crosshair, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { toast } from "sonner";

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}
const CAMPUSES = [
  { id: 1, name: "JKUAT Main Campus (Juja)", university: "JKUAT", lat: -1.0887, lng: 37.0122, county: "Kiambu" },
  { id: 2, name: "JKUAT Karen Campus", university: "JKUAT", lat: -1.3197, lng: 36.7120, county: "Nairobi" },
  { id: 3, name: "UoN Main Campus", university: "University of Nairobi", lat: -1.2796, lng: 36.8162, county: "Nairobi" },
  { id: 4, name: "UoN Chiromo Campus", university: "University of Nairobi", lat: -1.2714, lng: 36.8063, county: "Nairobi" },
  { id: 5, name: "UoN Kikuyu Campus", university: "University of Nairobi", lat: -1.2486, lng: 36.6669, county: "Kiambu" },
  { id: 6, name: "KU Main Campus (Kenyatta)", university: "Kenyatta University", lat: -1.1774, lng: 36.9281, county: "Nairobi" },
  { id: 7, name: "KU Ruiru Campus", university: "Kenyatta University", lat: -1.1554, lng: 36.9632, county: "Kiambu" },
  { id: 8, name: "Strathmore University Main Campus", university: "Strathmore", lat: -1.3100, lng: 36.8125, county: "Nairobi" },
  { id: 9, name: "USIU-Africa Main Campus", university: "USIU", lat: -1.2200, lng: 36.8850, county: "Nairobi" },
  { id: 10, name: "TUK Main Campus (CBD)", university: "Technical University of Kenya", lat: -1.2882, lng: 36.8233, county: "Nairobi" },
  { id: 11, name: "Daystar Nairobi Campus", university: "Daystar", lat: -1.2894, lng: 36.8043, county: "Nairobi" },
  { id: 12, name: "CUEA Langata Campus", university: "Catholic University", lat: -1.3444, lng: 36.7583, county: "Nairobi" },
  { id: 13, name: "MKU Nairobi Campus", university: "Mount Kenya University", lat: -1.2811, lng: 36.8222, county: "Nairobi" },
  { id: 14, name: "MMU Main Campus (Rongai)", university: "Multimedia University", lat: -1.3852, lng: 36.7648, county: "Nairobi" },
  { id: 15, name: "PAC University Roysambu", university: "Pan African Christian University", lat: -1.2173, lng: 36.8845, county: "Nairobi" },
  { id: 16, name: "Riara University Main Campus", university: "Riara", lat: -1.3092, lng: 36.8046, county: "Nairobi" },
  { id: 17, name: "KCA University Ruaraka", university: "KCA University", lat: -1.2546, lng: 36.8524, county: "Nairobi" },
  { id: 18, name: "Zetech University Ruiru", university: "Zetech", lat: -1.1441, lng: 36.9622, county: "Kiambu" },
  { id: 19, name: "Africa Nazarene University Rongai", university: "ANU", lat: -1.3939, lng: 36.7599, county: "Kajiado" },
];

const RADIUS_OPTIONS = [
  { value: 1, label: "1 km" },
  { value: 2, label: "2 km" },
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "All Kenya" },
];

interface LocationSelectorProps {
  onLocationSelect: (location: { campus: typeof CAMPUSES[0]; radius: number; coords?: { lat: number; lng: number }; discoveryMode: string }) => void;
  currentCampus?: string;
  compact?: boolean;
  customTrigger?: React.ReactNode;
}

export function LocationSelector({ onLocationSelect, currentCampus, compact = false, customTrigger }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filters = useAppStore(state => state.filters);
  const [selectedCampus, setSelectedCampus] = useState<any>(
    CAMPUSES.find(c => c.name === currentCampus) || 
    (currentCampus && currentCampus !== "JKUAT Main Campus" ? { id: 'custom', name: currentCampus, university: "Custom Location", lat: filters.coords?.lat || 0, lng: filters.coords?.lng || 0, county: "" } : CAMPUSES[0])
  );
  const nearbyRadiusKm = useAppStore(state => state.nearbyRadiusKm);
  const [radius, setRadius] = useState(nearbyRadiusKm || 5);
  const [discoveryMode, setDiscoveryMode] = useState(filters.discoveryMode || "all");
  const [showMap, setShowMap] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [nominatimResults, setNominatimResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&countrycodes=ke`);
          const data = await res.json();
          setNominatimResults(data.map((d: any) => ({
            id: Date.now() + Math.random(),
            name: d.name || d.display_name.split(',')[0],
            university: "Custom Location",
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
            county: d.display_name.split(',').slice(-2).join(',').trim()
          })));
        } catch(e) {}
        setIsSearching(false);
      } else {
        setNominatimResults([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredCampuses = CAMPUSES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.university.toLowerCase().includes(search.toLowerCase()) ||
    c.county.toLowerCase().includes(search.toLowerCase())
  );

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        
        let name = "Current Location";
        let county = "";
        try {
           const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
           const data = await res.json();
           if (data && data.display_name) {
             name = data.name || data.display_name.split(',')[0];
             county = data.display_name.split(',').slice(-2).join(',').trim();
           }
        } catch(e) {}
        
        const detectedCampus = { id: Date.now(), name, university: "Custom", lat: latitude, lng: longitude, county };
        setSelectedCampus(detectedCampus);
        setDetectingLocation(false);
        toast.success("Location detected successfully!");
        handleSelect(detectedCampus, { lat: latitude, lng: longitude });
      },
      (error) => {
        setDetectingLocation(false);
        console.error("Geolocation error:", error);
        toast.info("Falling back to Nairobi. Location permissions may be blocked.");
        const fallbackCampus = { id: Date.now(), name: "Nairobi CBD", university: "Custom", lat: -1.2921, lng: 36.8219, county: "Nairobi" };
        setSelectedCampus(fallbackCampus);
        handleSelect(fallbackCampus, { lat: -1.2921, lng: 36.8219 });
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  const handleSelect = (campus: typeof CAMPUSES[0], overrideCoords?: { lat: number; lng: number }) => {
    setSelectedCampus(campus);
    const finalCoords = overrideCoords || userCoords || { lat: campus.lat, lng: campus.lng };
    onLocationSelect({ campus, radius, coords: finalCoords, discoveryMode });
    setIsOpen(false);
  };



  // Compact trigger button
  if (compact) {
    return (
      <>
        {customTrigger ? (
          <div onClick={() => setIsOpen(true)} className="cursor-pointer inline-block w-fit">
            {customTrigger}
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-dark hover:border-swap-green transition-colors"
          >
            <MapPin size={14} className="text-swap-green" />
            <span className="max-w-[100px] truncate">{selectedCampus?.name.split(" ")[0] || "Location"}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>
        )}
        {/* Render portal for modal to avoid z-index issues */}
        {typeof document !== 'undefined' && document.body && createPortal(
          <LocationModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            search={search}
            setSearch={setSearch}
            filteredCampuses={filteredCampuses}
            selectedCampus={selectedCampus}
            handleSelect={handleSelect}
            radius={radius}
            setRadius={setRadius}
            showMap={showMap}
            setShowMap={setShowMap}
            detectLocation={detectLocation}
            detectingLocation={detectingLocation}
            nominatimResults={nominatimResults}
            isSearching={isSearching}
            discoveryMode={discoveryMode}
            setDiscoveryMode={setDiscoveryMode}
          />,
          document.body
        )}
      </>
    );
  }

  return (
    <>
      {customTrigger ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer inline-block w-fit">
          {customTrigger}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md text-left hover:border-swap-green transition-colors"
        >
          <MapPin size={18} className="text-swap-green shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark truncate">{selectedCampus?.name || "Select campus"}</p>
            <p className="text-xs text-gray-500">Within {radius} km</p>
          </div>
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        </button>
      )}
      {typeof document !== 'undefined' && document.body && createPortal(
        <LocationModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          search={search}
          setSearch={setSearch}
          filteredCampuses={filteredCampuses}
          selectedCampus={selectedCampus}
          handleSelect={handleSelect}
          radius={radius}
          setRadius={setRadius}
          showMap={showMap}
          setShowMap={setShowMap}
          detectLocation={detectLocation}
          detectingLocation={detectingLocation}
          nominatimResults={nominatimResults}
          isSearching={isSearching}
          discoveryMode={discoveryMode}
          setDiscoveryMode={setDiscoveryMode}
        />,
        document.body
      )}
    </>
  );
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  setSearch: (s: string) => void;
  filteredCampuses: typeof CAMPUSES;
  selectedCampus: typeof CAMPUSES[0] | null;
  handleSelect: (campus: typeof CAMPUSES[0]) => void;
  radius: number;
  setRadius: (r: number) => void;
  showMap: boolean;
  setShowMap: (s: boolean) => void;
  detectLocation: () => void;
  detectingLocation: boolean;
  nominatimResults: any[];
  isSearching: boolean;
  discoveryMode: string;
  setDiscoveryMode: (m: any) => void;
}

function LocationModal({
  isOpen, onClose, search, setSearch, filteredCampuses, selectedCampus,
  handleSelect, radius, setRadius, showMap, setShowMap, detectLocation,
  detectingLocation, nominatimResults, isSearching, discoveryMode, setDiscoveryMode
}: LocationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[480px] max-h-[90vh] bg-white/85 backdrop-blur-[40px] rounded-t-[40px] overflow-hidden flex flex-col shadow-[0_-20px_80px_rgba(0,0,0,0.15)] border-t border-white/60"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300, mass: 0.8 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-5 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-slate-300/50" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between">
              <h3 className="text-[26px] font-black text-slate-900 tracking-tight">Location</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 pb-4 flex-shrink-0">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search campus, university..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/60 backdrop-blur-md rounded-[20px] border border-white/80 text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                />
              </div>
            </div>

            {/* Detect location button */}
            <div className="px-6 pb-4 flex-shrink-0">
              <button
                onClick={detectLocation}
                disabled={detectingLocation}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-[20px] bg-gradient-to-r from-emerald-50/80 to-green-50/80 border border-emerald-100/50 hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all group disabled:opacity-70 disabled:hover:scale-100 backdrop-blur-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-[14px] bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Navigation size={18} className={detectingLocation ? "animate-spin" : ""} strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px] font-bold text-emerald-950 tracking-tight">
                    {detectingLocation ? "Detecting location..." : "Use current location"}
                  </span>
                </div>
                <ChevronRight size={18} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Toggle: List / Map */}
            <div className="px-6 pb-4 flex-shrink-0">
              <div className="flex p-1 bg-slate-200/50 backdrop-blur-md rounded-full border border-white/20 shadow-inner">
                <button
                  onClick={() => setShowMap(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${!showMap ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <MapPin size={14} /> List
                </button>
                <button
                  onClick={() => setShowMap(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${showMap ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <MapPin size={14} className="rotate-180" /> Map
                </button>
              </div>
            </div>

            {/* Discovery Mode selector */}
            <div className="px-0 flex-shrink-0 mb-2">
              <div className="flex gap-1 overflow-x-auto pb-2 px-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex bg-slate-200/40 p-1 rounded-full backdrop-blur-md shadow-inner border border-white/20">
                  {[
                    { value: "campus", label: "Campus" },
                    { value: "university", label: "University" },
                    { value: "nearby", label: "Nearby" },
                    { value: "county", label: "County" },
                    { value: "community", label: "Community" },
                    { value: "all", label: "All Kenya" }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDiscoveryMode(opt.value)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 ${
                        discoveryMode === opt.value
                          ? "bg-white text-slate-900 shadow-sm"
                          : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Radius selector */}
            {discoveryMode === "nearby" && (
              <div className="px-0 flex-shrink-0 bg-white/40 backdrop-blur-md py-3 border-y border-white/30 shadow-sm">
                <div className="flex gap-2 overflow-x-auto px-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {RADIUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setRadius(opt.value)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border ${
                        radius === opt.value
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20"
                          : "bg-white/60 text-slate-600 border-white hover:bg-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
              {showMap ? (
                <div className="h-[400px] rounded-[32px] overflow-hidden border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] relative z-0">
                  <MapContainer 
                    center={selectedCampus ? [selectedCampus.lat, selectedCampus.lng] : [-1.0887, 37.0122]} 
                    zoom={12} 
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                  >
                    <ChangeView center={selectedCampus ? [selectedCampus.lat, selectedCampus.lng] : [-1.0887, 37.0122]} zoom={12} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {CAMPUSES.map(campus => (
                      <Marker 
                        key={campus.id} 
                        position={[campus.lat, campus.lng]}
                        eventHandlers={{ click: () => handleSelect(campus) }}
                      >
                        <Popup>
                          <div className="text-center font-bold text-xs">{campus.name}</div>
                        </Popup>
                      </Marker>
                    ))}
                    
                    {selectedCampus && (
                      <Circle 
                        center={[selectedCampus.lat, selectedCampus.lng]}
                        pathOptions={{ fillColor: '#10B981', fillOpacity: 0.15, color: '#10B981', weight: 2 }}
                        radius={radius * 1000}
                      />
                    )}
                  </MapContainer>
                </div>
              ) : (
                <div className="space-y-2">
                  {isSearching && <p className="text-center text-sm font-semibold text-slate-400 py-6">Searching...</p>}
                  {[...filteredCampuses, ...nominatimResults].map(campus => (
                    <motion.button
                      key={campus.id}
                      onClick={() => handleSelect(campus)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[24px] text-left transition-all ${
                        selectedCampus?.id === campus.id
                          ? "bg-white/80 border border-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.1)]"
                          : "bg-transparent border border-transparent hover:bg-white/50 hover:border-white"
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center shrink-0 transition-colors ${
                        selectedCampus?.id === campus.id ? "bg-emerald-500 shadow-md shadow-emerald-500/20 text-white" : "bg-white text-slate-400 shadow-sm border border-slate-100"
                      }`}>
                        <MapPin size={18} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[15px] font-bold truncate ${selectedCampus?.id === campus.id ? "text-emerald-950" : "text-slate-900"}`}>{campus.name}</p>
                        <p className={`text-[12px] font-medium truncate mt-0.5 ${selectedCampus?.id === campus.id ? "text-emerald-700/80" : "text-slate-500"}`}>
                          {campus.university} • {campus.county}
                        </p>
                      </div>
                      {selectedCampus?.id === campus.id && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </motion.button>
                  ))}
                  {[...filteredCampuses, ...nominatimResults].length === 0 && !isSearching && (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                        <MapPin size={24} className="text-slate-300" />
                      </div>
                      <p className="text-[15px] font-bold text-slate-900">No locations found</p>
                      <p className="text-[13px] text-slate-500 mt-1">Try searching for a different campus or county</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { CAMPUSES, RADIUS_OPTIONS };
