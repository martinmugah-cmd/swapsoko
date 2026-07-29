const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

const agreeLine = lines.findIndex(l => l.includes('cleanContent.startsWith("[AGREEMENT]")'));
console.log("Agreement logic:", agreeLine);
// How does the buyer see [AGREEMENT]?
// We need to find msg.type === "text" and see if it renders an "Accept Agreement" button.
