const fs = require('fs');
let code = fs.readFileSync('client/src/lib/trpc.ts', 'utf8');

const s = `                    camelData = RecommendationEngine.generateFeed(camelData, context as any);
                    
                    // Front-end requested filters (hard filters)
                    if (filters) {`;

const r = `                    camelData = RecommendationEngine.generateFeed(camelData, context as any);
                    
                    // Chapter 7 Match Engine
                    const { MatchEngine } = await import('@/lib/engines/MatchEngine');
                    const matchCtx = {
                       userWishes: myWishes,
                       userListings: myListings,
                       userInterests: userInterests,
                       userCoords: { lat: userLat, lng: userLng },
                       maxTopUp: 10000 // In future, load from user profile
                    };
                    
                    camelData = camelData.map((l: any) => {
                       const matchResult = MatchEngine.calculateMatch(l, matchCtx);
                       return {
                           ...l,
                           _matchScore: matchResult.score,
                           _matchTier: matchResult.tier,
                           _matchConfidence: matchResult.confidence,
                           _matchReasons: matchResult.reasons,
                           _matchBreakdown: matchResult.breakdown
                       };
                    });
                    
                    // Front-end requested filters (hard filters)
                    if (filters) {`;

code = code.replace(s, r);
fs.writeFileSync('client/src/lib/trpc.ts', code);
console.log("Fixed!");
