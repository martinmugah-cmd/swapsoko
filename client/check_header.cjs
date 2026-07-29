const fs = require('fs');
const code = fs.readFileSync('src/pages/Home.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('<header'));
if (start !== -1) {
    console.log(lines.slice(start, start + 30).join('\n'));
}
