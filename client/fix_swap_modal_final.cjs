const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// 1. Revert line 280 to isReview = false so the seller sends the agreement!
code = code.replace(
    /onOpenAgreement\?\.\(pData\.listingId, msg\.id, true, pData\)/g,
    `onOpenAgreement?.(pData.listingId, msg.id, false, pData)`
);

// 2. Remove the textarea from SwapAgreementModal.
// We need to find the textarea.
const textareaRegex = /<textarea[^>]*value=\{itemsExchanged\}[^>]*onChange=\{\(e\) => setItemsExchanged\(e\.target\.value\)\}[^>]*><\/textarea>/g;
// Wait, the textarea might not be exactly that. Let's find it carefully.

