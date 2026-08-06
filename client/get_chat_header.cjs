const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

const headerLine = lines.findIndex(l => l.includes('Swap Tag'));
if (headerLine !== -1) {
    console.log(lines.slice(headerLine - 10, headerLine + 10).join('\n'));
}
