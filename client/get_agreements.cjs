const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

const finalizeLine = lines.findIndex(l => l.includes('onFinalize={'));
if (finalizeLine !== -1) {
    console.log(lines.slice(finalizeLine - 5, finalizeLine + 20).join('\n'));
}

