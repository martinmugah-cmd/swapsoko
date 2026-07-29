const fs = require('fs');
const code = fs.readFileSync('src/pages/Home.tsx', 'utf8');
if (code.includes('createProposal') || code.includes('proposals.send')) {
    console.log("Found proposal logic in Home.tsx");
} else {
    console.log("No proposal logic in Home.tsx");
}
