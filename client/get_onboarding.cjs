const fs = require('fs');
const code = fs.readFileSync('src/pages/Onboarding.tsx', 'utf8');
const match = code.match(/await supabase\.from\("profiles"\)\.upsert\(\{([\s\S]+?)\}\);/);
if (match) console.log(match[0]);
