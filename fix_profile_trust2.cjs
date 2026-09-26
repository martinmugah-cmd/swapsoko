const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');

if (!code.includes('import { TrustEngine }')) {
    code = code.replace("import { trpc } from '@/lib/trpc';", "import { trpc } from '@/lib/trpc';\nimport { TrustEngine } from '@/lib/engines/TrustEngine';");
}

const searchBlock = `  const completedSwaps = profile?.completedSwaps ?? 0;
  let trustScore = 75;
  if (isStudentVerified) trustScore += 10;
  if (completedSwaps > 0) trustScore += 5;
  if (profile?.avatarUrl) trustScore += 5;
  
  const acceptanceRate = profile?.acceptanceRate ?? 0;
  const avgResponseMinutes = profile?.avgResponseTimeMinutes ?? 0;
  const avgResponseTime = avgResponseMinutes < 60 ? \`< \${Math.max(avgResponseMinutes, 1)} min\` : \`< \${Math.ceil(avgResponseMinutes / 60)} hr\`;`;

const replaceBlock = `  const rawStats = {
    completedSwaps: profile?.completedSwaps ?? 0,
    acceptanceRate: profile?.acceptanceRate ?? 0,
    avgResponseTime: (profile?.avgResponseTimeMinutes ?? 30) + 'm'
  };
  
  const mockEvents = TrustEngine.generateMockEvents(rawStats);
  const verifications = { 
    isStudentVerified: !!isStudentVerified, 
    isEmailVerified: true, 
    isPhoneVerified: true 
  };
  const trustData = TrustEngine.calculate(mockEvents, verifications, isMe ? 10 : 150);
  
  const completedSwaps = trustData.metrics.completedSwaps;
  const acceptanceRate = trustData.metrics.acceptanceRate;
  const avgResponseTime = trustData.responseTimeLabel;
  const trustScore = trustData.trustScore;
  const badges = trustData.badges;
  const trustConfidence = trustData.trustConfidence;`;

if (code.includes(searchBlock)) {
    code = code.replace(searchBlock, replaceBlock);
    
    // Add Risk and Confidence UI
    const scoreSearch = `<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Trust Score</span>`;
    const scoreReplace = `<div className="w-full flex justify-between items-end mb-0.5 px-1">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trust</span>
               <span className="text-[8px] font-bold text-emerald-500 uppercase">{trustConfidence}</span>
            </div>`;
    code = code.replace(scoreSearch, scoreReplace);
    
    fs.writeFileSync('client/src/pages/Profile.tsx', code);
    console.log("Profile updated with TrustEngine v2!");
} else {
    console.log("Failed to find replacement block");
}
