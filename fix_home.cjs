const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');

// 1. Remove PullToRefresh
code = code.replace(/import \{ PullToRefresh \} from "@\/components\/PullToRefresh";\n/, '');
code = code.replace(/const handleRefresh = async \(\) => \{\n    \/\/ await queryClient\.invalidateQueries\(\);\n    await new Promise\(resolve => setTimeout\(resolve, 1000\)\);\n  \};\n/, '');

// Remove wrapper
code = code.replace(/<PullToRefresh onRefresh=\{handleRefresh\}>/, '');
// Remove closing tag (the last one)
let lastIndex = code.lastIndexOf('</PullToRefresh>');
if (lastIndex !== -1) {
  code = code.substring(0, lastIndex) + code.substring(lastIndex + '</PullToRefresh>'.length);
}

// 2. Remove Filter button and Notification Bell from top right of Home
// The block looks like this:
/*
            <div className="flex items-center gap-2.5 pr-1">
              <motion.button
                onClick={() => setShowFilters(true)}
                className="relative w-11 h-11 flex items-center justify-center rounded-[20px] bg-white/50 backdrop-blur-md hover:bg-white/80 transition-colors border border-white/60 shadow-sm"
                whileTap={{ scale: 0.9 }}
              >
                <Filter size={20} className="text-slate-800" />
                {activeFilterCount > 0 && (
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm text-[8px] font-bold text-white">{activeFilterCount}</span>
                )}
              </motion.button>
              
              <FilterSheet open={showFilters} onOpenChange={setShowFilters} />

              <motion.button
                onClick={() => navigate("/notifications")}
                className="relative w-11 h-11 flex items-center justify-center rounded-[20px] bg-white/50 backdrop-blur-md hover:bg-white/80 transition-colors border border-white/60 shadow-sm"
                whileTap={{ scale: 0.9 }}
              >
                <Bell size={20} className="text-slate-800" />
                <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm text-[8px] font-bold text-white">3</span>
              </motion.button>
            </div>
*/

// Let's replace that whole div with just the notification bell or just remove both.
// User said "why is there filter button in homepage". He didn't mention the bell. I'll just remove the filter button.

const filterBtnRegex = /<motion\.button[^>]*onClick=\{\(\) => setShowFilters\(true\)\}[^]*?<\/motion\.button>/m;
code = code.replace(filterBtnRegex, '');

fs.writeFileSync('client/src/pages/Home.tsx', code);
console.log('Home.tsx updated');
