const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

const textLine = lines.findIndex(l => l.includes('msg.type === "text"'));
if (textLine !== -1) {
    console.log(lines.slice(textLine, textLine + 50).join('\n'));
}
