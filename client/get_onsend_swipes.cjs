const fs = require('fs');
const code = fs.readFileSync('src/pages/Swipes.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('onSend(finalMsg,'));
console.log(lines.slice(start - 10, start + 10).join('\n'));
