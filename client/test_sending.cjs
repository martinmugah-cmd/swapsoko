const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

const sendingLines = lines.filter(l => l.toLowerCase().includes('sending proposal'));
console.log(sendingLines);
