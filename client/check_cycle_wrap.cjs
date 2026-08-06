const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes('Safety Tip'));
console.log(lines.slice(startIndex - 5, startIndex + 5).join('\n'));
