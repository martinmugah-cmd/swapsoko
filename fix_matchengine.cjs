const fs = require('fs');
let code = fs.readFileSync('client/src/lib/engines/MatchEngine.ts', 'utf8');

if (!code.includes('import { TrustEngine }')) {
    code = code.replace("export const MatchEngine", "import { TrustEngine } from './TrustEngine';\n\nexport const MatchEngine");
}

const search = `  calculateTrustScore(target: any): number {
     let score = 50; // Base score for new users
     if (target.profiles?.isStudentVerified) score += 20;
     if (target.profiles?.verifiedIdentity) score += 20;
     
     const completed = target.profiles?.swapsCompleted || 0;
     if (completed > 10) score += 30;
     else if (completed > 2) score += 15;

     return Math.min(100, score);
  }`;

const replace = `  calculateTrustScore(target: any): number {
     // Run the target through the Trust Engine (Event-driven calculation)
     const rawStats = {
         completedSwaps: target.profiles?.swapsCompleted || 0,
         acceptanceRate: target.profiles?.acceptanceRate || 80,
         avgResponseTime: (target.profiles?.avgResponseTimeMinutes || 30) + 'm'
     };
     const mockEvents = TrustEngine.generateMockEvents(rawStats);
     const verifications = {
         isStudentVerified: !!target.profiles?.isStudentVerified,
         isEmailVerified: true,
         isPhoneVerified: !!target.profiles?.verifiedIdentity
     };
     const trustData = TrustEngine.calculate(mockEvents, verifications, 60);
     return trustData.trustScore;
  }`;

code = code.replace(search, replace);
fs.writeFileSync('client/src/lib/engines/MatchEngine.ts', code);
console.log("MatchEngine updated to use TrustEngine v2");
