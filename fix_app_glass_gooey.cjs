const fs = require('fs');
let code = fs.readFileSync('client/src/App.tsx', 'utf8');

// 1. Fix Imports
code = code.replace(/import \{ HomeDoodleIcon, CopyDoodleIcon, ShopDoodleIcon, MessageDoodleIcon, UserDoodleIcon \} from "\.\/lib\/doodle-icons";\n?/, '');
code = code.replace(/import \{ Home, MessageCircle, Plus, Repeat2, User, Bell, Shield \} from "@\/lib\/icons";/, 'import { Home, MessageCircle, Plus, Copy, Package, User, Bell, Shield, Store } from "@/lib/icons";');

// 2. Replace Tabs configuration
code = code.replace(/icon: HomeDoodleIcon/g, 'icon: Home');
code = code.replace(/icon: CopyDoodleIcon/g, 'icon: Copy');
code = code.replace(/icon: ShopDoodleIcon/g, 'icon: Store');
code = code.replace(/icon: MessageDoodleIcon/g, 'icon: MessageCircle');
code = code.replace(/icon: UserDoodleIcon/g, 'icon: User');

// 3. Rewrite BottomNav rendering logic
const bottomNavRegex = /return \([\s\S]*?className="fixed bottom-6[\s\S]*?<\/nav>\s*<\/>\s*\);/m;
const newNavRender = `return (
    <>
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[420px] h-[72px] z-[200]">
        <div 
          className="absolute inset-0 bg-white/40 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/50 rounded-[36px]"
          style={{
            maskImage: "radial-gradient(circle at 50% -12px, transparent 38px, black 39px)",
            WebkitMaskImage: "radial-gradient(circle at 50% -12px, transparent 38px, black 39px)",
          }}
        />
        <div className="absolute inset-0 flex justify-between items-center px-4" style={{ filter: "url(#goo)" }}>
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            if (tab.isCenter) {
              return (
                <div key={tab.path} className="relative w-[72px] flex items-center justify-center h-[72px] -mt-12">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[8px] opacity-40"></div>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => navigate(tab.path)}
                    className="w-[60px] h-[60px] rounded-full bg-emerald-500 flex items-center justify-center shadow-lg relative z-10 border-[3px] border-white text-white"
                  >
                    <tab.icon size={26} className="text-white" strokeWidth={2.5} />
                  </motion.button>
                </div>
              );
            }

            return (
              <div key={tab.path} onClick={() => navigate(tab.path)} className="relative flex flex-col items-center justify-center w-[60px] h-[60px] cursor-pointer">
                {active && (
                  <motion.div
                    layoutId="gooey-blob"
                    className="absolute w-[45px] h-[45px] bg-emerald-500/20 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center justify-center mt-1">
                  <tab.icon
                    size={24}
                    className={\`transition-all duration-300 \${active ? "text-emerald-600 drop-shadow-sm" : "text-slate-400"}\`}
                    strokeWidth={active ? 2.5 : 2.0}
                    color="currentColor"
                  />
                  {tab.badge && tab.badge > 0 ? (
                    <div className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-sm leading-none">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </div>
                  ) : null}
                  <span className={\`text-[10px] font-bold tracking-tight mt-1 transition-colors duration-300 \${active ? "text-emerald-700" : "text-transparent"}\`}>
                    {active ? tab.label : "•"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );`;

code = code.replace(bottomNavRegex, newNavRender);
fs.writeFileSync('client/src/App.tsx', code);
console.log('App.tsx rewrite complete');
