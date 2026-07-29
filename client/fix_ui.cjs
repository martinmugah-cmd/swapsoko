const fs = require('fs');
let code = fs.readFileSync('src/pages/Onboarding.tsx', 'utf8');

// Fix buttons to use gradient-green instead of bg-gray-900
code = code.replace(/bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-\[0_8px_30px_rgb\(0,0,0,0\.12\)\] hover:bg-gray-800/g, 'gradient-green text-white font-bold py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-lg');

// Fix progress bar segments back to green
code = code.replace(/i === step \? "bg-gray-900" : "bg-gray-200"/g, 'i === step ? "bg-green-400" : "bg-gray-200"');

// Fix background blobs (one of them was gray-900/10 by mistake, should be green-500/10)
code = code.replace(/bg-gray-900\/10 blur-\[100px\]/g, 'bg-green-500/10 blur-[100px]');

// Fix the AnimatePresence trail issue
// Remove AnimatePresence wrappers for the interests mapping
code = code.replace(/<AnimatePresence>\s*\{unselectedInterests\.map/g, '{unselectedInterests.map');
code = code.replace(/<\/AnimatePresence>\s*<\/div>\s*\/\* Stacked Deck at the bottom \*\//g, '</div>\n\n              {/* Stacked Deck at the bottom */}');

code = code.replace(/<AnimatePresence>\s*\{selectedInterestObjs\.map/g, '{selectedInterestObjs.map');
code = code.replace(/<\/AnimatePresence>\s*\{selectedInterests\.length === 0/g, '{selectedInterests.length === 0');

fs.writeFileSync('src/pages/Onboarding.tsx', code);
