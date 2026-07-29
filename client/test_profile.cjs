const fs = require('fs');
const code = fs.readFileSync('src/lib/trpc.ts', 'utf8');
const meMatch = code.match(/if \(path\[0\] === 'profile' && path\[1\] === 'me'\) \{[\s\S]*?return camelData\?\.\[0\] \|\| \{ trustScore: 0 \};/);
if (meMatch) console.log(meMatch[0]);
