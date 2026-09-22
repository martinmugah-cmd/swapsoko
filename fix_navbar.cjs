const fs = require('fs');
let code = fs.readFileSync('client/src/App.tsx', 'utf8');

// 1. Change the tabs to use better hugeicons
// We'll import them correctly.
const importHugeicons = `import { Home01Icon, Copy01Icon, Store01Icon, Comment01Icon, UserIcon } from "hugeicons-react";`;
code = code.replace(/import \{ Home01Icon, Copy01Icon, Store01Icon, Comment01Icon, UserCircleIcon \} from "hugeicons-react";/, importHugeicons);

code = code.replace(/icon: UserCircleIcon/g, 'icon: UserIcon');

// 2. Fix the badge to hide when 0
code = code.replace(
  /\{tab\.badge \? \(tab\.badge > 0 \? \([\s\S]*?\) : null\) : null\}/,
  `{tab.badge && tab.badge > 0 ? (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </div>
                  ) : null}`
);

// 3. Fix the active styling to not look terrible and fill the icon
// Let's replace the whole Link block for non-center tabs.
const oldTabBlock = `return (
            <Link href={tab.path} key={tab.path}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center gap-1 min-w-[56px] relative cursor-pointer pt-1"
              >
                <div className="relative">
                  <tab.icon
                    className={\`w-[22px] h-[22px] transition-colors duration-200 \${active ? "text-[#10B981]" : "text-[#94A3B8]"}\`}
                    strokeWidth={active ? 2.5 : 2}
                    
                  />
                  {tab.badge ? (tab.badge > 0 ? (
                    <div className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </div>
                  ) : null) : null}
                </div>
                <span className={\`text-[10px] font-semibold transition-colors duration-200 \${active ? "text-[#10B981]" : "text-[#94A3B8]"}\`}>
                  {tab.label}
                </span>
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="nav-active-dot"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-1.5 h-1.5 rounded-full bg-[#10B981] absolute -bottom-2.5"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );`;

const newTabBlock = `return (
            <Link href={tab.path} key={tab.path}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center gap-1 min-w-[56px] relative cursor-pointer pt-2 pb-1"
              >
                <div className="relative flex flex-col items-center justify-center">
                  <tab.icon
                    className={\`w-[24px] h-[24px] transition-all duration-300 \${active ? "text-emerald-500 drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]" : "text-slate-400"}\`}
                    strokeWidth={active ? 2.5 : 2.0}
                    color="currentColor"
                  />
                  {tab.badge && tab.badge > 0 ? (
                    <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-[2px] border-white shadow-sm leading-none">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </div>
                  ) : null}
                </div>
                <span className={\`text-[10px] font-bold tracking-tight transition-colors duration-300 \${active ? "text-emerald-600" : "text-slate-500"}\`}>
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );`;

// Let's do a more robust replacement using string searching
let startIdx = code.indexOf('return (', code.indexOf('if (tab.isCenter)') + 300);
if (startIdx !== -1) {
  let endIdx = code.indexOf(');', startIdx) + 2;
  // wait, the block is larger, we need to match the whole block correctly.
}

fs.writeFileSync('client/src/App.tsx.backup', code);
