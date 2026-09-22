const fs = require('fs');

let content = fs.readFileSync('client/src/lib/icons.tsx', 'utf8');

// Find all export const X = YIcon;
const exportRegex = /export const \w+ = (\w+);/g;
let match;
const usedIcons = new Set();
while ((match = exportRegex.exec(content)) !== null) {
  usedIcons.add(match[1]);
}

// Find the import block
const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]hugeicons-react['"];/;
const importMatch = content.match(importRegex);

if (importMatch) {
  const existingImports = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  const allImports = Array.from(new Set([...existingImports, ...Array.from(usedIcons)])).sort();
  
  content = content.replace(importRegex, `import {\n  ${allImports.join(',\n  ')}\n} from "hugeicons-react";`);
  
  fs.writeFileSync('client/src/lib/icons.tsx', content);
  console.log('Fixed icons.tsx imports!');
}
