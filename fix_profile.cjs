const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');

// We need to insert TrustEngine import
if (!code.includes('TrustEngine')) {
    code = code.replace("import { trpc } from '@/lib/trpc';", "import { trpc } from '@/lib/trpc';\nimport { TrustEngine } from '@/lib/engines/TrustEngine';");
}

// Find the line where we define stats
const statSearch = `  const completedSwaps = profile?.completedSwaps ?? 0;
  const acceptanceRate = profile?.acceptanceRate ?? 0;
  const avgResponseTime = profile?.avgResponseTime ?? 'N/A';`;

const replacement = `  // Trust Engine integration
  const verifications = {
    isStudentVerified: profile?.isStudentVerified ?? false,
    isEmailVerified: profile?.verifiedIdentity ?? false,
    isPhoneVerified: false,
  };
  const events = TrustEngine.generateMockEvents({
    completedSwaps: profile?.completedSwaps,
    acceptanceRate: profile?.acceptanceRate,
    avgResponseTime: profile?.avgResponseTime
  });
  const trustResult = TrustEngine.calculateTrust(events, verifications);

  const completedSwaps = trustResult.metrics.completedSwaps;
  const acceptanceRate = trustResult.metrics.acceptanceRate;
  const avgResponseTime = trustResult.responseTimeLabel;
  const completionRate = trustResult.metrics.completionRate;
  const trustScore = trustResult.score;
  const badges = trustResult.badges;
`;

code = code.replace(statSearch, replacement);


// Update the UI to show the Trust Score and dynamic badges
const uiSearch = `          </div>
        </div>
      </div>

      {/* Stats */}`;

const uiReplacement = `          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
             {badges.map(b => (
                 <span key={b} className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-sm border border-white/10">
                    <CheckCircle2 className="w-3 h-3" /> {b.replace('_', ' ')}
                 </span>
             ))}
          </div>
          
        </div>
        
        {/* Trust Score Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-white/40 flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Trust Score</span>
            <div className="flex items-baseline gap-1">
               <span className="text-2xl font-black text-slate-800 leading-none">{trustScore}</span>
               <span className="text-xs font-bold text-slate-400">/100</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: \`\${trustScore}%\` }} />
            </div>
        </div>

      </div>

      {/* Stats */}`;

code = code.replace(uiSearch, uiReplacement);

// Update stats card for response time
const statCardSearch = `<StatCard icon={<Clock className="w-4 h-4" />} label={"Response Time"} value={avgResponseTime} color="#F59E0B" />`;
const statCardReplacement = `<StatCard icon={<Clock className="w-4 h-4" />} label={"Response Time"} value={avgResponseTime} color="#F59E0B" isText={true} />`;
code = code.replace(statCardSearch, statCardReplacement);

fs.writeFileSync('client/src/pages/Profile.tsx', code);
console.log("Profile updated!");
