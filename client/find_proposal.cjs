const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes('"proposal"')) {
       console.log("Found proposal type at line", i);
       console.log(lines.slice(i - 3, i + 3).join('\n'));
   }
}
