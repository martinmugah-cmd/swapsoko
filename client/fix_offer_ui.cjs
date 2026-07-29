const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

code = code.replace(
    /<p className="text-xs text-gray-600 mb-2">\{pData\.message \|\| "No message attached"\}<\/p>\s*\{pData\.cashTopUp > 0 && \(\s*<p className="text-xs font-bold text-\[\#0F172A\] mb-2">\+ KES \{pData\.cashTopUp\}<\/p>\s*\)\}/g,
    `<p className="text-xs text-gray-600 mb-2">{pData.message || "No message attached"}</p>
                {pData.offerItems && (
                  <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Offered Items</span>
                    <p className="text-xs font-bold text-gray-800">{pData.offerItems}</p>
                  </div>
                )}
                {pData.cashTopUp > 0 && (
                  <p className="text-xs font-bold text-[#22C55E] mb-2">+ KES {pData.cashTopUp}</p>
                )}`
);

fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Fixed offer UI!");
