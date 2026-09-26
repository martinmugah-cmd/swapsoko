const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Notifications.tsx', 'utf8');

code = code.replace("import { useNavigate } from 'react-router-dom';", "import { useLocation } from 'wouter';");
code = code.replace("const navigate = useNavigate();", "const [, navigate] = useLocation();");
code = code.replace("navigate(-1)", "navigate('/')"); // wouter navigate doesn't support -1 directly in the same way, redirect to home

fs.writeFileSync('client/src/pages/Notifications.tsx', code);
console.log("Fixed wouter import in Notifications.tsx");
