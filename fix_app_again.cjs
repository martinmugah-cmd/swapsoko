const fs = require('fs');
let code = fs.readFileSync('client/src/App.tsx', 'utf8');

// Remove the doodle-icons import
code = code.replace(/import \{ HomeDoodleIcon, CopyDoodleIcon, ShopDoodleIcon, MessageDoodleIcon, UserDoodleIcon \} from "\.\/lib\/doodle-icons";\n?/, '');

// The standard imports from @/lib/icons already have Home, MessageCircle, User.
// We need to make sure we have Copy (or similar for swipes), and Store (for post).
code = code.replace(/import \{ Home, MessageCircle, Plus, Repeat2, User, Bell, Shield \} from "@\/lib\/icons";/, 'import { Home, MessageCircle, Plus, Repeat2, User, Bell, Shield, Copy, Store } from "@/lib/icons";');

// Wait, Store might not be exported from icons.tsx. Let's export it if it's not.
