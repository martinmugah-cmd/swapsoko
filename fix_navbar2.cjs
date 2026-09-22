const fs = require('fs');
let code = fs.readFileSync('client/src/App.tsx', 'utf8');

const importHugeicons = `import { Home01Icon, Copy01Icon, Store01Icon, Comment01Icon, UserIcon } from "hugeicons-react";`;
code = code.replace(/import \{ Home01Icon, Copy01Icon, Store01Icon, Comment01Icon, UserCircleIcon \} from "hugeicons-react";/, importHugeicons);

code = code.replace(/icon: UserCircleIcon/g, 'icon: UserIcon');

const nonCenterStart = code.indexOf('          return (\n            <Link href={tab.path} key={tab.path}>');
if (nonCenterStart !== -1) {
  const nextDiv = code.indexOf('      </div>\n    </nav>', nonCenterStart);
  if (nextDiv !== -1) {
    const newBlock = `          return (
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
          );
        })}
`;
    code = code.substring(0, nonCenterStart) + newBlock + code.substring(nextDiv);
  }
}

// Ensure distance filter issue is fixed in trpc.ts:
// add .order('created_at', { ascending: false })
let trpcCode = fs.readFileSync('client/src/lib/trpc.ts', 'utf8');
trpcCode = trpcCode.replace(
  /const \{ data: listingsData \} = await supabase.from\('listings'\)\.select\('\*, profiles!user_id\(\*\)'\)\.eq\('status', 'active'\)\.limit\(50\);/g,
  "const { data: listingsData } = await supabase.from('listings').select('*, profiles!user_id(*)').eq('status', 'active').order('created_at', { ascending: false }).limit(50);"
);

fs.writeFileSync('client/src/App.tsx', code);
fs.writeFileSync('client/src/lib/trpc.ts', trpcCode);

