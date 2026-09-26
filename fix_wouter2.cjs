const fs = require('fs');
let code = fs.readFileSync('client/src/pages/MultiSwap.tsx', 'utf8');

code = code.replace("import { Link } from 'react-router-dom';", "import { Link } from 'wouter';");

fs.writeFileSync('client/src/pages/MultiSwap.tsx', code);
console.log("Fixed wouter import in MultiSwap.tsx");
