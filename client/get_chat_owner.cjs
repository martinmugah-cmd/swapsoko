const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

const handshakeLine = lines.findIndex(l => l.includes('<button onClick={() => setAgreementState({ isOpen: true, listingId: room.listingId })}'));
if (handshakeLine !== -1) {
    console.log("Found handshake button around line " + handshakeLine);
}
