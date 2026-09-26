const fs = require('fs');
let code = fs.readFileSync('client/src/lib/trpc.ts', 'utf8');

const startIndex = code.indexOf(`                 // Apply ChatGPT Algorithm if this is the Feed`);
const searchString = `if (filters.discoveryMode === 'nearby' && filters.coords) camelData = camelData.filter((i: any) => (i.distanceKm || 100) <= (filters.radius || 5));
                    }
                 }`;
const endIndex = code.indexOf(searchString);

if (startIndex !== -1 && endIndex !== -1) {
    const newBlock = `                 // Chapter 6 Recommendation Engine
                 if (path[1] === 'feed' || path[1] === 'list') {
                    // Fetch user profile and preferences for personalization
                    let myProfile: any = null;
                    let myWishes: any[] = [];
                    let myListings: any[] = [];
                    let myCommunities: number[] = [];
                    
                    if (activeUserId) {
                       const [resP, resW, resML, resMC] = await Promise.all([
                           supabase.from('profiles').select().eq('user_id', activeUserId).single(),
                           supabase.from('wishes').select().eq('user_id', activeUserId),
                           supabase.from('listings').select().eq('user_id', activeUserId),
                           supabase.from('community_members').select().eq('user_id', activeUserId)
                       ]);
                       myProfile = resP.data ? snakeToCamel(resP.data) : null;
                       if (resW.data) myWishes = snakeToCamel(resW.data);
                       if (resML.data) myListings = snakeToCamel(resML.data);
                       if (resMC.data) myCommunities = resMC.data.map((m: any) => m.community_id);
                    }
                    
                    const userInterests: Record<string, number> = {};
                    if (myProfile?.interests && Array.isArray(myProfile.interests)) {
                        myProfile.interests.forEach((c: string) => { userInterests[c.toLowerCase()] = 0.9; });
                    }
                    
                    const { RecommendationEngine } = await import('@/lib/engines/RecommendationEngine');
                    
                    // We generate candidates directly on the filtered pool
                    const context = {
                        userId: activeUserId,
                        userListings: myListings,
                        userInterests: userInterests,
                        surface: path[1] === 'feed' ? 'swipe' : 'home'
                    };
                    
                    camelData = RecommendationEngine.generateFeed(camelData, context as any);
                 }`;
                 
    code = code.substring(0, startIndex) + newBlock + code.substring(endIndex + searchString.length);
    fs.writeFileSync('client/src/lib/trpc.ts', code);
    console.log("Fixed!");
} else {
    console.log("Not found", startIndex, endIndex);
}
