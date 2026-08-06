const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// 1. Revert line 280 to false so the seller SENDS the agreement form.
code = code.replace(
    /onOpenAgreement\?\.\(pData\.listingId, msg\.id, true, pData\)/g,
    `onOpenAgreement?.(pData.listingId, msg.id, false, pData)`
);

// 2. Remove the textarea logic and replace with automatic text.
code = code.replace(
    /\{isReview \? \([\s\S]*?\)\s*:\s*\([\s\S]*?\textarea[\s\S]*?\)\}/,
    `<div>
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 block">Full Agreement Details</label>
                <div className="bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3 text-[14px] font-semibold text-[#0F172A]">
                   {initialData?.itemsExchanged || (initialData?.offerItems ? \`\${initialData.offerItems} for \${listingQuery.data?.title || autoItemsExchanged}\` : autoItemsExchanged)}
                </div>
             </div>`
);

// 3. We also need to fix the submit button condition that checks if `itemsExchanged.trim()` is empty.
// Since we removed the textarea, we just use the generated string for itemsExchanged if it's empty!
code = code.replace(
    /if \(!isReview && !itemsExchanged\.trim\(\)\) \{ toast\.error\("Please enter what you are offering"\); return; \}/,
    `if (!isReview) {
                  let finalItems = itemsExchanged.trim();
                  if (!finalItems) finalItems = initialData?.offerItems ? \`\${initialData.offerItems} for \${listingQuery.data?.title || autoItemsExchanged}\` : autoItemsExchanged;
                  onSend({ itemsExchanged: finalItems, cashTopUp, meetupPlace, timeWindow, conditionNotes, listingId });
                  return;
              }`
);

// 4. Remove the `onSend(...)` that was outside the if (!isReview) block?
// Wait, the original button onClick logic:
/*
onClick={() => {
              if (isReview && initialData && onFinalize) {
                 onFinalize(initialData);
                 return;
              }
              if (!isReview && !itemsExchanged.trim()) { toast.error("Please enter what you are offering"); return; }
              onSend({ itemsExchanged, cashTopUp, meetupPlace, timeWindow, conditionNotes, listingId });
            }}
*/
// The regex replace above handles `if (!isReview) { ... return; }`. But then the original `onSend` is still below it!
// It's safer to just replace the whole onClick logic for the button.

fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Replaced!");
