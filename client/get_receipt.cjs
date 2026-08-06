const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

const clickLine = lines.findIndex(l => l.includes('onReceiptClick={'));
if (clickLine !== -1) {
    console.log(lines.slice(clickLine - 2, clickLine + 5).join('\n'));
}
