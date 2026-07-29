const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('onSend={async (data) => {'));
console.log(lines.slice(start, start + 25).join('\n'));
