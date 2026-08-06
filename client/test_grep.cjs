const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
console.log("File length:", code.length);
const lines = code.split('\n');
const parseLines = lines.filter(l => l.includes('JSON.parse'));
console.log("JSON parse lines:", parseLines.length);

const proposalLine = lines.findIndex(l => l.includes('[PROPOSAL]'));
console.log("proposal:", proposalLine);

const agreementLine = lines.findIndex(l => l.includes('[AGREEMENT'));
console.log("agreement:", agreementLine);

const swapLine = lines.findIndex(l => l.includes('[SWAP'));
console.log("swap:", swapLine);
