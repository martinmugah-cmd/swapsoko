const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// The issue is that the code manually prefixes @ to {partnerName}, but if partnerName itself already starts with @, it doubles up.
// Or we just remove the hardcoded @ before {partnerName} inside SwapAgreementModal.

// Fix 1: The green pill
code = code.replace(
    /\{partnerAvatar \? <img src=\{partnerAvatar\} className="w-3\.5 h-3\.5 rounded-full object-cover" \/> : <div className="w-3\.5 h-3\.5 rounded-full bg-\[#22C55E\] text-white flex items-center justify-center text-\[8px\]">\{partnerName\.charAt\(0\)\.toUpperCase\(\)\}<\/div>\}\s*@\{partnerName\}/,
    `{partnerAvatar ? <img src={partnerAvatar} className="w-3.5 h-3.5 rounded-full object-cover" /> : <div className="w-3.5 h-3.5 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-[8px]">{partnerName.replace('@', '').charAt(0).toUpperCase()}</div>}
        {partnerName.startsWith('@') ? partnerName : '@' + partnerName}`
);

// Fix 2: "Lock in terms with @{partnerName} before meeting."
code = code.replace(
    /Lock in terms with <span className="font-bold text-\[#0F172A\]">@\{partnerName\}<\/span> before meeting\./,
    `Lock in terms with <span className="font-bold text-[#0F172A]">{partnerName.startsWith('@') ? partnerName : '@' + partnerName}</span> before meeting.`
);

fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Fixed double @");
