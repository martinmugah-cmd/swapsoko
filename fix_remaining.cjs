const fs = require('fs');

// 1. Fix icons.tsx
let icons = fs.readFileSync('client/src/lib/icons.tsx', 'utf8');
icons = icons.replace(/,\n\s*FallbackIcon/g, '');
fs.writeFileSync('client/src/lib/icons.tsx', icons);

// 2. Fix Chat.tsx
let chat = fs.readFileSync('client/src/pages/Chat.tsx', 'utf8');
// Fix room?.proposalId in ChatBubble (around line 341)
chat = chat.replace('room?.proposalId || \'\'', 'pData.proposalId || \'\'');

// Fix isSubmitting missing declarations in ReviewModal / AiChatModal
// Let's just find where they are used and declare them.
// ReviewModal starts around 2200
chat = chat.replace('const [message, setMessage] = useState("");', 'const [message, setMessage] = useState("");\n  const [isSubmitting, setIsSubmitting] = useState(false);');

// AIChatModal starts around 2450
chat = chat.replace('const [input, setInput] = useState("");', 'const [input, setInput] = useState("");\n  const [isSubmitting, setIsSubmitting] = useState(false);');

fs.writeFileSync('client/src/pages/Chat.tsx', chat);
console.log('Fixed remaining errors');
