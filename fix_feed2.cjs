const fs = require('fs');
let code = fs.readFileSync('client/src/lib/trpc.ts', 'utf8');

const s = `                    camelData = RecommendationEngine.generateFeed(camelData, context as any);
                 }`;

const r = `                    camelData = RecommendationEngine.generateFeed(camelData, context as any);
                    
                    // Front-end requested filters (hard filters)
                    if (filters) {
                      if (filters.category && filters.category !== "All") camelData = camelData.filter((i: any) => i.category === filters.category);
                      if (filters.condition && filters.condition !== "free") camelData = camelData.filter((i: any) => i.condition === filters.condition);
                      if (filters.verifiedOnly) camelData = camelData.filter((i: any) => i.profiles?.isStudentVerified);
                      if (filters.cashTopUpAllowed) camelData = camelData.filter((i: any) => i.cashTopUpAllowed);
                      if (filters.discoveryMode === 'nearby' && filters.coords) camelData = camelData.filter((i: any) => (i.distanceKm || 100) <= (filters.radius || 5));
                    }
                 }`;
                 
code = code.replace(s, r);
fs.writeFileSync('client/src/lib/trpc.ts', code);
console.log("Fixed!");
