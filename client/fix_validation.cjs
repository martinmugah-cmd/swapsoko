const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// Fix the validation in SwapAgreementModal
code = code.replace(/if \(!itemsExchanged\.trim\(\)\) \{[\s\S]*?toast\.error\("Please enter items exchanged"\);[\s\S]*?return;[\s\S]*?\}/g, 
`if (!autoItemsExchanged.trim()) { toast.error("Please enter items exchanged"); return; }`);

fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Validation fixed");
