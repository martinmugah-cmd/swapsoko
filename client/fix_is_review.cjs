const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// Fix 1: Change isReview to true when clicking "Accept Offer" on a swap proposal.
code = code.replace(
    /onOpenAgreement\?\.\(pData\.listingId, msg\.id, false, pData\)/g,
    `onOpenAgreement?.(pData.listingId, msg.id, true, pData)`
);

// Fix 2: Ensure the submit button says "Accept Agreement" if isReview is true, instead of "Send Agreement Form"
code = code.replace(
    /<button\s+onClick=\{\(\) => \{\s+if \(!isReview && !itemsExchanged\.trim\(\)\) \{ toast\.error\("Please enter what you are offering"\); return; \}/,
    `<button onClick={() => {
              if (isReview && initialData && onFinalize) {
                 onFinalize(initialData);
                 return;
              }
              if (!isReview && !itemsExchanged.trim()) { toast.error("Please enter what you are offering"); return; }`
);

// Update button text
code = code.replace(
    /Send Agreement Form\s*<\/button>/,
    `{isReview ? "Accept Agreement" : "Send Agreement Form"}
          </button>`
);

fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Fixed isReview");
