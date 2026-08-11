import { useAppStore } from "@/store";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Search, X, ChevronDown, Check } from "lucide-react";
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
}

export function LocationSelector({ onLocationSelect, currentCampus, compact = false }: LocationSelectorProps) {
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
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-dark hover:border-swap-green transition-colors"
        >
          <MapPin size={14} className="text-swap-green" />
          <span className="max-w-[100px] truncate">{selectedCampus?.name.split(" ")[0] || "Location"}</span>
          <ChevronDown size={12} className="text-gray-400" />
        </button>
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
        />
      </>
    );
  }

  return (
    <>
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
      />
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
            className="relative w-full max-w-[480px] max-h-[90vh] bg-white rounded-t-[32px] overflow-hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Select Location</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Detect location button */}
            <div className="px-6 pb-4 flex-shrink-0">
              <button
                onClick={detectLocation}
                disabled={detectingLocation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-bold text-[15px] hover:bg-[#DCFCE7] hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                <Navigation size={18} className={detectingLocation ? "animate-spin" : ""} />
                {detectingLocation ? "Detecting your location..." : "Use my current location"}
              </button>
            </div>

            {/* Search */}
            <div className="px-6 pb-4 flex-shrink-0">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search campus, university, or county..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-transparent text-[15px] font-medium text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-[#22C55E]/10 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Toggle: List / Map */}
            <div className="px-6 pb-5 flex-shrink-0">
              <div className="flex p-1 bg-gray-100/80 rounded-2xl border border-gray-200/50">
                <button
                  onClick={() => setShowMap(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[14px] font-bold transition-all duration-200 ${!showMap ? "bg-white text-slate-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <MapPin size={16} /> List View
                </button>
                <button
                  onClick={() => setShowMap(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[14px] font-bold transition-all duration-200 ${showMap ? "bg-white text-slate-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <MapPin size={16} className="rotate-180" /> Map View
                </button>
              </div>
            </div>

            {/* Discovery Mode selector */}
            <div className="px-6 pb-3 flex-shrink-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2.5">Discovery Mode</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "campus", label: "My Campus" },
                  { value: "university", label: "My University" },
                  { value: "nearby", label: "Nearby" },
                  { value: "county", label: "County" },
                  { value: "community", label: "Community" },
                  { value: "all", label: "All Kenya" }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDiscoveryMode(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                      discoveryMode === opt.value
                        ? "bg-green-500 text-white shadow-md shadow-[#22C55E]/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Radius selector */}
            {discoveryMode === "nearby" && (
              <div className="px-4 pb-3 flex-shrink-0">
                <p className="text-xs font-medium text-gray-500 mb-2">SEARCH RADIUS</p>
                <div className="flex gap-2 flex-wrap">
                  {RADIUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setRadius(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        radius === opt.value
                          ? "bg-swap-green text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {showMap ? (
                <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200 relative z-0">
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
                        pathOptions={{ fillColor: '#22C55E', fillOpacity: 0.1, color: '#22C55E', weight: 1 }}
                        radius={radius * 1000}
                      />
                    )}
                  </MapContainer>
                </div>
              ) : (
                <div className="space-y-1">
                  {isSearching && <p className="text-center text-xs text-gray-400 py-4">Searching map...</p>}
                  {[...filteredCampuses, ...nominatimResults].map(campus => (
                    <motion.button
                      key={campus.id}
                      onClick={() => handleSelect(campus)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-colors ${
                        selectedCampus?.id === campus.id
                          ? "bg-swap-green/10 border border-swap-green/20"
                          : "hover:bg-gray-50"
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedCampus?.id === campus.id ? "bg-swap-green" : "bg-gray-100"
                      }`}>
                        <MapPin size={14} className={selectedCampus?.id === campus.id ? "text-white" : "text-gray-500"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark truncate">{campus.name}</p>
                        <p className="text-xs text-gray-500">{campus.university} • {campus.county}</p>
                      </div>
                      {selectedCampus?.id === campus.id && (
                        <Check size={16} className="text-swap-green shrink-0" />
                      )}
                    </motion.button>
                  ))}
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
