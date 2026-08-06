const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

code = code.replace(
    /if \(!isReview\) \{\s+let finalItems = itemsExchanged\.trim\(\);\s+if \(!finalItems\) finalItems = initialData\?\.offerItems \? \`\$\{initialData\.offerItems\} for \$\{listingQuery\.data\?\.title \|\| autoItemsExchanged\}\` : autoItemsExchanged;\s+onSend\(\{ itemsExchanged: finalItems, cashTopUp, meetupPlace, timeWindow, conditionNotes, listingId \}\);\s+return;\s+\}/g,
    `if (!isReview) {
                  let finalItems = itemsExchanged.trim();
                  if (!finalItems) finalItems = initialData?.offerItems ? \`\${initialData.offerItems} for \${listingQuery.data?.title || autoItemsExchanged}\` : autoItemsExchanged;
                  onSend({ itemsExchanged: finalItems, cashTopUp, meetupPlace, timeWindow, conditionNotes, listingId });
                  toast.success("Agreement sent for review!");
                  onClose();
                  return;
              }`
);

fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Fixed!");
