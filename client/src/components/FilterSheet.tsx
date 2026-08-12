import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useAppStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Filter, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      cashTopUpAllowed: false,
      noCashNeeded: false,
      multiWayAvailable: false,
    });
  };

  const activeCount = [
    (filters.categories || []).filter(c => c !== 'All').length > 0,
    (filters.wantedCategories || []).filter(c => c !== 'All').length > 0,
    (filters.conditions || []).filter(c => c !== 'Any').length > 0,
    filters.maxDistanceKm,
    filters.minEsv !== null,
    filters.maxEsv !== null,
    filters.cashTopUpAllowed,
    (filters as any).noCashNeeded,
    (filters as any).multiWayAvailable,
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] max-w-md mx-auto inset-x-0 bottom-0 rounded-t-[32px] px-0 pb-0 gap-0 flex flex-col bg-white/80 backdrop-blur-xl border-t border-white/50 shadow-[0_-12px_40px_rgba(0,0,0,0.12)]">
        <SheetHeader className="px-6 py-5 border-b border-gray-200/50 bg-transparent z-10 sticky top-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-extrabold flex items-center gap-2 m-0 text-slate-900">
              <Filter className="w-5 h-5 text-green-500" /> Filters {activeCount > 0 && <span className="bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center leading-none shadow-sm">{activeCount}</span>}
            </SheetTitle>
            <button onClick={clearAll} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">Clear All</button>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6 pb-32">
            {/* Group 1: General (Category & Looking For) */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
               <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60">
                 <span className="text-[15px] font-medium text-slate-900">Category</span>
                 <Select value={filters.categories?.[0] || 'All'} onValueChange={val => setFilters({ /* @ts-ignore */ categories: [val] })}>
                   <SelectTrigger className="w-[160px] h-9 bg-slate-100/50 border-slate-200 text-slate-700 font-medium rounded-lg">
                     <SelectValue placeholder="All Categories" />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl">
                     <SelectItem value="All">All Categories</SelectItem>
                     <SelectItem value="Electronics">Electronics</SelectItem>
                     <SelectItem value="Phones">Phones</SelectItem>
                     <SelectItem value="Laptops">Laptops</SelectItem>
                     <SelectItem value="Gaming">Gaming</SelectItem>
                     <SelectItem value="Books">Books</SelectItem>
                     <SelectItem value="Furniture">Furniture</SelectItem>
                     <SelectItem value="Fashion">Fashion</SelectItem>
                     <SelectItem value="Sports">Sports</SelectItem>
                     <SelectItem value="Music">Music</SelectItem>
                     <SelectItem value="Photography">Photography</SelectItem>
                     <SelectItem value="Vehicles">Vehicles</SelectItem>
                     <SelectItem value="Services">Services</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="flex items-center justify-between px-4 py-3">
                 <span className="text-[15px] font-medium text-slate-900">Looking For</span>
                 <Select value={filters.wantedCategories?.[0] || 'All'} onValueChange={val => setFilters({ /* @ts-ignore */ wantedCategories: [val] })}>
                   <SelectTrigger className="w-[160px] h-9 bg-slate-100/50 border-slate-200 text-slate-700 font-medium rounded-lg">
                     <SelectValue placeholder="Any Category" />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl">
                     <SelectItem value="All">Any Category</SelectItem>
                     <SelectItem value="Electronics">Electronics</SelectItem>
                     <SelectItem value="Phones">Phones</SelectItem>
                     <SelectItem value="Laptops">Laptops</SelectItem>
                     <SelectItem value="Gaming">Gaming</SelectItem>
                     <SelectItem value="Books">Books</SelectItem>
                     <SelectItem value="Furniture">Furniture</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </div>

            {/* Group 2: Specifics (Distance & Condition) */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
               <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60">
                 <span className="text-[15px] font-medium text-slate-900">Distance</span>
                 <Select value={filters.maxDistanceKm || 'Anywhere'} onValueChange={val => setFilters({ /* @ts-ignore */ maxDistanceKm: val })}>
                   <SelectTrigger className="w-[160px] h-9 bg-slate-100/50 border-slate-200 text-slate-700 font-medium rounded-lg">
                     <SelectValue placeholder="Anywhere" />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl">
                     <SelectItem value="1">&lt; 1 km</SelectItem>
                     <SelectItem value="3">&lt; 3 km</SelectItem>
                     <SelectItem value="5">&lt; 5 km</SelectItem>
                     <SelectItem value="10">&lt; 10 km</SelectItem>
                     <SelectItem value="25">&lt; 25 km</SelectItem>
                     <SelectItem value="Anywhere">Anywhere</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="flex items-center justify-between px-4 py-3">
                 <span className="text-[15px] font-medium text-slate-900">Condition</span>
                 <Select value={filters.conditions?.[0] || 'Any'} onValueChange={val => setFilters({ /* @ts-ignore */ conditions: [val] })}>
                   <SelectTrigger className="w-[160px] h-9 bg-slate-100/50 border-slate-200 text-slate-700 font-medium rounded-lg">
                     <SelectValue placeholder="Any Condition" />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl">
                     <SelectItem value="Any">Any Condition</SelectItem>
                     <SelectItem value="new">Brand New</SelectItem>
                     <SelectItem value="like_new">Like New</SelectItem>
                     <SelectItem value="excellent">Excellent</SelectItem>
                     <SelectItem value="good">Good</SelectItem>
                     <SelectItem value="fair">Fair</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </div>

            {/* Group 3: Estimated Swap Value (ESV) */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm p-4">
                <span className="text-[15px] font-medium text-slate-900 block mb-3">Estimated Value (KES)</span>
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200/80 flex items-center shadow-inner">
                        <input 
                            type="number" 
                            placeholder="Min" 
                            value={filters.minEsv || ""}
                            onChange={e => setFilters({ /* @ts-ignore */ minEsv: e.target.value ? parseInt(e.target.value) : null })}
                            className="bg-transparent w-full outline-none text-[15px] font-medium text-slate-900 placeholder:text-slate-400 text-center"
                        />
                    </div>
                    <span className="text-slate-300 font-bold">-</span>
                    <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200/80 flex items-center shadow-inner">
                        <input 
                            type="number" 
                            placeholder="Max" 
                            value={filters.maxEsv || ""}
                            onChange={e => setFilters({ /* @ts-ignore */ maxEsv: e.target.value ? parseInt(e.target.value) : null })}
                            className="bg-transparent w-full outline-none text-[15px] font-medium text-slate-900 placeholder:text-slate-400 text-center"
                        />
                    </div>
                </div>
            </div>

            {/* Group 4: Preferences Toggles */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
                <label className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/60 cursor-pointer active:bg-slate-50 transition-colors">
                    <span className="text-[15px] font-medium text-slate-900">Accepts Cash Top-up</span>
                    <div className={`w-[51px] h-[31px] rounded-full transition-colors relative shadow-inner ${filters.cashTopUpAllowed ? 'bg-green-500' : 'bg-slate-200'}`}>
                        <input type="checkbox" className="sr-only" checked={!!filters.cashTopUpAllowed} onChange={e => setFilters({ cashTopUpAllowed: e.target.checked })} />
                        <div className={`w-[27px] h-[27px] bg-white rounded-full absolute top-[2px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform ${filters.cashTopUpAllowed ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                    </div>
                </label>
                
                <label className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/60 cursor-pointer active:bg-slate-50 transition-colors">
                    <span className="text-[15px] font-medium text-slate-900">Pure Barter Only</span>
                    <div className={`w-[51px] h-[31px] rounded-full transition-colors relative shadow-inner ${(filters as any).noCashNeeded ? 'bg-green-500' : 'bg-slate-200'}`}>
                        <input type="checkbox" className="sr-only" checked={!!(filters as any).noCashNeeded} onChange={e => setFilters({ /* @ts-ignore */ noCashNeeded: e.target.checked })} />
                        <div className={`w-[27px] h-[27px] bg-white rounded-full absolute top-[2px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform ${(filters as any).noCashNeeded ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                    </div>
                </label>

                <label className="flex items-center justify-between px-4 py-3.5 cursor-pointer active:bg-slate-50 transition-colors">
                    <span className="text-[15px] font-medium text-slate-900">Multi-Way Swaps</span>
                    <div className={`w-[51px] h-[31px] rounded-full transition-colors relative shadow-inner ${(filters as any).multiWayAvailable ? 'bg-green-500' : 'bg-slate-200'}`}>
                        <input type="checkbox" className="sr-only" checked={!!(filters as any).multiWayAvailable} onChange={e => setFilters({ /* @ts-ignore */ multiWayAvailable: e.target.checked })} />
                        <div className={`w-[27px] h-[27px] bg-white rounded-full absolute top-[2px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform ${(filters as any).multiWayAvailable ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                    </div>
                </label>
            </div>
          </div>
        </div>
        
        <SheetFooter className="p-4 bg-transparent border-t border-gray-200/30 sm:rounded-bl-[32px] z-10 sticky bottom-0 backdrop-blur-xl">
           <SheetClose asChild>
             <button className="w-full bg-slate-900 hover:bg-black text-white font-extrabold text-[15px] py-4 rounded-2xl shadow-lg transition-transform active:scale-95">
               Show Results
             </button>
           </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
