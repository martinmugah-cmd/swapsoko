const fs = require('fs');
const code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');
console.log(code.match(/function SwapAgreementModal\([\s\S]+?return \(/)[0]);
