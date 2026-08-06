const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// We need a list of participants to render the dropdown.
// Let's create a new component `MentionDropdown` or just inline it near the input.
// First, find the input area:
const inputMatch = code.match(/<input\s+value=\{input\}\s+onChange=\{e => setInput\(e\.target\.value\)\}/);

if (inputMatch) {
  // Add state to ChatPage
  code = code.replace(/const \[input, setInput\] = useState\(""\);/, `const [input, setInput] = useState("");\n  const [mentionState, setMentionState] = useState({ active: false, query: "" });`);
  
  // Add the mention handler to onChange
  const newOnChange = `onChange={e => {
                    const val = e.target.value;
                    setInput(val);
                    const lastWord = val.split(' ').pop();
                    if (lastWord.startsWith('@')) {
                      setMentionState({ active: true, query: lastWord.slice(1).toLowerCase() });
                    } else {
                      setMentionState({ active: false, query: "" });
                    }
                  }}`;
  
  code = code.replace(/onChange=\{e => setInput\(e\.target\.value\)\}/, newOnChange);
  
  // Create a dropdown UI above the input
  const dropdownUI = `{mentionState.active && room?.cycleData?.participants && (
                <div className="absolute bottom-[80px] left-4 bg-white border border-gray-100 shadow-xl rounded-xl p-2 w-48 z-50">
                  <p className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-widest">Mention</p>
                  {room.cycleData.participants.map((pid: string) => (
                     <div key={pid} onClick={() => {
                        const words = input.split(' ');
                        words.pop();
                        setInput(words.join(' ') + (words.length > 0 ? ' ' : '') + '@user_' + pid.slice(0,4) + ' ');
                        setMentionState({ active: false, query: '' });
                     }} className="px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold">U</div>
                        <span className="text-sm font-medium text-gray-700">user_{pid.slice(0,4)}</span>
                     </div>
                  ))}
                </div>
              )}`;
              
  code = code.replace(/<div className="flex-1 flex items-center bg-\[#F8FAFC\]\/50/, dropdownUI + '\n              <div className="flex-1 flex items-center bg-[#F8FAFC]/50');

  fs.writeFileSync('src/pages/Chat.tsx', code);
  console.log("Mentions added");
} else {
  console.log("Could not find input");
}
