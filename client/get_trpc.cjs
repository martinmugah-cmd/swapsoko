const fs = require('fs');
const lines = fs.readFileSync('src/lib/trpc.ts', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('listings:') && !l.includes('query('));
console.log("Start", start);
