const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

code = code.replace(/if \(!itemsExchanged\) \{ toast\.error\("Please enter items exchanged"\); return; \}/g, 
`if (!autoItemsExchanged) { toast.error("Please enter items exchanged"); return; }`);

fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Fixed validation again");
