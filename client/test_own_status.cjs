const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

const line = lines.findIndex(l => l.includes('Sending Proposal...'));
if (line !== -1) {
   console.log(lines.slice(line - 5, line + 5).join('\n'));
}
