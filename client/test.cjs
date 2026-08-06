const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
console.log(code.split('\n').filter((l, i) => i > 1780 && i < 1820).join('\n'));
