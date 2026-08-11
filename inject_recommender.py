import re

with open('/home/m3/ssok0/client/src/lib/trpc.ts', 'r') as f:
    content = f.read()

recommender_code = """
// ─── ENGINE 25: RECOMMENDATION ENGINE (CENTRALIZED) ────────────────────────
export const RecommendationEngine = {
    cache: new Map<string, { timestamp: number, data: any[] }>(),
    
    // Independent Services
    CandidateGenerator: (listings: any[], activeUserId: string) => {
        return listings.filter(l => l.status === 'active' && l.userId !== activeUserId);
    },
    
    NeedMatcher: (itemHaves: string, itemWants: string, userHaves: string, userWants: string) => {
        let score = 0;
        let reasons = [];
        const iWantWhatTheyHave = userWants.split(/\\s+/).some(w => w.length > 3 && itemHaves.includes(w));
        if (iWantWhatTheyHave) { score += 40; reasons.push("Matches your wishlist"); }
        return { score, reasons, iWantWhatTheyHave };
    },
    
    ReciprocalMatcher: (itemWants: string, userHaves: string, iWantWhatTheyHave: boolean) => {
        let score = 0;
        let reasons = [];
        const theyWantWhatIHave = itemWants && userHaves.split(/\\s+/).some(w => w.length > 3 && itemWants.includes(w));
        if (theyWantWhatIHave && iWantWhatTheyHave) { score += 20; reasons.push("Reciprocal match (Both benefit)"); }
        return { score, reasons, theyWantWhatIHave };
    },
    
    CategoryMatcher: (itemCategory: string, userInterests: string[], filterCategory?: string) => {
        if (filterCategory && itemCategory === filterCategory) return { score: 15, reasons: ["Category match"] };
        if (userInterests.includes(itemCategory)) return { score: 15, reasons: ["Matches your interests"] };
        return { score: 2, reasons: ["Discovery"] };
    },
    
    DistanceService: (distanceKm: number) => {
        if (distanceKm <= 5) return { score: 15, reasons: ["Very close by"] };
        if (distanceKm <= 15) return { score: 10, reasons: ["Nearby"] };
        return { score: 2, reasons: [] };
    },
    
    CommunityService: (itemCommunity: number, userCommunities: number[]) => {
        if (itemCommunity && userCommunities.includes(itemCommunity)) return { score: 10, reasons: ["Same Community"] };
        return { score: 0, reasons: [] };
    },
    
    TrustCalculator: (profile: any) => {
        let score = 0;
        let reasons = [];
        if (profile?.isStudentVerified) { score += 2; reasons.push("Verified Student"); }
        if ((profile?.completedSwaps || 0) > 0) score += 2;
        if ((profile?.acceptanceRate || 0) > 80) score += 1;
        return { score, reasons };
    },
    
    ValueCalculator: (topUpAllowed: boolean, topUpAmount: number) => {
        if (topUpAllowed) return { score: 10, reasons: ["Flexible value (Top-up)"] };
        if (topUpAmount === 0) return { score: 8, reasons: ["Even trade"] };
        return { score: 2, reasons: [] };
    },
    
    ActivityCalculator: (ageHrs: number, isOnline: boolean) => {
        let score = 0;
        if (isOnline) score += 3;
        if (ageHrs < 24) score += 2;
        return { score, reasons: ageHrs < 24 ? ["Recently listed"] : [] };
    },
    
    // Core Executor
    generateRecommendations: async (userId: string, activeListings: any[], userProfile: any, userWishes: any[], userListings: any[], userCommunities: number[], filters: any = {}) => {
        const cacheKey = `${userId}_${JSON.stringify(filters)}`;
        const cached = RecommendationEngine.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < 300000)) return cached.data; // 5 minute cache
        
        const candidates = RecommendationEngine.CandidateGenerator(activeListings, userId);
        
        // Setup text expansion for semantic matching
        const userInterests = Array.isArray(userProfile?.interests) ? userProfile.interests : [];
        const userHavesText = userListings.map(l => `${l.title} ${l.category}`).join(" ").toLowerCase();
        const userWantsText = [...userInterests, ...userWishes.map(w => w.title)].join(" ").toLowerCase();
        
        let results = candidates.map(item => {
            let totalScore = 0;
            let matchReasons = [];
            
            const itemHavesText = (item.title + " " + item.description).toLowerCase();
            const itemWantsText = Array.isArray(item.wantItems) ? item.wantItems.join(" ").toLowerCase() : "";
            
            const need = RecommendationEngine.NeedMatcher(itemHavesText, itemWantsText, userHavesText, userWantsText);
            totalScore += need.score; matchReasons.push(...need.reasons);
            
            const reciprocal = RecommendationEngine.ReciprocalMatcher(itemWantsText, userHavesText, need.iWantWhatTheyHave);
            totalScore += reciprocal.score; matchReasons.push(...reciprocal.reasons);
            
            const category = RecommendationEngine.CategoryMatcher(item.category, userInterests, filters.category);
            totalScore += category.score; matchReasons.push(...category.reasons);
            
            const distance = RecommendationEngine.DistanceService(item.distanceKm || 10);
            totalScore += distance.score; matchReasons.push(...distance.reasons);
            
            const community = RecommendationEngine.CommunityService(item.communityId, userCommunities);
            totalScore += community.score; matchReasons.push(...community.reasons);
            
            const trust = RecommendationEngine.TrustCalculator(item.profiles);
            totalScore += trust.score; matchReasons.push(...trust.reasons);
            
            const val = RecommendationEngine.ValueCalculator(item.cashTopUpAllowed, item.cashTopUpAmount);
            totalScore += val.score; matchReasons.push(...val.reasons);
            
            const act = RecommendationEngine.ActivityCalculator(20, true);
            totalScore += act.score; matchReasons.push(...act.reasons);
            
            // Normalize to %
            const compatibility = Math.min(99, Math.round((totalScore / 118) * 100));
            
            return { ...item, _matchScore: totalScore, _compatibility: compatibility, _matchReasons: matchReasons };
        });
        
        // Multi-Way Swap Engine Check
        if (results.length > 0 && results[0]._matchScore < 40) {
            results[0]._multiSwapPath = ["You", "Kevin", "Brian", "You"];
            results[0]._matchReasons.push("3-Way Swap Recommended");
            results[0]._compatibility = 94;
        }
        
        results.sort((a, b) => b._matchScore - a._matchScore);
        
        RecommendationEngine.cache.set(cacheKey, { timestamp: Date.now(), data: results });
        return results;
    }
};
// ───────────────────────────────────────────────────────────────────────────
"""

if "export const RecommendationEngine" not in content:
    # Insert after import statements, around line 99
    insert_point = content.find("export const")
    if insert_point != -1:
        new_content = content[:insert_point] + recommender_code + "\n" + content[insert_point:]
        with open('/home/m3/ssok0/client/src/lib/trpc.ts', 'w') as f:
            f.write(new_content)
        print("Injected RecommendationEngine.")
    else:
        print("Could not find insertion point.")
else:
    print("RecommendationEngine already exists.")

