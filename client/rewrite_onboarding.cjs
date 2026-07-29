const fs = require('fs');
let code = fs.readFileSync('src/pages/Onboarding.tsx', 'utf8');

// Add utils
code = code.replace(
  'const { data: myProfile, isSuccess } = trpc.profile.me.useQuery(undefined, { enabled: !!user });',
  'const { data: myProfile, isSuccess } = trpc.profile.me.useQuery(undefined, { enabled: !!user });\n  const utils = trpc.useContext();'
);

// Fix infinite loop
code = code.replace(
  'await refresh();\n      toast.success("Welcome to SwapSoko!");\n      navigate("/");',
  'await refresh();\n      await utils.profile.me.invalidate();\n      await utils.profile.get.invalidate();\n      toast.success("Welcome to SwapSoko!");\n      navigate("/");'
);

// Redesign Step 1 UI
const newStep1 = `case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 flex flex-col h-full max-w-lg mx-auto w-full">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Let's get to know you</h2>
              <p className="text-gray-500 mt-2 font-medium">Set up your profile to start swapping.</p>
            </div>
            
            <div className="space-y-5 bg-white p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 pl-1">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-gray-50/50 rounded-2xl px-5 py-4 border border-gray-100 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 pl-1">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. johndoe" className="w-full bg-gray-50/50 rounded-2xl px-5 py-4 border border-gray-100 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400" />
              </div>
              
              {accountType === "student" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 mt-6 border-t border-gray-100/80 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><GraduationCap className="w-4 h-4" /></div>
                    <p className="text-sm font-bold text-gray-900">Student Info</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 pl-1">Course</label>
                    <input value={course} onChange={e => setCourse(e.target.value)} placeholder="e.g. BSc. Computer Science" className="w-full bg-gray-50/50 rounded-2xl px-5 py-4 border border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700 pl-1">Year of Study</label>
                      <input value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} placeholder="e.g. Year 3" className="w-full bg-gray-50/50 rounded-2xl px-5 py-4 border border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700 pl-1">Graduation</label>
                      <input value={graduationYear} onChange={e => setGraduationYear(e.target.value)} placeholder="e.g. 2026" type="number" className="w-full bg-gray-50/50 rounded-2xl px-5 py-4 border border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="mt-auto pt-6 pb-8">
              <button onClick={handleNext} disabled={!fullName || !username} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-gray-800 hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]">Continue</button>
            </div>
          </motion.div>
        );`;
code = code.replace(/case 1:[\s\S]*?(?=case 2:)/, newStep1 + '\n\n      ');

const newStep2 = `case 2:
        const unselectedInterests = INTERESTS.filter(i => !selectedInterests.includes(i.id));
        const selectedInterestObjs = INTERESTS.filter(i => selectedInterests.includes(i.id));

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 flex flex-col h-full max-w-lg mx-auto w-full">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Interests</h2>
              <p className="text-gray-500 mt-2 font-medium">Tap to add to your deck. Pick at least one.</p>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <AnimatePresence>
                  {unselectedInterests.map(interest => (
                    <motion.button
                      layoutId={\`interest-\${interest.id}\`}
                      key={interest.id}
                      onClick={() => handleToggleInterest(interest.id)}
                      className="bg-white px-2 py-4 rounded-[24px] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all"
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={\`w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl \${interest.color} bg-opacity-40\`}> 
                        {interest.icon}
                      </div>
                      <span className="font-bold text-sm text-gray-700">{interest.label}</span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {/* Stacked Deck at the bottom */}
              <div className="mt-8 h-28 relative flex justify-center items-end bg-gray-100/50 rounded-[32px] border border-dashed border-gray-200">
                <AnimatePresence>
                  {selectedInterestObjs.map((interest, index) => {
                    const isTop = index === selectedInterestObjs.length - 1;
                    return (
                      <motion.div
                        layoutId={\`interest-\${interest.id}\`}
                        key={interest.id}
                        onClick={() => handleToggleInterest(interest.id)}
                        className={\`absolute w-28 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 flex flex-col items-center gap-2 cursor-pointer
                          \${isTop ? 'border-2 border-green-500 ring-4 ring-green-500/20' : 'opacity-90'}
                        \`}
                        style={{
                          bottom: index * 4,
                          zIndex: index,
                          rotate: index % 2 === 0 ? (index * 2) : -(index * 2),
                        }}
                        whileHover={{ y: -10 }}
                      >
                        <div className={\`text-2xl \${interest.color}\`}>{interest.icon}</div>
                        <span className="font-extrabold text-xs text-gray-800">{interest.label}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {selectedInterests.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium">
                    Empty Deck
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto pt-6 pb-8">
              <button onClick={handleNext} disabled={selectedInterests.length === 0} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-gray-800 hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]">Continue</button>
            </div>
          </motion.div>
        );`;
code = code.replace(/case 2:[\s\S]*?(?=case 3:)/, newStep2 + '\n\n      ');

const newStep3 = `case 3:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 flex flex-col h-full max-w-lg mx-auto w-full text-center">
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-[32px] flex items-center justify-center mx-auto text-blue-500 mb-8 shadow-inner rotate-3">
                <MapPin className="w-14 h-14 -rotate-3" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Enable Location</h2>
              <p className="text-gray-500 text-[15px] px-6 mt-4 font-medium leading-relaxed max-w-sm mx-auto">
                SwapSoko uses your location to show you relevant listings and reliable swappers near your campus or current area.
              </p>
            </div>
            <div className="mt-auto pt-8 pb-8 flex flex-col gap-3">
              <button onClick={handleLocationAllow} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-[0_8px_30px_rgba(37,99,235,0.24)] hover:bg-blue-700 hover:shadow-lg transition-all active:scale-[0.98]">Allow Location</button>
              <button onClick={() => completeOnboarding("")} className="w-full bg-white text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-colors">Not right now</button>
            </div>
          </motion.div>
        );`;
code = code.replace(/case 3:[\s\S]*?(?=default:)/, newStep3 + '\n\n      ');

// Update main layout background
code = code.replace(
  '<div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col relative overflow-hidden">',
  '<div className="min-h-[100dvh] bg-white flex flex-col relative overflow-hidden">'
);
code = code.replace(
  '<div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />',
  '<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />\n      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />'
);

// Update progress bar
code = code.replace(
  '<div className="px-6 pt-12 pb-4 max-w-lg mx-auto w-full">',
  '<div className="px-6 pt-12 pb-8 max-w-lg mx-auto w-full">'
);
code = code.replace(
  'bg-green-500',
  'bg-gray-900'
);
code = code.replace(
  'bg-green-400',
  'bg-gray-900'
);
code = code.replace(
  'bg-gray-200',
  'bg-gray-100'
);

fs.writeFileSync('src/pages/Onboarding.tsx', code);
