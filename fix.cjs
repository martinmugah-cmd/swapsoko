const fs = require('fs');
let code = fs.readFileSync('client/src/lib/trpc.ts', 'utf8');

const startMarker = "              if (path[0] === 'swapGuru' && path[1] === 'ask') {";
const searchString = "                return { response, listings: returnedListings || [] };\n              }";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(searchString);

if (startIndex !== -1 && endIndex !== -1) {
    const newBlock = `              // Swap Guru - Chapter 5 AI Engine Hook
              if (path[0] === 'swapGuru' && path[1] === 'ask') {
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate thinking
                const p = variables.prompt?.toLowerCase() || "";
                
                let userListings = [];
                if (activeUserId) {
                   const { data } = await supabase.from('listings').select('*').eq('user_id', activeUserId);
                   userListings = data || [];
                }

                const { SwapGuruEngine } = await import('@/lib/engines/SwapGuruEngine');
                
                const { data: allListings } = await supabase.from('listings').select('*, profiles!user_id(*)');
                const othersListings = (allListings || []).filter(l => l.user_id !== activeUserId);
                
                const guruResponse = await SwapGuruEngine.processMessage(p, userListings, null);

                let finalListings = [];
                if (guruResponse.actions?.some(a => a.actionType === 'SHOW_LISTINGS' || a.actionType === 'NAVIGATE' || a.actionType === 'PROPOSE_SWAP')) {
                    const cleanP = p.toLowerCase().replace(/[\\.,\\?!\\'\\"]/g, "");
                    const stopwords = new Set(["a","an","the","and","but","if","or","with","to","for"]);
                    const queryWords = cleanP.split(/\\s+/).filter((w) => !stopwords.has(w) && w.length > 2);
                    
                    finalListings = othersListings.filter((l) => {
                       const title = (l.title || "").toLowerCase();
                       const cat = (l.category || "").toLowerCase();
                       return queryWords.some((w) => title.includes(w) || cat.includes(w));
                    }).slice(0, 3);
                    
                    if (finalListings.length === 0) finalListings = othersListings.slice(0, 3);
                }

                return { response: guruResponse.text, listings: finalListings, actions: guruResponse.actions };
              }`;
    
    code = code.substring(0, startIndex) + newBlock + code.substring(endIndex + searchString.length);
    fs.writeFileSync('client/src/lib/trpc.ts', code);
    console.log("Fixed!");
} else {
    console.log("Markers not found:", startIndex, endIndex);
}
