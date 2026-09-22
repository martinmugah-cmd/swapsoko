const fs = require('fs');
const path = require('path');

const basePath = 'client/public/doodle_icons/doodle icons/SVG';
const icons = {
  HomeDoodleIcon: path.join(basePath, 'interface', 'home.svg'),
  CopyDoodleIcon: path.join(basePath, 'interface', 'copy.svg'),
  ShopDoodleIcon: path.join(basePath, 'e-commerce', 'shop.svg'),
  MessageDoodleIcon: path.join(basePath, 'interface', 'message.svg'),
  UserDoodleIcon: path.join(basePath, 'interface', 'user.svg'),
};

let output = `import React from 'react';\n\n`;

for (const [name, filePath] of Object.entries(icons)) {
  let svg = fs.readFileSync(filePath, 'utf8');
  // replace <svg ...> with <svg {...props} ...>
  svg = svg.replace(/<svg([^>]+)>/, '<svg$1 {...props}>');
  // replace fill="black" with fill="currentColor"
  svg = svg.replace(/fill="black"/g, 'fill="currentColor"');
  // Convert standard SVG attributes to React camelCase
  svg = svg.replace(/clip-path/g, 'clipPath');
  svg = svg.replace(/fill-rule/g, 'fillRule');
  svg = svg.replace(/stroke-width/g, 'strokeWidth');
  svg = svg.replace(/stroke-linecap/g, 'strokeLinecap');
  svg = svg.replace(/stroke-linejoin/g, 'strokeLinejoin');
  // We can just keep going or rely on a simple string replace for now. 
  
  output += `export const ${name} = (props: React.SVGProps<SVGSVGElement>) => (\n  ${svg}\n);\n\n`;
}

fs.writeFileSync('client/src/lib/doodle-icons.tsx', output);
console.log('Done!');
