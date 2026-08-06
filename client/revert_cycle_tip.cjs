const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// Wrap the inline receipt safety tip
code = code.replace(
    /<div className="pt-3">\s*<div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">\s*<span className="text-blue-500 text-sm mt-0\.5">💡<\/span>[\s\S]*?<\/div>\s*<\/div>/,
    `{rData.type !== 'cycle' && (
                            <div className="pt-3">
                               <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
                                  <span className="text-blue-500 text-sm mt-0.5">💡</span>
                                  <div>
                                     <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-0.5">Safety Tip</p>
                                     <p className="text-[11px] font-medium text-blue-800 leading-tight">
                                        {(() => {
                                           const tips = [
                                              "Take a screenshot of this receipt for your records before meeting.",
                                              "Always meet in a well-lit, public place like a mall or cafe.",
                                              "Inspect the item thoroughly before handing over your swap.",
                                              "Never go to a secluded area for a swap."
                                           ];
                                           return tips[rData.timestamp % tips.length] || tips[0];
                                        })()}
                                     </p>
                                  </div>
                               </div>
                            </div>
                            )}`
);

// Wrap the fullscreen receipt safety tip
code = code.replace(
    /<div className="mt-4">\s*<div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">\s*<span className="text-blue-500 text-lg mt-0\.5">💡<\/span>[\s\S]*?<\/div>\s*<\/div>/,
    `{fullscreenReceipt.type !== 'cycle' && (
                  <div className="mt-4">
                     <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                        <span className="text-blue-500 text-lg mt-0.5">💡</span>
                        <div>
                           <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest mb-1">Safety Tip</p>
                           <p className="text-[13px] font-medium text-blue-800 leading-relaxed">
                              {(() => {
                                 const tips = [
                                    "Take a screenshot of this receipt for your records before meeting.",
                                    "Always meet in a well-lit, public place like a mall or cafe.",
                                    "Inspect the item thoroughly before handing over your swap.",
                                    "Never go to a secluded area for a swap."
                                 ];
                                 return tips[fullscreenReceipt.timestamp % tips.length] || tips[0];
                              })()}
                           </p>
                        </div>
                     </div>
                  </div>
                  )}`
);

fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Wrapped safety tip in cycle checks!");
