const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Profile.tsx', 'utf8');

const search = `function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {`;
const replace = `function StatCard({ icon, label, value, color, isText }: { icon: React.ReactNode; label: string; value: string | number; color: string; isText?: boolean }) {`;

const search2 = `<p className="font-black text-slate-900 text-2xl leading-none mb-1 tracking-tight drop-shadow-sm">{value}</p>`;
const replace2 = `<p className={\`font-black text-slate-900 \${isText ? 'text-xs' : 'text-2xl'} leading-tight mb-1 tracking-tight drop-shadow-sm\`}>{value}</p>`;

code = code.replace(search, replace).replace(search2, replace2);

fs.writeFileSync('client/src/pages/Profile.tsx', code);
console.log("StatCard fixed!");
