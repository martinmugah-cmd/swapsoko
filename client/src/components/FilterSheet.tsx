import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useAppStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Filter, ChevronRight } from "@/lib/icons";
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
      <SheetContent side="bottom" className="h-[90vh] max-w-md mx-auto inset-x-0 bottom-0 rounded-t-[32px] px-0 pb-0 gap-0 flex flex-col bg-[#F3F4F6] border-t border-white/50 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] [&>button.absolute]:hidden">
        <SheetHeader className="px-6 py-5 border-b-0 bg-transparent z-10 sticky top-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-[20px] font-extrabold flex items-center gap-2 m-0 text-slate-900 tracking-tight">
              <Filter className="w-5 h-5 text-emerald-500" /> Filters
              {activeCount > 0 && <span className="bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm ml-1">{activeCount}</span>}
            </SheetTitle>
            <button onClick={clearAll} className="text-[14px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Clear All</button>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <div className="space-y-5 pb-32">
            
            {/* Group 1: General (Category & Looking For) */}
            <div className="bg-white rounded-3xl border border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
               <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100/80">
                 <span className="text-[15px] font-semibold text-slate-800">Category</span>
                 <Select value={filters.categories?.[0] || 'All'} onValueChange={val => setFilters({ /* @ts-ignore */ categories: [val] })}>
                   <SelectTrigger className="w-[150px] h-9 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl text-[13px] shadow-sm">
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

               <div className="flex items-center justify-between px-5 py-4">
                 <span className="text-[15px] font-semibold text-slate-800">Looking For</span>
                 <Select value={filters.wantedCategories?.[0] || 'All'} onValueChange={val => setFilters({ /* @ts-ignore */ wantedCategories: [val] })}>
                   <SelectTrigger className="w-[150px] h-9 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl text-[13px] shadow-sm">
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
            <div className="bg-white rounded-3xl border border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
               <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100/80">
                 <span className="text-[15px] font-semibold text-slate-800">Distance</span>
                 <Select value={filters.maxDistanceKm || 'Anywhere'} onValueChange={val => setFilters({ /* @ts-ignore */ maxDistanceKm: val })}>
                   <SelectTrigger className="w-[150px] h-9 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl text-[13px] shadow-sm">
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

               <div className="flex items-center justify-between px-5 py-4">
                 <span className="text-[15px] font-semibold text-slate-800">Condition</span>
                 <Select value={filters.conditions?.[0] || 'Any'} onValueChange={val => setFilters({ /* @ts-ignore */ conditions: [val] })}>
                   <SelectTrigger className="w-[150px] h-9 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl text-[13px] shadow-sm">
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
            <div className="bg-white rounded-3xl border border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5">
                <span className="text-[15px] font-semibold text-slate-800 block mb-4">Estimated Value (KES)</span>
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#F8FAFC] rounded-[14px] px-3 py-2.5 border border-slate-100 flex items-center">
                        <input 
                            type="number" 
                            placeholder="Min" 
                            value={filters.minEsv || ""}
                            onChange={e => setFilters({ /* @ts-ignore */ minEsv: e.target.value ? parseInt(e.target.value) : null })}
                            className="bg-transparent w-full outline-none text-[14px] font-medium text-slate-800 placeholder:text-slate-400 text-center"
                        />
                    </div>
                    <span className="text-slate-300 font-bold">-</span>
                    <div className="flex-1 bg-[#F8FAFC] rounded-[14px] px-3 py-2.5 border border-slate-100 flex items-center">
                        <input 
                            type="number" 
                            placeholder="Max" 
                            value={filters.maxEsv || ""}
                            onChange={e => setFilters({ /* @ts-ignore */ maxEsv: e.target.value ? parseInt(e.target.value) : null })}
                            className="bg-transparent w-full outline-none text-[14px] font-medium text-slate-800 placeholder:text-slate-400 text-center"
                        />
                    </div>
                </div>
            </div>

            {/* Group 4: Preferences Toggles */}
            <div className="bg-white rounded-3xl border border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                <label className="flex items-center justify-between px-5 py-4 border-b border-slate-100/80 cursor-pointer active:bg-slate-50 transition-colors">
                    <span className="text-[15px] font-semibold text-slate-800">Accepts Cash Top-up</span>
                    <div className={`w-[52px] h-[32px] rounded-full transition-colors relative shadow-inner ${filters.cashTopUpAllowed ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`}>
                        <input type="checkbox" className="sr-only" checked={!!filters.cashTopUpAllowed} onChange={e => setFilters({ cashTopUpAllowed: e.target.checked })} />
                        <div className={`w-[28px] h-[28px] bg-white rounded-full absolute top-[2px] shadow-md transition-transform ${filters.cashTopUpAllowed ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                    </div>
                </label>
                
                <label className="flex items-center justify-between px-5 py-4 border-b border-slate-100/80 cursor-pointer active:bg-slate-50 transition-colors">
                    <span className="text-[15px] font-semibold text-slate-800">Pure Barter Only</span>
                    <div className={`w-[52px] h-[32px] rounded-full transition-colors relative shadow-inner ${(filters as any).noCashNeeded ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`}>
                        <input type="checkbox" className="sr-only" checked={!!(filters as any).noCashNeeded} onChange={e => setFilters({ /* @ts-ignore */ noCashNeeded: e.target.checked })} />
                        <div className={`w-[28px] h-[28px] bg-white rounded-full absolute top-[2px] shadow-md transition-transform ${(filters as any).noCashNeeded ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                    </div>
                </label>

                <label className="flex items-center justify-between px-5 py-4 cursor-pointer active:bg-slate-50 transition-colors">
                    <span className="text-[15px] font-semibold text-slate-800">Multi-Way Swaps</span>
                    <div className={`w-[52px] h-[32px] rounded-full transition-colors relative shadow-inner ${(filters as any).multiWayAvailable ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`}>
                        <input type="checkbox" className="sr-only" checked={!!(filters as any).multiWayAvailable} onChange={e => setFilters({ /* @ts-ignore */ multiWayAvailable: e.target.checked })} />
                        <div className={`w-[28px] h-[28px] bg-white rounded-full absolute top-[2px] shadow-md transition-transform ${(filters as any).multiWayAvailable ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                    </div>
                </label>
            </div>
          </div>
        </div>
        
        <SheetFooter className="p-4 bg-transparent sm:rounded-bl-[32px] z-10 sticky bottom-0">
           <SheetClose asChild>
             <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[15px] py-4 rounded-full shadow-[0_8px_20px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 transition-all active:scale-95">
               Show Results
             </button>
           </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
