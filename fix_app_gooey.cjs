const fs = require('fs');
let code = fs.readFileSync('client/src/App.tsx', 'utf8');

const oldGooeyBlock = /<div className="absolute inset-0 flex justify-between items-center px-4" style=\{\{ filter: "url\\(#goo\\)" \}\}>[\s\S]*?<\/nav>/m;

const newGooeyBlock = `<div className="absolute inset-0 px-4" style={{ filter: "url(#goo)" }}>
          <div className="flex justify-between items-center h-full w-full relative">
            {tabs.map((tab) => {
              const active = isActive(tab.path);
              if (tab.isCenter) return <div key={tab.path + "-blob"} className="w-[60px]" />;
              return (
                <div key={tab.path + "-blob"} className="relative flex flex-col items-center justify-center w-[60px] h-full">
                  {active && (
                    <motion.div
                      layoutId="gooey-blob"
                      className="absolute w-[40px] h-[40px] bg-emerald-500 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute inset-0 flex justify-between items-center px-4">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            if (tab.isCenter) {
              return (
                <div key={tab.path} className="relative w-[72px] flex items-center justify-center h-[72px] -mt-12 z-20">
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
              <div key={tab.path} onClick={() => navigate(tab.path)} className="relative flex flex-col items-center justify-center w-[60px] h-[60px] cursor-pointer z-10">
                <div className="relative z-10 flex flex-col items-center justify-center mt-1">
                  <tab.icon
                    size={24}
                    className={\`transition-all duration-300 \${active ? "text-white drop-shadow-sm" : "text-slate-500"}\`}
                    strokeWidth={active ? 2.5 : 2.0}
                    color="currentColor"
                  />
                  {tab.badge && tab.badge > 0 ? (
                    <div className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-sm leading-none">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </div>
                  ) : null}
                  <span className={\`text-[10px] font-bold tracking-tight mt-1 transition-colors duration-300 \${active ? "text-emerald-700" : "text-slate-400"}\`}>
                    {tab.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </nav>`;

code = code.replace(oldGooeyBlock, newGooeyBlock);
fs.writeFileSync('client/src/App.tsx', code);
console.log('App.tsx gooey split fixed');
