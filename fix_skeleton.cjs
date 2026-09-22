const fs = require('fs');

let swipes = fs.readFileSync('client/src/pages/Swipes.tsx', 'utf8');

const oldSkeleton = `<div className="absolute inset-0 bg-slate-900 rounded-[36px] p-6 flex flex-col justify-end pointer-events-none overflow-hidden animate-pulse">
                
                <div className="h-8 bg-white/20 rounded-full w-2/3 mb-3"></div>
                <div className="h-4 bg-white/20 rounded-full w-full mb-2"></div>
                <div className="h-4 bg-white/20 rounded-full w-4/5 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-8 w-20 bg-white/20 rounded-full"></div>
                  <div className="h-8 w-24 bg-white/20 rounded-full"></div>
                </div>
                <div className="mt-auto pt-3 border-t border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white/20"></div>
                    <div className="space-y-1.5">
                      <div className="w-20 h-3 bg-white/20 rounded-full"></div>
                      <div className="w-12 h-2.5 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/20"></div>
                    <div className="w-10 h-10 rounded-full bg-white/20"></div>
                  </div>
                </div>
              </div>`;

const newSkeleton = `<div className="absolute inset-0 bg-white rounded-3xl flex flex-col pointer-events-none overflow-hidden animate-pulse shadow-sm border border-gray-100">
                <div className="relative h-[60%] bg-slate-200">
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                     <div className="w-3/4 h-6 bg-slate-300 rounded-full"></div>
                     <div className="w-1/3 h-4 bg-slate-300 rounded-full"></div>
                  </div>
                </div>
                <div className="p-4 h-[40%] flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-4 bg-slate-200 rounded-full mb-3"></div>
                    <div className="w-full h-4 bg-slate-200 rounded-full mb-2"></div>
                    <div className="w-4/5 h-4 bg-slate-200 rounded-full mb-3"></div>
                    <div className="w-24 h-6 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200"></div>
                      <div className="space-y-1.5">
                        <div className="w-20 h-3 bg-slate-200 rounded-full"></div>
                        <div className="w-16 h-2.5 bg-slate-200 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                      <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                    </div>
                  </div>
                </div>
              </div>`;

swipes = swipes.replace(oldSkeleton, newSkeleton);
fs.writeFileSync('client/src/pages/Swipes.tsx', swipes);
console.log('Fixed Swipes.tsx skeleton');
