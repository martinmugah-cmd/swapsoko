const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');

// Import TrustEngine
if (!code.includes('import { TrustEngine }')) {
    code = code.replace("import { trpc } from '@/lib/trpc';", "import { trpc } from '@/lib/trpc';\nimport { TrustEngine } from '@/lib/engines/TrustEngine';");
}

// Update variables using TrustEngine
const searchBlock = `const stats = {
    completedSwaps: isMe ? 5 : 24,
    acceptanceRate: isMe ? 85 : 94,
    avgResponseTime: isMe ? '4h' : '18 min'
  };`;
  
const replaceBlock = `const rawStats = {
    completedSwaps: isMe ? 5 : 24,
    acceptanceRate: isMe ? 85 : 94,
    avgResponseTime: isMe ? '4h' : '18m'
  };
  
  const mockEvents = TrustEngine.generateMockEvents(rawStats);
  const verifications = { isStudentVerified: true, isEmailVerified: true, isPhoneVerified: true };
  const trustData = TrustEngine.calculate(mockEvents, verifications, isMe ? 10 : 150);
  
  const completedSwaps = trustData.metrics.completedSwaps;
  const acceptanceRate = trustData.metrics.acceptanceRate;
  const avgResponseTime = trustData.responseTimeLabel;
  const trustScore = trustData.trustScore;
  const riskScore = trustData.riskScore;
  const badges = trustData.badges;
  const trustConfidence = trustData.trustConfidence;
`;

if (code.includes(searchBlock)) {
    code = code.replace(searchBlock, replaceBlock);
    
    // Remove old hardcoded stuff
    code = code.replace("const completedSwaps = isMe ? 5 : 24;", "");
    code = code.replace("const acceptanceRate = isMe ? 85 : 94;", "");
    code = code.replace("const avgResponseTime = isMe ? '4h' : '18 min';", "");
    code = code.replace("const trustScore = isMe ? 78 : 91;", "");
    code = code.replace('const badges = isMe ? ["VERIFIED_STUDENT", "NEW_TRADER"] : ["VERIFIED_STUDENT", "FAST_RESPONDER", "RELIABLE_TRADER"];', "");

    // Add Risk and Confidence UI
    const scoreSearch = `<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Trust Score</span>`;
    const scoreReplace = `<div className="w-full flex justify-between items-end mb-0.5">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trust</span>
               <span className="text-[8px] font-bold text-emerald-500 uppercase">{trustConfidence}</span>
            </div>`;
    code = code.replace(scoreSearch, scoreReplace);
    
    fs.writeFileSync('client/src/pages/Profile.tsx', code);
    console.log("Profile updated with TrustEngine Chapter 11!");
} else {
    console.log("Profile stats block not found. Trying fallback...");
    // fallback replacing
}
