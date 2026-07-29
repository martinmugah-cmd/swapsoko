const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// In the chat header:
// <button onClick={() => setAgreementState({ isOpen: true, listingId: room.listingId })} className="...">
// Let's find this button and ensure it only renders if the user is NOT the owner of the listing!
// Wait, we need to know the listing's owner id.
// The `room` object has `listing_id`, but does it have `listing.user_id`?
// Let's check how `room` is queried.
// Let's find where setAgreementState({ isOpen: true, listingId: room.listingId }) is.
const match = code.match(/<button onClick=\{\(\) => setAgreementState\(\{ isOpen: true, listingId: room\.listingId \}\)\}/g);
console.log(match);
