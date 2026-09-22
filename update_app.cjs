const fs = require('fs');
let code = fs.readFileSync('client/src/App.tsx', 'utf8');

// Replace the hugeicons-react import with our doodle-icons
const hugeIconImport = `import { Home01Icon, Copy01Icon, Store01Icon, Comment01Icon, UserIcon } from "hugeicons-react";`;
const doodleIconImport = `import { HomeDoodleIcon, CopyDoodleIcon, ShopDoodleIcon, MessageDoodleIcon, UserDoodleIcon } from "./lib/doodle-icons";`;
code = code.replace(hugeIconImport, doodleIconImport);

// Replace the array of tabs to use the doodle icons
code = code.replace(/icon: Home01Icon/g, 'icon: HomeDoodleIcon');
code = code.replace(/icon: Copy01Icon/g, 'icon: CopyDoodleIcon');
code = code.replace(/icon: Store01Icon/g, 'icon: ShopDoodleIcon');
code = code.replace(/icon: Comment01Icon/g, 'icon: MessageDoodleIcon');
code = code.replace(/icon: UserIcon/g, 'icon: UserDoodleIcon');

fs.writeFileSync('client/src/App.tsx', code);
console.log('App.tsx updated!');
