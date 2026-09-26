const fs = require('fs');
let code = fs.readFileSync('client/src/components/layout/Navbar.tsx', 'utf8');

if (!code.includes('/multiswap')) {
    const search = `{ path: '/profile', icon: User, label: 'Profile' }`;
    const replace = `{ path: '/multiswap', icon: Shuffle, label: 'MultiSwap' },\n    { path: '/profile', icon: User, label: 'Profile' }`;
    
    code = code.replace(search, replace);
    fs.writeFileSync('client/src/components/layout/Navbar.tsx', code);
    console.log("Navbar updated with multiswap!");
}
