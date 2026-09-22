const fs = require('fs');

let chat = fs.readFileSync('client/src/pages/Chat.tsx', 'utf8');

chat = chat.replace(
  '       <div onClick={async () => {\n              if (isSubmitting) return;\n              setIsSubmitting(true);\n           const words = input.split(\' \');',
  '       <div onClick={async () => {\n           const words = input.split(\' \');'
);

fs.writeFileSync('client/src/pages/Chat.tsx', chat);
console.log('Fixed MentionOption');
