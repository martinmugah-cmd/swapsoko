const fs = require('fs');
let code = fs.readFileSync('client/src/lib/icons.tsx', 'utf8');

if (!code.includes('export const Copy')) {
  code += `export const Copy = ({ size, className, ...props }: any) => { return <DocumentDuplicateIcon className={className} style={{ width: size || 24, height: size || 24 }} {...props} />; };\n`;
}
if (!code.includes('export const Store')) {
  code += `export const Store = ({ size, className, ...props }: any) => { return <BuildingStorefrontIcon className={className} style={{ width: size || 24, height: size || 24 }} {...props} />; };\n`;
}

// Add imports for these
code = code.replace(/import \{ (.*) \} from '@heroicons\/react\/24\/outline';/, "import { $1, DocumentDuplicateIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';");

fs.writeFileSync('client/src/lib/icons.tsx', code);
console.log('icons.tsx extra exports added');
