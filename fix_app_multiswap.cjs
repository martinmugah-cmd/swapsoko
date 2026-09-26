const fs = require('fs');
let code = fs.readFileSync('client/src/App.tsx', 'utf8');

// 1. Import MultiSwap
if (!code.includes('MultiSwap from')) {
    code = code.replace("import Profile from './pages/Profile';", "import Profile from './pages/Profile';\nimport MultiSwap from './pages/MultiSwap';");
}

// 2. Add Route
const search = `<Route path="/profile" element={<Profile />} />`;
const replace = `<Route path="/profile" element={<Profile />} />\n            <Route path="/multiswap" element={<MultiSwap />} />`;

code = code.replace(search, replace);

fs.writeFileSync('client/src/App.tsx', code);
console.log("App.tsx updated with multiswap!");
