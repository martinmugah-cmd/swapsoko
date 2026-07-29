const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

const propLine = lines.findIndex(l => l.includes('Swap Offer'));
console.log(lines.slice(propLine - 5, propLine + 20).join('\n'));
