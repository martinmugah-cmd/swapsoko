const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes('function SwapAgreementModal'));
console.log(lines.slice(startIndex, startIndex + 80).join('\n'));
