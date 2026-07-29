const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// Update onFinalize inside ChatRoom (around line 1121)
code = code.replace(
    /handleSend\("\[RECEIPT\]" \+ JSON\.stringify\(\{\.\.\.data, timestamp: Date\.now\(\), partnerName\}\), "text"\);/g,
    `handleSend("[RECEIPT]" + JSON.stringify({...data, listingImage: agreementState.data?.listingImage, timestamp: Date.now(), partnerName}), "text");`
);

// Update RECEIPT rendering inside ChatBubble (around line 495)
code = code.replace(
    /<div className="pb-3 border-b border-gray-200 border-dashed">\s*<span className="text-\[10px\] font-bold text-gray-400 uppercase tracking-wider block mb-1">Items Included<\/span>\s*<p className="text-xs font-bold text-gray-800 leading-snug">\{rData\.type === 'cycle' \? \`Multi-way Swap Cycle\` : rData\.itemsExchanged\}<\/p>\s*\{rData\.cashTopUp && <p className="text-\[10px\] font-bold text-\[\#22C55E\] mt-1">\+ KES \{rData\.cashTopUp\}<\/p>\}\s*<\/div>/g,
    `<div className="pb-3 border-b border-gray-200 border-dashed">
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Items Included</span>
                               {rData.type !== 'cycle' && rData.listingImage && (
                                  <div className="mb-2 w-full h-24 rounded-lg overflow-hidden border border-gray-100">
                                     <img src={rData.listingImage} className="w-full h-full object-cover" />
                                  </div>
                               )}
                               <p className="text-xs font-bold text-gray-800 leading-snug">{rData.type === 'cycle' ? \`Multi-way Swap Cycle\` : rData.itemsExchanged}</p>
                               {rData.cashTopUp && <p className="text-[10px] font-bold text-[#22C55E] mt-1">+ KES {rData.cashTopUp}</p>}
                            </div>`
);

fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Fixed receipt rendering!");
