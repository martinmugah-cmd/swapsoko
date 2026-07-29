const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

code = code.replace(
    /<span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Items Included<\/span>\s*<p className="text-sm font-bold text-gray-800 leading-snug">\{fullscreenReceipt\.type === 'cycle' \? \`Multi-way Swap Cycle Completed\` : fullscreenReceipt\.itemsExchanged\}<\/p>\s*\{fullscreenReceipt\.cashTopUp && <p className="text-xs font-bold text-\[\#22C55E\] mt-1">\+ KES \{fullscreenReceipt\.cashTopUp\}<\/p>\}/g,
    `<span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Items Included</span>
                     {fullscreenReceipt.type !== 'cycle' && fullscreenReceipt.listingImage && (
                        <div className="mb-3 w-full h-32 rounded-xl overflow-hidden border border-gray-100">
                           <img src={fullscreenReceipt.listingImage} className="w-full h-full object-cover" />
                        </div>
                     )}
                     <p className="text-sm font-bold text-gray-800 leading-snug">{fullscreenReceipt.type === 'cycle' ? \`Multi-way Swap Cycle Completed\` : fullscreenReceipt.itemsExchanged}</p>
                     {fullscreenReceipt.cashTopUp && <p className="text-xs font-bold text-[#22C55E] mt-1">+ KES {fullscreenReceipt.cashTopUp}</p>}`
);

fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Fixed fullscreen receipt!");
