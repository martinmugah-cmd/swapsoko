const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

const offerInput = `
          {isReview ? (
             <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Full Agreement Details</label>
                <div className="bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3 text-[14px] font-semibold text-[#0F172A]">
                   {initialData?.itemsExchanged || autoItemsExchanged}
                </div>
             </div>
          ) : (
             <div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Your Offer (What you are giving)</label>
                <textarea
                  value={itemsExchanged}
                  onChange={e => setItemsExchanged(e.target.value)}
                  placeholder="e.g. My Laptop, 2 Books, etc."
                  rows={2}
                  className="w-full bg-gray-50 border border-transparent rounded-[16px] px-4 py-3 text-[14px] font-semibold text-[#0F172A] outline-none focus:bg-white focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10 transition-all resize-none placeholder:font-medium placeholder:text-gray-400"
                />
             </div>
          )}
`;

code = code.replace(
    /\{\/\* Hidden itemsExchanged field to keep the rest of the code working \*\/\}\s*<input type="hidden" value=\{autoItemsExchanged\} \/>/,
    offerInput
);

code = code.replace(
    /if \(\!autoItemsExchanged\) \{ toast\.error\("Please enter items exchanged"\); return; \}/g,
    `if (!isReview && !itemsExchanged.trim()) { toast.error("Please enter what you are offering"); return; }`
);

code = code.replace(
    /itemsExchanged: autoItemsExchanged/g,
    `itemsExchanged: isReview ? (initialData?.itemsExchanged || autoItemsExchanged) : \`\${itemsExchanged} for \${autoItemsExchanged}\``
);


fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Added offer input");
