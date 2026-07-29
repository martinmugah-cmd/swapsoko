const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// Find where SWAP_PROPOSAL is created or rendered
const lines = code.split('\n');
const propIndex = lines.findIndex(l => l.includes('[SWAP_PROPOSAL]'));
console.log(lines.slice(Math.max(0, propIndex - 10), propIndex + 50).join('\n'));
