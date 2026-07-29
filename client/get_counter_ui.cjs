const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

const propLine = lines.findIndex(l => l.includes('{pData.message || "No message attached"}'));
console.log(lines.slice(propLine - 5, propLine + 5).join('\n'));
