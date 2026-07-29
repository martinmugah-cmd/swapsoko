import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useAppStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Filter } from "lucide-react";

export function FilterSheet({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { filters, setFilters } = useAppStore();

  const toggleArrayItem = (key: 'categories' | 'wantedCategories' | 'conditions', value: string) => {
    const current = filters[key] || [];
    if (value === 'All' || value === 'Any') {
      setFilters({ /* @ts-ignore */ [key]: [value] });
      return;
    }
    let next = current.includes(value) ? current.filter(c => c !== value) : [...current, value];
    if (next.includes('All') || next.includes('Any')) {
      next = next.filter(c => c !== 'All' && c !== 'Any');
    }
    if (next.length === 0) next = [key === 'conditions' ? 'Any' : 'All'];
    setFilters({ /* @ts-ignore */ [key]: next });
  };

  const isSelected = (key: 'categories' | 'wantedCategories' | 'conditions', value: string) => {
    return (filters[key] || []).includes(value) || 
           ((filters[key] || []).length === 0 && (value === 'All' || value === 'Any'));
  };

  const clearAll = () => {
    setFilters({ /* @ts-ignore */
      categories: ['All'],
      wantedCategories: ['All'],
      conditions: ['Any'],
      maxDistanceKm: null,
      minEsv: null,
      maxEsv: null,
      verifiedOnly: false,
      cashTopUpAllowed: false,
      noCashNeeded: false,
      directSwapOnly: false,
      multiWayAvailable: false,
      minTrustRating: null,
      minCompletedSwaps: null,
      communityId: null,
    });
  };

  const activeCount = [
    (filters.categories || []).filter(c => c !== 'All').length > 0,
    (filters.wantedCategories || []).filter(c => c !== 'All').length > 0,
    (filters.conditions || []).filter(c => c !== 'Any').length > 0,
    filters.maxDistanceKm,
    filters.minEsv !== null,
    filters.maxEsv !== null,
    filters.verifiedOnly,
    (filters as any).acceptsCashTopUp,
    (filters as any).noCashNeeded,
    (filters as any).directSwapOnly,
    (filters as any).multiWayAvailable,
    (filters as any).minTrustRating,
    (filters as any).minCompletedSwaps,
    (filters as any).communityId
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] max-w-md mx-auto inset-x-0 bottom-0 rounded-t-[32px] px-0 pb-0 gap-0 flex flex-col bg-[#F8FAFC]">
        <SheetHeader className="px-6 py-4 border-b bg-white rounded-t-[32px] z-10 sticky top-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-extrabold flex items-center gap-2 m-0">
              <Filter className="w-5 h-5 text-[#22C55E]" /> Filters {activeCount > 0 && <span className="bg-[#22C55E] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center leading-none">{activeCount}</span>}
            </SheetTitle>
            <button onClick={clearAll} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">Clear All</button>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-8 pb-32">
            {/* Category */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center justify-between">
                Category
              </h3>
              <div className="flex flex-wrap gap-2">
                {["All", "Electronics", "Phones", "Laptops", "Gaming", "Books", "Furniture", "Fashion", "Sports", "Music", "Photography", "Vehicles", "Services"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleArrayItem('categories', cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm border ${
                      isSelected('categories', cat)
                        ? "bg-[#22C55E] text-white border-[#22C55E]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Looking For */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Looking For (Wanted)</h3>
              <p className="text-xs text-gray-500 mb-3 font-medium">Show me people who are looking for:</p>
              <div className="flex flex-wrap gap-2">
                {["All", "Electronics", "Phones", "Laptops", "Gaming", "Books", "Furniture"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleArrayItem('wantedCategories', cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm border ${
                      isSelected('wantedCategories', cat)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Value */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Estimated Swap Value (ESV)</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">KES</span>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={filters.minEsv || ""}
                    onChange={e => setFilters({ /* @ts-ignore */ minEsv: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full bg-white border-gray-200 border rounded-xl py-2 pl-10 pr-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#22C55E] outline-none"
                  />
                </div>
                <span className="text-gray-400 font-bold">-</span>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">KES</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={filters.maxEsv || ""}
                    onChange={e => setFilters({ /* @ts-ignore */ maxEsv: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full bg-white border-gray-200 border rounded-xl py-2 pl-10 pr-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#22C55E] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Distance */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Distance</h3>
              <div className="flex flex-wrap gap-2">
                {["1", "3", "5", "10", "25", "Anywhere"].map(dist => (
                  <button
                    key={dist}
                    onClick={() => setFilters({ /* @ts-ignore */ maxDistanceKm: dist })}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm border ${
                      (filters.maxDistanceKm || "Anywhere") === dist
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {dist === "Anywhere" ? dist : `< ${dist} km`}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Condition</h3>
              <div className="flex flex-wrap gap-2">
                {[{l: "Any", v: "Any"}, {l: "Brand New", v: "new"}, {l: "Like New", v: "like_new"}, {l: "Excellent", v: "excellent"}, {l: "Good", v: "good"}, {l: "Fair", v: "fair"}].map(c => (
                  <button
                    key={c.v}
                    onClick={() => toggleArrayItem('conditions', c.v)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm border ${
                      isSelected('conditions', c.v)
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {c.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Preferences</h3>
              
              <label className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-100 cursor-pointer">
                <div>
                  <p className="font-bold text-[#0F172A] text-sm">Accepts Cash Top-up</p>
                  <p className="text-xs text-gray-500 font-medium">Show items that accept partial cash</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${filters.cashTopUpAllowed ? 'bg-[#22C55E]' : 'bg-gray-200'}`}>
                  <input type="checkbox" className="sr-only" checked={!!filters.cashTopUpAllowed} onChange={e => setFilters({ cashTopUpAllowed: e.target.checked })} />
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${filters.cashTopUpAllowed ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
              </label>

              <label className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-100 cursor-pointer">
                <div>
                  <p className="font-bold text-[#0F172A] text-sm">Pure Barter Only</p>
                  <p className="text-xs text-gray-500 font-medium">Hide all listings requiring cash</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${(filters as any).noCashNeeded ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <input type="checkbox" className="sr-only" checked={!!(filters as any).noCashNeeded} onChange={e => setFilters({ /* @ts-ignore */ noCashNeeded: e.target.checked })} />
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${(filters as any).noCashNeeded ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
              </label>

              <label className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-100 cursor-pointer">
                <div>
                  <p className="font-bold text-[#0F172A] text-sm flex items-center gap-1.5">Verified Users <span className="bg-blue-100 text-blue-600 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">Trusted</span></p>
                  <p className="text-xs text-gray-500 font-medium">Only show verified students/identities</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${filters.verifiedOnly ? 'bg-[#22C55E]' : 'bg-gray-200'}`}>
                  <input type="checkbox" className="sr-only" checked={!!filters.verifiedOnly} onChange={e => setFilters({ /* @ts-ignore */ verifiedOnly: e.target.checked })} />
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${filters.verifiedOnly ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
              </label>
              
              <label className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-100 cursor-pointer">
                <div>
                  <p className="font-bold text-orange-600 text-sm flex items-center gap-1.5">Multi-Way Swaps</p>
                  <p className="text-xs text-orange-400 font-medium">Include indirect trade opportunities</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${(filters as any).multiWayAvailable ? 'bg-orange-500' : 'bg-gray-200'}`}>
                  <input type="checkbox" className="sr-only" checked={!!(filters as any).multiWayAvailable} onChange={e => setFilters({ /* @ts-ignore */ multiWayAvailable: e.target.checked })} />
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${(filters as any).multiWayAvailable ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>
            
            {/* Trust and History */}
            <div>
               <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Reputation</h3>
               <div className="flex gap-4">
                  <div className="flex-1">
                     <p className="text-xs font-bold text-gray-500 mb-2">Min Rating</p>
                     <select 
                       value={(filters as any).minTrustRating || ""} 
                       onChange={e => setFilters({ /* @ts-ignore */ minTrustRating: e.target.value ? parseInt(e.target.value) : null })}
                       className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                     >
                        <option value="">Any Rating</option>
                        <option value="3">3+ Stars</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                     </select>
                  </div>
                  <div className="flex-1">
                     <p className="text-xs font-bold text-gray-500 mb-2">Completed Swaps</p>
                     <select 
                       value={(filters as any).minCompletedSwaps || ""} 
                       onChange={e => setFilters({ /* @ts-ignore */ minCompletedSwaps: e.target.value ? parseInt(e.target.value) : null })}
                       className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                     >
                        <option value="">Any</option>
                        <option value="1">At least 1</option>
                        <option value="5">At least 5</option>
                        <option value="20">20+ Swaps</option>
                     </select>
                  </div>
               </div>
            </div>

          </div>
        </div>
        
        <SheetFooter className="p-4 bg-white border-t sm:rounded-bl-[32px] z-10 sticky bottom-0">
           <SheetClose asChild>
             <button className="w-full bg-[#0F172A] hover:bg-black text-white font-extrabold text-base py-4 rounded-2xl shadow-lg transition-transform active:scale-95">
               Show Results
             </button>
           </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
