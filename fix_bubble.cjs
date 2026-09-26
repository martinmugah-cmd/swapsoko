const fs = require('fs');
let code = fs.readFileSync('client/src/pages/SwapGuru.tsx', 'utf8');

const oldInterface = `function MessageBubble({ msg, onPropose }: { msg: { role: "user" | "guru"; content: string; listings?: any[] }, onPropose: (l: any) => void }) {`;
const newInterface = `function MessageBubble({ msg, onPropose, onAction }: { msg: { role: "user" | "guru"; content: string; listings?: any[]; actions?: any[] }, onPropose: (l: any) => void, onAction: (a: any) => void }) {`;

code = code.replace(oldInterface, newInterface);

const renderListings = `            {/* Render tagged listings if they exist */}
            {msg.listings && msg.listings.length > 0 && (
              <div className="mt-4 space-y-2">
                {msg.listings.map((l, i) => {`;

const renderActions = `            {/* Render Engine Actions */}
            {msg.actions && msg.actions.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {msg.actions.map((act, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAction(act)}
                    className="w-full text-[13px] bg-slate-900 text-white font-bold px-4 py-2.5 rounded-[12px] flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    {act.label}
                  </motion.button>
                ))}
              </div>
            )}
            
            {/* Render tagged listings if they exist */}
            {msg.listings && msg.listings.length > 0 && (
              <div className="mt-4 space-y-2">
                {msg.listings.map((l, i) => {`;

code = code.replace(renderListings, renderActions);

fs.writeFileSync('client/src/pages/SwapGuru.tsx', code);
console.log("Fixed!");
