const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// Replace the entire onClick handler for the button
code = code.replace(
    /onClick=\{\(\) => \{\s+if \(isReview && initialData && onFinalize\) \{\s+onFinalize\(initialData\);\s+return;\s+\}\s+if \(!isReview\) \{\s+let finalItems = itemsExchanged\.trim\(\);\s+if \(!finalItems\) finalItems = initialData\?\.offerItems \? \`\$\{initialData\.offerItems\} for \$\{listingQuery\.data\?\.title \|\| autoItemsExchanged\}\` : autoItemsExchanged;\s+onSend\(\{ itemsExchanged: finalItems, cashTopUp, meetupPlace, timeWindow, conditionNotes, listingId \}\);\s+return;\s+\}\s+onSend\(\{ itemsExchanged, cashTopUp, meetupPlace, timeWindow, conditionNotes, listingId \}\);\s+\}\}/g,
    `onClick={() => {
              if (isReview && initialData && onFinalize) {
                 onFinalize(initialData);
                 return;
              }
              let finalItems = itemsExchanged.trim();
              if (!finalItems) finalItems = initialData?.offerItems ? \`\${initialData.offerItems} for \${listingQuery.data?.title || autoItemsExchanged}\` : autoItemsExchanged;
              onSend({ itemsExchanged: finalItems, cashTopUp, meetupPlace, timeWindow, conditionNotes, listingId, offerItems: initialData?.offerItems });
            }}`
);

// We need to make sure the regex matches, let's just use string replace for safety!
