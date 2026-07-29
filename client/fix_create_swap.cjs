const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// Hide the "Create Swap Agreement" button if the user is the creator of the listing!
// Wait, in ChatBubble, where the context header is rendered:
// the listing is passed as `listing` inside `renderMessageContent`? No, the context header is rendered at the top of the chat?
// Let's find line 442.
const match = code.match(/\{listing\.status \!\=\= 'finalized' && \(/);
if (match) {
    console.log("Found match!");
    code = code.replace(
        /\{listing\.status \!\=\= 'finalized' && \(/,
        `{listing.status !== 'finalized' && currentUserId !== listing.user_id && (`
    );
    fs.writeFileSync('src/pages/Chat.tsx', code);
    console.log("Replaced!");
}

