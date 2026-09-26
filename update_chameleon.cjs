const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Swipes.tsx', 'utf8');

const s = `function ChameleonScore({ item }: { item: any }) {
  const score = item._matchScore || 0;
  let color = "#EF4444"; // red < 50
  let label = "Weak Match";

  if (score >= 95) {
    color = "#10B981"; // emerald
    label = "Excellent Match";
  } else if (score >= 85) {
    color = "#22C55E"; // green
    label = "Strong Match";
  } else if (score >= 70) {
    color = "#EAB308"; // yellow
    label = "Good Match";
  } else if (score >= 50) {
    color = "#F97316"; // orange
    label = "Possible Match";
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const reasons = item._matchReasons && item._matchReasons.length > 0 
      ? item._matchReasons.join(", ") 
      : "Our algorithm found some similarities based on your preferences.";
    
    toast.custom((t) => (
      <ExpandableMatchToast t={t} color={color} label={label} score={score} reasons={reasons} />
    ), { duration: 8000 });
  };`;

const r = `function ChameleonScore({ item }: { item: any }) {
  const score = item._matchScore || 0;
  const tier = item._matchTier || "WEAK";
  let color = "#EF4444";
  let label = "Poor Match";

  if (tier === "EXCELLENT") {
    color = "#10B981"; label = "Excellent Match";
  } else if (tier === "STRONG") {
    color = "#22C55E"; label = "Strong Match";
  } else if (tier === "POSSIBLE") {
    color = "#EAB308"; label = "Possible Match";
  } else if (tier === "WEAK") {
    color = "#F97316"; label = "Weak Match";
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const reasons = item._matchReasons && item._matchReasons.length > 0 
      ? item._matchReasons.join(", ") 
      : "Our algorithm found some similarities based on your preferences.";
    
    toast.custom((t) => (
      <ExpandableMatchToast 
        t={t} 
        color={color} 
        label={label} 
        score={score} 
        reasons={reasons} 
        confidence={item._matchConfidence}
        breakdown={item._matchBreakdown} 
      />
    ), { duration: 10000 });
  };`;

code = code.replace(s, r);

const s2 = `function ExpandableMatchToast({ t, color, label, score, reasons }: { t: any, color: string, label: string, score: number, reasons: string }) {`;
const r2 = `function ExpandableMatchToast({ t, color, label, score, reasons, confidence, breakdown }: { t: any, color: string, label: string, score: number, reasons: string, confidence?: number, breakdown?: any }) {`;
code = code.replace(s2, r2);

const s3 = `        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[12px] font-bold text-slate-800 uppercase tracking-widest">{label}</span>
        </div>`;
const r3 = `        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[12px] font-bold text-slate-800 uppercase tracking-widest">{label}</span>
          {confidence !== undefined && (
            <span className="text-[10px] font-medium text-slate-500 ml-auto">CONF: {confidence}%</span>
          )}
        </div>`;
code = code.replace(s3, r3);

const s4 = `        </div>
        
        {/* Animated Bars */}`;
const r4 = `        </div>
        
        {breakdown && (
            <div className="mt-4 mb-2 grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(breakdown).map(([k, v]) => (
                 <div key={k} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                      <span>{k}</span>
                      <span>{Number(v)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full rounded-full" style={{ width: \`\${v}%\`, backgroundColor: color, opacity: 0.8 }} />
                    </div>
                 </div>
              ))}
            </div>
        )}

        {/* Animated Bars */}`;

code = code.replace(s4, r4);

fs.writeFileSync('client/src/pages/Swipes.tsx', code);
console.log("Fixed!");
