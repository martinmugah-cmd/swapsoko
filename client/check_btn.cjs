const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('function SwapAgreementModal'));
const btnLine = lines.findIndex((l, i) => i > start && l.includes('Sign & Finalize Swap'));
console.log(lines.slice(btnLine - 10, btnLine + 10).join('\n'));
