const fs = require('fs');
let code = fs.readFileSync('src/lib/trpc.ts', 'utf8');

code = code.replace(
    /listingId: variables\.listingId,\s*listingTitle,\s*listingImage,\s*wishId: variables\.wishId,\s*message: variables\.message \|\| "",\s*cashTopUp: variables\.cashTopUp \|\| 0,/,
    `listingId: variables.listingId,
                       listingTitle,
                       listingImage,
                       wishId: variables.wishId,
                       message: variables.message || "",
                       cashTopUp: variables.cashTopUp || 0,
                       offerItems: variables.offerItems || "",`
);

// Also we need to make sure updateProposalMutation retains offerItems if we update it.
// updateProposal is just updating status, right?
// Wait, if it's a counter offer...

fs.writeFileSync('src/lib/trpc.ts', code);
console.log("Updated trpc.ts");
