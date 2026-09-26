const fs = require('fs');
let code = fs.readFileSync('client/src/App.tsx', 'utf8');

if (!code.includes('NotificationProvider')) {
    code = code.replace("import MultiSwap from './pages/MultiSwap';", "import MultiSwap from './pages/MultiSwap';\nimport { NotificationProvider } from './contexts/NotificationContext';");
    code = code.replace("<TooltipProvider>", "<TooltipProvider>\n            <NotificationProvider>");
    code = code.replace("</TooltipProvider>", "            </NotificationProvider>\n          </TooltipProvider>");
    
    fs.writeFileSync('client/src/App.tsx', code);
    console.log("App.tsx updated with NotificationProvider");
}
