const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

const match = code.match(/function SwapAgreementModal\(\{[\s\S]+?\}\) \{/);
if (match) console.log(match[0]);

