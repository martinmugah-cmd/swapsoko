const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes('rData.type === \'cycle\' ? `Multi-way Swap Cycle` : rData.itemsExchanged'));
console.log(lines.slice(startIndex - 15, startIndex + 15).join('\n'));
