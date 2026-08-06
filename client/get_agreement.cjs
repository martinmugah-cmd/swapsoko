const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

const agreeLine = lines.findIndex(l => l.includes('msg.content.startsWith("[AGREEMENT]")'));
if (agreeLine !== -1) {
    console.log(lines.slice(agreeLine - 5, agreeLine + 35).join('\n'));
} else {
    const agreeLine2 = lines.findIndex(l => l.includes('cleanContent.startsWith("[AGREEMENT]")'));
    console.log(lines.slice(agreeLine2 - 5, agreeLine2 + 35).join('\n'));
}
