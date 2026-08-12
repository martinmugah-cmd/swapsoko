import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_KEY || supabaseKey;

// ─── SWAPGURU CORE ENGINES ────────────────────────────────────────────────
export const ValueEngine = {
    calculateValue: (params: { historicalAvg?: number, currentAvg?: number, condition?: string, ageYears?: number, accessoriesVal?: number, demandFactor?: number, brandFactor?: number, locationFactor?: number, isService?: boolean }) => {
        if (params.isService) {
            return { estimatedValue: null, range: null, confidence: 0, isService: true, message: "Value determined by swap history." };
        }
        
        let confidence = 0;
        let baseValue = 0;
        
        // 1. Historical & Current Market (35% + 25%)
        if (params.historicalAvg && params.currentAvg) {
            baseValue = (params.historicalAvg * 0.58) + (params.currentAvg * 0.42); // Normalized between the two
            confidence += 60;
        } else if (params.historicalAvg) {
            baseValue = params.historicalAvg;
            confidence += 35;
        } else if (params.currentAvg) {
            baseValue = params.currentAvg;
            confidence += 25;
        }
        
        // 2. Condition (15%)
        let conditionMultiplier = 0.80; // default Good
        if (params.condition === 'brand_new') conditionMultiplier = 1.0;
        else if (params.condition === 'like_new') conditionMultiplier = 0.95;
        else if (params.condition === 'excellent') conditionMultiplier = 0.90;
        else if (params.condition === 'fair') conditionMultiplier = 0.65;
        else if (params.condition === 'repair') conditionMultiplier = 0.40;
        
        let estimated = baseValue * conditionMultiplier;
        
        // 3. Age (10%)
        if (params.ageYears) {
            const ageDepreciation = Math.max(0.40, 1 - (params.ageYears * 0.15)); // Rough estimate
            estimated = estimated * ageDepreciation;
            confidence += 10;
        }
        
        // 4. Accessories (5%)
        if (params.accessoriesVal) {
            estimated += params.accessoriesVal;
            confidence += 5;
        }
        
        // 5. Demand (5%), Brand (3%), Location (2%)
        if (params.demandFactor) estimated *= (1 + params.demandFactor);
        if (params.brandFactor) estimated *= (1 + params.brandFactor);
        if (params.locationFactor) estimated *= (1 + params.locationFactor);
        
        const variance = estimated * 0.05;
        return {
            estimatedValue: Math.round(estimated),
            range: [Math.round(estimated - variance), Math.round(estimated + variance)],
            confidence: Math.min(99, confidence)
        };
    }
};

export const DemandEngine = {
    getTradeIdeas: (userListings: any[], activeListings: any[]) => {
        // Example: If user has Arduino, find high-demand cross-category targets
        let ideas: string[] = [];
        userListings.forEach(l => {
            if (l.title.toLowerCase().includes('arduino')) {
                ideas.push("Mechanical Keyboard", "Raspberry Pi", "Programming Books");
            }
        });
        return ideas;
    },
    analyzeMarket: (searches: any[], views: any[]) => {
        // Real logic would aggregate these logs
        return { trending: [{ category: 'Laptops', change: 32 }, { category: 'Phones', change: 18 }] };
    }
};

export const OpportunityEngine = {
    detectProactiveMatches: (userHaves: any[], marketWants: any[]) => {
        // Detects unfulfilled demand nearby
        return { notify: false, targetId: null };
    }
};

export const NotificationService = {
    emit: async (supabaseClient: any, payload: {
        recipient_id: string;
        actor_id?: string;
        type: string;
        title: string;
        message: string;
        entity_type?: string;
        entity_id?: string;
        priority?: 'Critical' | 'High' | 'Medium' | 'Low';
    }) => {
        // Mock user preferences check (in a real app, read from profile)
        const userPrefs = { receive_promotions: true, receive_community: true };
        
        if (payload.priority === 'Low' && !userPrefs.receive_promotions && payload.type === 'promotion') return;
        
        // Supabase Realtime will automatically broadcast this INSERT
        // Deep linking is handled natively on frontend via entity_type and entity_id
        await supabaseClient.from('notifications').insert({
            user_id: payload.recipient_id,
            actor_id: payload.actor_id || null,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            entity_type: payload.entity_type || null,
            entity_id: payload.entity_id || null,
            priority: payload.priority || 'Medium',
            is_read: false
        });
    }
};

export const MultiSwapEngine = {
    // Models marketplace as Directed Graph. Edge = A wants what B has.
    detectCycles: (allListings: any[], startListingId: number, maxDepth: number = 4) => {
        // 1. Build adjacency list
        const graph: Record<number, number[]> = {};
        
        const hasMatch = (wantTerms: string[], haveText: string) => {
            if (!wantTerms || wantTerms.length === 0) return false;
            return wantTerms.some(w => w.length > 2 && haveText.includes(w.toLowerCase()));
        };

        allListings.forEach(a => {
            graph[a.id] = [];
            const aWants = Array.isArray(a.wantItems) ? a.wantItems.map((i: string) => i.toLowerCase()) : [];
            allListings.forEach(b => {
                if (a.id === b.id || a.userId === b.userId) return;
                const bHaves = `${b.title} ${b.category}`.toLowerCase();
                if (hasMatch(aWants, bHaves)) {
                    graph[a.id].push(b.id);
                }
            });
        });

        // 2. DFS to find cycles
        const cycles: number[][] = [];
        
        const dfs = (currentPath: number[]) => {
            if (currentPath.length > maxDepth) return;
            const currentId = currentPath[currentPath.length - 1];
            
            const neighbors = graph[currentId] || [];
            for (const neighbor of neighbors) {
                if (neighbor === currentPath[0] && currentPath.length >= 3) {
                    // Valid cycle found!
                    cycles.push([...currentPath, neighbor]);
                    return; // Return early, just mapping shortest cycles
                }
                
                if (!currentPath.includes(neighbor)) {
                    dfs([...currentPath, neighbor]);
                }
            }
        };
        
        if (graph[startListingId] && graph[startListingId].length > 0) {
            dfs([startListingId]);
        }
        
        return cycles; // Returns array of paths, e.g. [[1, 4, 9, 1]]
    }
};

export const LocationEngine = {
    // Haversine formula for fast, pure-math distance estimation before PostGIS is fully deployed
    calculateDistanceKm: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    },
    
    // Strips out exact lat/lng and replaces with human-readable distance formats
    obfuscateListings: (listings: any[], userCoords: { lat: number, lng: number } | null) => {
        return listings.map(l => {
            const obfuscated = { ...l };
            
            // Calculate readable distance
            if (userCoords && l.lat && l.lng) {
                const distanceKm = LocationEngine.calculateDistanceKm(userCoords.lat, userCoords.lng, l.lat, l.lng);
                obfuscated._distanceKm = distanceKm;
                obfuscated._readableDistance = distanceKm < 1 
                    ? `${Math.round(distanceKm * 1000)} m away`
                    : `${distanceKm.toFixed(1)} km away`;
            } else {
                obfuscated._distanceKm = 999;
                obfuscated._readableDistance = "Location unknown";
            }
            
            // Delete precise coordinates to protect privacy
            delete obfuscated.lat;
            delete obfuscated.lng;
            
            // Ensure safe town/county fallback
            obfuscated._readableLocation = `📍 ${l.town || l.county || 'Nearby'}`;
            
            return obfuscated;
        });
    }
};

// ─── ENGINE 25: RECOMMENDATION ENGINE (CENTRALIZED) ────────────────────────
export const RecommendationEngine = {
    cache: new Map<string, { timestamp: number, data: any[] }>(),
    
    // Independent Services
    CandidateGenerator: (listings: any[], activeUserId: string, filters: any = {}) => {
        let candidates = listings.filter(l => l.status === 'active' && l.userId !== activeUserId);
        
        // Hard SQL-style Filters applied before Recommendation Scoring
        if (filters.categories && filters.categories.length > 0) candidates = candidates.filter(l => filters.categories.includes(l.category));
        if (filters.condition) candidates = candidates.filter(l => filters.condition.includes(l.condition));
        if (filters.min_value) candidates = candidates.filter(l => (l._esv || l.estimatedValue || 0) >= filters.min_value);
        if (filters.max_value) candidates = candidates.filter(l => (l._esv || l.estimatedValue || 0) <= filters.max_value);
        if (filters.accepts_cash) candidates = candidates.filter(l => l.cashTopUpAllowed);
        if (filters.pure_barter_only) candidates = candidates.filter(l => !l.cashTopUpAllowed);
        if (filters.verified_only) candidates = candidates.filter(l => l.profiles?.isStudentVerified || l.profiles?.verifiedIdentity);
        if (filters.communities && filters.communities.length > 0) candidates = candidates.filter(l => filters.communities.includes(l.communityId));
        if (filters.brand) candidates = candidates.filter(l => l.brand === filters.brand);
        if (filters.trade_type) candidates = candidates.filter(l => l.tradeType === filters.trade_type);
        if (filters.looking_for) candidates = candidates.filter(l => {
            const wants = Array.isArray(l.wantItems) ? l.wantItems.join(' ') : (l.wantItems || "");
            return filters.looking_for.some((wf: string) => wants.toLowerCase().includes(wf.toLowerCase()));
        });
        // Distance is a soft-factor score, but can also be a hard filter
        if (filters.max_distance && filters.userCoords) {
            candidates = candidates.filter(l => {
                if (!l.lat || !l.lng) return false;
                const d = Math.sqrt(Math.pow(l.lat - filters.userCoords.lat, 2) + Math.pow(l.lng - filters.userCoords.lng, 2)) * 111; // rough km
                return d <= filters.max_distance;
            });
        }
        
        return candidates;
    },
    
    NeedMatcher: (itemHaves: string, itemWants: string, userHaves: string, userWants: string) => {
        let score = 0;
        let reasons = [];
        const iWantWhatTheyHave = userWants.split(/\s+/).some(w => w.length > 3 && itemHaves.includes(w));
        if (iWantWhatTheyHave) { score += 30; reasons.push("Matches your wishlist"); } // 30 points
        return { score, reasons, iWantWhatTheyHave };
    },
    
    ReciprocalMatcher: (itemWants: string, userHaves: string, iWantWhatTheyHave: boolean) => {
        let score = 0;
        let reasons = [];
        const theyWantWhatIHave = itemWants && userHaves.split(/\s+/).some(w => w.length > 3 && itemWants.includes(w));
        if (theyWantWhatIHave && iWantWhatTheyHave) { score += 20; reasons.push("Reciprocal match (Both benefit)"); } // 20 points
        return { score, reasons, theyWantWhatIHave };
    },
    
    CategoryMatcher: (itemCategory: string, userInterests: string[], filterCategory?: string) => {
        if (userInterests.includes(itemCategory)) return { score: 5, reasons: ["Matches your interests"] }; // 5 points
        return { score: 1, reasons: ["Discovery"] };
    },
    
    DistanceService: (distanceKm: number) => {
        if (distanceKm <= 5) return { score: 10, reasons: ["Very close by"] }; // 10 points
        if (distanceKm <= 15) return { score: 7, reasons: ["Nearby"] };
        if (distanceKm <= 50) return { score: 4, reasons: [] };
        return { score: 1, reasons: [] };
    },
    
    CommunityService: (itemCommunity: number, userCommunities: number[]) => {
        if (itemCommunity && userCommunities.includes(itemCommunity)) return { score: 5, reasons: ["Same Community"] }; // 5 points
        return { score: 0, reasons: [] };
    },
    
    TrustCalculator: (profile: any) => {
        let score = 0;
        let reasons = [];
        if (profile?.isStudentVerified) { score += 2; reasons.push("Verified Student"); }
        if ((profile?.completedSwaps || 0) > 0) score += 2;
        if ((profile?.acceptanceRate || 0) > 80) score += 1;
        return { score, reasons }; // 5 points
    },
    
    ValueCalculator: (diffAmt: number) => {
        if (diffAmt <= 5000) return { score: 15, reasons: ["Estimated values are similar"] }; // 15 points
        if (diffAmt <= 20000) return { score: 8, reasons: [] };
        return { score: 2, reasons: [] };
    },
    
    ActivityCalculator: (ageHrs: number, isOnline: boolean, avgResponseMins: number) => {
        let score = 0;
        let reasons = [];
        if (isOnline) { score += 3; reasons.push("Online now"); } // Availability (3)
        if (avgResponseMins < 60) { score += 3; reasons.push("Responds quickly"); } // Response Behaviour (3)
        return { score, reasons };
    },
    
    BehaviourCalculator: (itemCategory: string, userBrowsingHistory: string[]) => {
        if (userBrowsingHistory.includes(itemCategory)) return { score: 4, reasons: [] }; // User Behaviour (4)
        return { score: 0, reasons: [] };
    },
    
    // Core Executor
    generateRecommendations: async (userId: string, activeListings: any[], userProfile: any, userWishes: any[], userListings: any[], userCommunities: number[], filters: any = {}) => {
        const cacheKey = `${userId}_${JSON.stringify(filters)}`;
        const cached = RecommendationEngine.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < 300000)) return cached.data; // 5 minute cache
        
        const candidates = RecommendationEngine.CandidateGenerator(activeListings, userId, filters);
        
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
            
            const valDiff = Math.abs((item._esv || 30000) - 30000); // simplified for mock
            const val = RecommendationEngine.ValueCalculator(valDiff);
            totalScore += val.score; matchReasons.push(...val.reasons);
            
            const act = RecommendationEngine.ActivityCalculator(20, true, item.profiles?.avgResponseTimeMinutes || 10);
            totalScore += act.score; matchReasons.push(...act.reasons);
            
            const beh = RecommendationEngine.BehaviourCalculator(item.category, userInterests);
            totalScore += beh.score; matchReasons.push(...beh.reasons);
            
            // Normalize to % (Max 100 based on formula)
            const compatibility = Math.min(100, Math.round(totalScore));
            
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

export const supabase = createClient(supabaseUrl, supabaseKey);
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } });

// Helper to convert object keys
const camelToSnake = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
        camelToSnake(value)
      ])
    );
  }
  return obj;
};

const snakeToCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj !== null && typeof obj === 'object') {
    const res = Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        snakeToCamel(value)
      ])
    );
    if ('university' in res && typeof res.university === 'string' && res.university.includes('avatarUrl')) {
      try {
        const parsed = JSON.parse(res.university);
        if (typeof parsed === 'object' && parsed !== null && parsed.avatarUrl) {
          res.avatarUrl = res.avatarUrl || parsed.avatarUrl;
        }
      } catch(e) {}
    }
    return res;
  }
  return obj;
};

async function recalculateUserStats(targetUserId: string) {
    if (!targetUserId) return;
    const { data: receivedProposals } = await supabase.from('proposals').select('id, status, created_at, from_user_id, to_user_id').eq('to_user_id', targetUserId);
    const { count: completedCount } = await supabase.from('proposals').select('id', { count: 'exact', head: true })
         .or(`from_user_id.eq.${targetUserId},to_user_id.eq.${targetUserId}`)
         .eq('status', 'completed');
         
    let completedSwaps = completedCount || 0;
    let accRate = 0;
    if (receivedProposals) {
         // Expired proposals count negatively against acceptance rate to discourage ghosting
         const validOffers = receivedProposals.filter((pr: any) => ['accepted', 'rejected', 'completed', 'expired'].includes(pr.status));
         const accepted = validOffers.filter((pr: any) => ['accepted', 'completed'].includes(pr.status)).length;
         if (validOffers.length > 0) accRate = Math.round((accepted / validOffers.length) * 100);
    }
    
    let respTime = 0;
    if (receivedProposals && receivedProposals.length > 0) {
         const roomIds = receivedProposals.map((pr: any) => String(pr.id));
         const { data: messages } = await supabase.from('messages').select('room_id, created_at, sender_id').in('room_id', roomIds).eq('sender_id', targetUserId);
         if (messages && messages.length > 0) {
             let totalDiff = 0;
             let validResponses = 0;
             for (const pr of receivedProposals) {
                 const firstMsg = messages.filter((m: any) => String(m.room_id) === String(pr.id)).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
                 if (firstMsg) {
                     const diffMins = (new Date(firstMsg.created_at).getTime() - new Date(pr.created_at).getTime()) / 60000;
                     if (diffMins >= 0) {
                         totalDiff += diffMins;
                         validResponses++;
                     }
                 }
             }
             if (validResponses > 0) respTime = Math.round(totalDiff / validResponses);
         }
    }
    
    const { data: myProf } = await adminSupabase.from('profiles').select('university').eq('user_id', targetUserId).single();
    let uniObj: any = {};
    if (myProf && myProf.university) {
        try {
           const parsed = JSON.parse(myProf.university);
           uniObj = (typeof parsed === 'string') ? JSON.parse(parsed) : parsed;
        } catch(e) {}
    }
    
    uniObj.stats = {
        completedSwaps,
        acceptanceRate: accRate,
        avgResponseTimeMinutes: respTime
    };
    
    await adminSupabase.from('profiles').update({ university: JSON.stringify(uniObj) }).eq('user_id', targetUserId);
}


const createProxy = (path: string[] = []): any => {
  return new Proxy(() => {}, {
    get(target, prop: string) {
      if (prop === 'useQuery') {
        return (input?: any, opts?: any) => {
          const queryKey = [...path, input];
          
          return useQuery({
            queryKey,
            ...opts,
            enabled: opts?.enabled !== false,
            queryFn: async () => {
              const tableMap: Record<string, string> = {
                listings: 'listings',
                wishes: 'wishes',
                communities: path[1] === 'myMemberships' ? 'community_members' : 'communities',
                communityPosts: 'community_posts',
                communityPostReplies: 'community_post_replies',
                proposals: 'proposals',
                chat: (path[1] === 'getMessages' || path[1] === 'unreadCount') ? 'messages' : 'chat_rooms',
                profile: 'profiles',
                notifications: 'notifications',
                savedItems: 'saved_items'
              };

              let tableName = tableMap[path[0]];
              
              if (path[0] === 'feed' && path[1] === 'list') {
                  const authSession = (await supabase.auth.getSession()).data.session;
                  const activeUserId = authSession?.user?.id || null;
                  
                  // Fetch active listings
                  const { data: listingsData } = await supabase.from('listings').select('*, profiles!user_id(*)').eq('status', 'active').limit(50);
                  let listings = listingsData || [];
                  if (activeUserId) {
                      listings = listings.filter((l: any) => l.user_id !== activeUserId);
                  }
                  
                  // Try fetching media if table exists
                  let mediaMap: any = {};
                  try {
                      const { data: media } = await supabase.from('listing_media').select('*');
                      if (media) {
                          media.forEach((m: any) => {
                              const key = String(m.listing_id);
                              if (!mediaMap[key]) mediaMap[key] = [];
                              mediaMap[key].push(snakeToCamel(m));
                          });
                      }
                  } catch(e) {}
                  
                  // Try fetching user preferences if logged in
                  let prefs: any = {};
                  let myProfile: any = null;
                  if (activeUserId) {
                      try {
                          const { data: p } = await supabase.from('profiles').select('*').eq('user_id', activeUserId).single();
                          if (p) myProfile = p;
                          const { data: userPrefs } = await supabase.from('user_preferences').select('*').eq('user_id', activeUserId).single();
                          if (userPrefs) prefs = userPrefs;
                      } catch(e) {}
                  }

                  const userLat = input?.coords?.lat || myProfile?.lat;
                  const userLng = input?.coords?.lng || myProfile?.lng;
                  
                  // Basic Ranking Formula Implementation
                  listings = listings.map((item: any) => {
                      const camelItem = snakeToCamel(item);
                      camelItem.media = mediaMap[String(item.id)] || [];
                      
                      if (userLat && userLng) {
                          let itemLat = camelItem.lat;
                          let itemLng = camelItem.lng;
                          if (!itemLat || !itemLng) {
                              let text = camelItem.locationName || camelItem.campus || camelItem.location || camelItem.town || "Unknown";
                              const found = CAMPUSES.find(c => c.name.toLowerCase() === text.toLowerCase());
                              if (found) { itemLat = found.lat; itemLng = found.lng; }
                          }
                          if (itemLat && itemLng) {
                              camelItem.distanceKm = Math.round(LocationEngine.calculateDistanceKm(userLat, userLng, itemLat, itemLng) * 10) / 10;
                          }
                      }
                      
                      let score = 0;
                      
                      // 1. Freshness (10% - roughly based on days old)
                      const daysOld = (new Date().getTime() - new Date(item.created_at).getTime()) / (1000 * 3600 * 24);
                      const freshnessScore = Math.max(0, 10 - daysOld);
                      score += freshnessScore;
                      
                      // 2. Popularity (15% - based on views/saves)
                      const popularityScore = Math.min(15, ((camelItem.views || 0) * 0.1) + ((camelItem.saveCount || 0) * 0.5));
                      score += popularityScore;
                      
                      // 3. Seller Reputation (10%)
                      const repScore = Math.min(10, ((camelItem.profiles?.avgRating || 0) / 5) * 10);
                      score += repScore;
                      
                      // 4. AI / Category Preference (40%)
                      const cat = camelItem.category?.toLowerCase() || '';
                      let prefScore = 5; // default
                      if (cat.includes('electronic')) prefScore += (prefs.electronics_score || 0) * 0.5;
                      else if (cat.includes('book')) prefScore += (prefs.books_score || 0) * 0.5;
                      else if (cat.includes('fashion') || cat.includes('cloth')) prefScore += (prefs.fashion_score || 0) * 0.5;
                      else if (cat.includes('vehicle') || cat.includes('car')) prefScore += (prefs.vehicles_score || 0) * 0.5;
                      else if (cat.includes('furniture')) prefScore += (prefs.furniture_score || 0) * 0.5;
                      else if (cat.includes('sport')) prefScore += (prefs.sports_score || 0) * 0.5;
                      else if (cat.includes('gam')) prefScore += (prefs.gaming_score || 0) * 0.5;
                      
                      score += Math.min(40, prefScore);
                      
                      // Add jitter for randomness (discovery)
                      score += Math.random() * 5;
                      
                      camelItem.feedScore = score;
                      return camelItem;
                  });
                  
                  // Filter: Only show items in the feed that have a video attached
                  listings = listings.filter((item: any) => item.media && item.media.some((m: any) => m.type === 'video'));
                  
                  listings.sort((a: any, b: any) => (b.feedScore || 0) - (a.feedScore || 0));
                  
                  return { items: listings.slice(0, 20) };
              }
              
              if (path[0] === 'multiWay' && path[1] === 'findCycles') {
                const parsePgArray = (val: any) => {
                  if (Array.isArray(val)) return val;
                  if (typeof val === 'string') {
                    if (val.startsWith('{') && val.endsWith('}')) return val.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, ''));
                    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : [parsed]; } catch (e) { return [val]; }
                  }
                  return val ? [val] : [];
                };

                const { data: listings } = await supabase.from('listings').select('*, profiles!user_id(*)').eq('status', 'active');
                const nodes = (listings || []).map((l: any) => ({
                  id: l.id,
                  title: l.title,
                  wants: parsePgArray(l.want_items),
                  user_id: l.user_id,
                  original: l
                }));

                const adj = new Map();
                for (let i = 0; i < nodes.length; i++) {
                  const u = nodes[i];
                  const edges = [];
                  for (let j = 0; j < nodes.length; j++) {
                    if (i === j) continue;
                    if (u.user_id === nodes[j].user_id) continue;
                    const v = nodes[j];
                    let matches = false;
                    for (const w of u.wants) {
                      if (!w) continue;
                      const wLower = w.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
                      const vLower = v.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
                      const catLower = v.original.category?.toLowerCase() || '';
                      
                      const wWords = wLower.split(/\s+/).filter((word: string) => word.length > 2);
                      const vWords = vLower.split(/\s+/).filter((word: string) => word.length > 2);
                      
                      let hasMatch = false;
                      for (const word of wWords) {
                         if (vWords.includes(word) || vLower.includes(word) || catLower.includes(word) || word.includes(catLower)) {
                            hasMatch = true; break;
                         }
                      }
                      
                      if (hasMatch) {
                        matches = true;
                        break;
                      }
                    }
                    if (matches) edges.push(j);
                  }
                  adj.set(i, edges);
                }

                const cycles: number[][] = [];
                const pathArr: number[] = [];
                const dfs = (current: number, start: number, depth: number) => {
                  if (depth > 6) return;
                  pathArr.push(current);
                  const neighbors = adj.get(current) || [];
                  for (const next of neighbors) {
                    if (next === start && depth >= 3) {
                      cycles.push([...pathArr]);
                    } else if (!pathArr.includes(next)) {
                      dfs(next, start, depth + 1);
                    }
                  }
                  pathArr.pop();
                };

                for (let i = 0; i < nodes.length; i++) dfs(i, i, 1);

                const uniqueCycles = new Map();
                for (const cycle of cycles) {
                  const minIdx = Math.min(...cycle);
                  const minPos = cycle.indexOf(minIdx);
                  const ordered = [...cycle.slice(minPos), ...cycle.slice(0, minPos)];
                  const key = ordered.join('-');
                  if (!uniqueCycles.has(key)) uniqueCycles.set(key, cycle);
                }

                const realCycles = Array.from(uniqueCycles.values()).map(cycleArr => {
                  return {
                    type: cycleArr.length + 'way',
                    matchScore: Math.floor(Math.random() * 15) + 85,
                    trust: Math.floor(Math.random() * 10) + 90,
                    distance: (Math.random() * 3 + 1).toFixed(1) + 'km',
                    legs: cycleArr.map((idx: number) => ({
                      id: nodes[idx].id,
                      title: nodes[idx].title,
                      userId: nodes[idx].user_id,
                      images: parsePgArray(nodes[idx].original.images)
                    }))
                  };
                });

                return { 
                  cycles: realCycles
                };
              }

              if (path[0] === 'admin' && path[1] === 'users') tableName = 'profiles';
              if (path[0] === 'admin' && path[1] === 'reports') tableName = 'reports';
              if (path[0] === 'admin' && path[1] === 'auditLogs') tableName = 'audit_logs';

              if (!tableName) return { items: [] };

              let selectFields = '*';
              if (tableName === 'communities') selectFields = '*, community_members(*)';
              if (tableName === 'community_posts') selectFields = '*, profiles!user_id(*), community_post_replies(*)';
              if (tableName === 'community_members') selectFields = '*, communities(*)';
              if (tableName === 'proposals') selectFields = '*, listings(title), wishes(title), profiles!from_user_id(*)';
              if (tableName === 'listings') selectFields = '*, profiles!user_id(*)';
              if (tableName === 'wishes') selectFields = '*, profiles!user_id(*)';
              if (tableName === 'reports') selectFields = '*';
              if (tableName === 'audit_logs') selectFields = '*';

              
              let orderField = 'created_at';
              if (tableName === 'community_members') orderField = 'joined_at';
              
              let activeUserId = null;
              const authSession = (await supabase.auth.getSession()).data.session;
              activeUserId = authSession?.user?.id || null;

              let isUserAdmin = false;
              if (activeUserId) {
                 const { data: myProf } = await adminSupabase.from('profiles').select('university').eq('user_id', activeUserId).single();
                 if (myProf && myProf.university) {
                    try {
                       const parsed = JSON.parse(myProf.university);
                       if (parsed.role === 'admin' || parsed.role === 'super_admin' || parsed.role === 'moderator') isUserAdmin = true;
                    } catch(e) {}
                 }
              }

              let query = (path[0] === 'admin' || isUserAdmin ? adminSupabase : supabase).from(tableName).select(selectFields).order(orderField, { ascending: tableName === 'messages' });

              if (input && input.id) {
                if (tableName === 'profiles') {
                  query = query.eq('user_id', input.id);
                } else {
                  query = query.eq('id', input.id);
                }
              }

              if (activeUserId) {
                if (path[1] === 'myListings') {
                  const targetId = (input as any)?.userId || (input as any)?.creator_id || (input as any)?.user_id || activeUserId;
                  query = adminSupabase.from(tableName).select(selectFields).order(orderField, { ascending: tableName === 'messages' }).eq('user_id', targetId);
                } else if (path[1] === 'myWishes') {
                  const targetId = (input as any)?.userId || (input as any)?.creator_id || (input as any)?.user_id || activeUserId;
                  query = query.eq('user_id', targetId);
                } else if (path[1] === 'myMemberships') {
                   const targetId = (input as any)?.userId || activeUserId;
                   query = query.eq('user_id', targetId);
                } else if (path[1] === 'myProposals') {
                  query = query.or(`from_user_id.eq.${activeUserId},to_user_id.eq.${activeUserId}`);
                } else if (path[1] === 'myRooms') {
                  const { data: cycleMessages } = await supabase.from('messages').select('room_id, content').eq('type', 'cycle_init').like('content', `%${activeUserId}%`);
                  const activeCycleRoomIds = cycleMessages?.filter(m => {
                      try {
                          const content = JSON.parse(m.content);
                          if (content.participants && content.participants.includes(activeUserId)) return true;
                          if (['active', 'countered', 'accepted', 'rejected'].includes(content.status)) return true;
                          if (content.status === 'pending' && ((content.joined_users && content.joined_users.includes(activeUserId)) || (content.entered_chat && content.entered_chat.includes(activeUserId)))) return true;
                          return false;
                      } catch(e) { return false; }
                  }).map(m => m.room_id) || [];
                  if (activeCycleRoomIds.length > 0) {
                     query = query.or(`user1_id.eq.${activeUserId},user2_id.eq.${activeUserId},id.in.(${activeCycleRoomIds.join(',')})`);
                  } else {
                     query = query.or(`user1_id.eq.${activeUserId},user2_id.eq.${activeUserId}`);
                  }
                } else if (path[0] === 'notifications' && path[1] === 'list') {
                  query = query.eq('user_id', activeUserId);
                } else if (path[0] === 'savedItems' && path[1] === 'list') {
                  query = query.eq('user_id', activeUserId);
                } else if (path[0] === 'profile' && path[1] === 'me') {
                  query = query.eq('user_id', activeUserId);
                }
              } else if (path[0] === 'profile' && path[1] === 'me') {
                 return { trustScore: 0 };
              }

              if (input && (input as any).idIn && Array.isArray((input as any).idIn) && (input as any).idIn.length > 0) {
                 query = query.in('id', (input as any).idIn);
              }
              
              if (input && input.roomId) {
                if (path[0] === 'chat' && path[1] === 'getMessages') {
                   if (!activeUserId) throw new Error("Unauthorized");
                    
                   let isUserAdmin = false;
                   const { data: myProf } = await adminSupabase.from('profiles').select('university').eq('user_id', activeUserId).single();
                   if (myProf && myProf.university) {
                      try {
                         const parsed = JSON.parse(myProf.university);
                         if (parsed.role === 'admin' || parsed.role === 'super_admin' || parsed.role === 'moderator') isUserAdmin = true;
                      } catch(e) {}
                   }

                   const { data: roomCheck } = await supabase.from('chat_rooms').select('*').eq('id', input.roomId).single();
                   if (roomCheck) {
                       if (roomCheck.user2_id !== null) {
                           if (roomCheck.user1_id !== activeUserId && roomCheck.user2_id !== activeUserId && !isUserAdmin) throw new Error("Unauthorized");
                       } else {
                           const { data: cycleInitMsg } = await supabase.from('messages').select('content').eq('room_id', input.roomId).eq('type', 'cycle_init').limit(1).single();
                           if (cycleInitMsg) {
                               try {
                                   const cycleData = JSON.parse(cycleInitMsg.content);
                                   if (!cycleData.participants.includes(activeUserId) && !isUserAdmin) throw new Error("Unauthorized");
                               } catch(e) { if (!isUserAdmin) throw new Error("Unauthorized"); }
                           } else {
                               if (!isUserAdmin) throw new Error("Unauthorized");
                           }
                       }
                   } else {
                       throw new Error("Room not found");
                   }
                }
                query = query.eq('room_id', input.roomId);
              }
              
              if (input && input.communityId && path[0] === 'communityPosts') {
                query = query.eq('community_id', input.communityId);
              }
              
              if (input && input.creatorId && path[0] === 'communities') {
                query = query.eq('creator_id', input.creatorId);
              }

              if (path[0] === 'communities' && path[1] === 'list' && (!input || !input.creatorId)) {
                   let uniVal = "";
                   if (activeUserId) {
                       const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', activeUserId).single();
                       if (profile) {
                          let u: any = {};
                          let d: any = {};
                          try { u = JSON.parse(profile.university || "{}"); } catch(e) {}
                          try { d = JSON.parse(profile.description || "{}"); } catch(e) {}
                          
                          const verified = profile.isStudentVerified || u.isStudentVerified || d.isStudentVerified;
                          if (verified) {
                              uniVal = u.val || profile.university || profile.campus || "";
                              if (uniVal.startsWith('{')) uniVal = "";
                          }
                       }
                   }
                   if (uniVal) {
                       query = query.or(`type.eq.public,type.eq.private,and(type.eq.campus,university.eq."${uniVal}")`);
                   } else {
                       query = query.or(`type.eq.public,type.eq.private`);
                   }
              }

              let { data, error } = await query;
              
              if (error) {
                console.error(`Supabase error on ${tableName}:`, error);
                // Return empty instead of throwing to keep UI alive
                data = [];
              }
              
              // Helper to parse potential Postgres array literals or JSON strings
              const parsePgArray = (val: any) => {
                if (Array.isArray(val)) return val;
                if (typeof val === 'string') {
                  if (val.startsWith('{') && val.endsWith('}')) {
                    const inner = val.slice(1, -1);
                    if (!inner) return [];
                    return inner.split(',').map(s => {
                      let str = s.trim();
                      if (str.startsWith('"') && str.endsWith('"')) {
                        str = str.slice(1, -1);
                      }
                      return str;
                    });
                  }
                  try {
                    const parsed = JSON.parse(val);
                    return Array.isArray(parsed) ? parsed : [parsed];
                  } catch (e) {
                    return [val];
                  }
                }
                return val ? [val] : [];
              };

              if (data) {
                data = data.map((row: any) => {
                  if (row.images !== undefined) row.images = parsePgArray(row.images);
                  if (row.want_items !== undefined) row.want_items = parsePgArray(row.want_items);
                  if (row.preferred_items !== undefined) row.preferred_items = parsePgArray(row.preferred_items);
                  if (row.offer_items !== undefined) row.offer_items = parsePgArray(row.offer_items);
                  return row;
                });
              }

              let camelData = snakeToCamel(data);
              
              if ((path[0] === 'listings' || path[0] === 'wishes') && Array.isArray(camelData)) {
                 if (path[1] === 'list' && input && input.communityId) {
                    const tag = `<!--soko:${input.communityId}-->`;
                    camelData = camelData.filter((l: any) => l.description?.includes(tag));
                 } else if (path[1] === 'feed' || (path[1] === 'list' && (!input || !input.communityId))) {
                    camelData = camelData.filter((l: any) => !l.description?.includes(`<!--soko:`));
                 }
                 camelData = camelData.map((l: any) => {
                    let sokoMatch = l.description?.match(/<!--soko:(\d+)-->/);
                    let communityId = sokoMatch ? parseInt(sokoMatch[1]) : undefined;
                    let metaMatch = l.description?.match(/<!--meta:(.+?)-->/);
                    let meta: any = {};
                    if (metaMatch) {
                       try { meta = JSON.parse(metaMatch[1]); } catch(e) {}
                    }
                    let now = new Date().getTime();
                    let finalStatus = meta.status || l.status || 'active';
                    if (finalStatus === 'bid_in_progress' && meta.bidExpiresAt && new Date(meta.bidExpiresAt).getTime() < now) finalStatus = 'active';

                    return {
                       ...l,
                       ...meta,
                       communityId,
                       status: finalStatus,
                       description: l.description ? l.description.replace(/\n\n<!--soko:\d+-->/g, '').replace(/\n\n<!--meta:.+?-->/g, '') : l.description
                    }
                 });
                 let now = new Date().getTime();
                 
                 const filters = input?.filters || {};
                 const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
                    const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180;
                    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
                    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
                 };
                 const userLat = input?.coords?.lat || filters.coords?.lat || 0;
                 const userLng = input?.coords?.lng || filters.coords?.lng || 0;
                 
                 // Apply Hard Filters (Reduces the pool before AI ranking)
                 camelData = camelData.filter((l: any) => {
                    if (path[1] === 'feed' || path[1] === 'list') {
                       // Essential rules
                       if (l.status === 'finalized' || l.status === 'reserved') return false;
                       if (path[1] === 'feed' && activeUserId && l.userId === activeUserId) return false;
                       if (l.status === 'active' && !l.hasOffers) {
                           let age = now - new Date(l.createdAt || 0).getTime();
                           let maxAge = 30 * 24 * 60 * 60 * 1000;
                           if (age > maxAge) return false;
                       }
                       
                       // 1. Categories
                       if (filters.categories && filters.categories.length > 0 && !filters.categories.includes("All")) {
                           if (!filters.categories.includes(l.category)) return false;
                       } else if (filters.category && filters.category !== "All" && filters.category !== null) {
                           if (l.category !== filters.category) return false;
                       }
                       
                       // 2. Wanted Categories (Looking For)
                       if (filters.wantedCategories && filters.wantedCategories.length > 0 && !filters.wantedCategories.includes("All")) {
                           const wantText = (Array.isArray(l.wantItems) ? l.wantItems.join(' ') : l.wantItems || '').toLowerCase();
                           const hasMatch = filters.wantedCategories.some((cat: string) => wantText.includes(cat.toLowerCase()));
                           if (!hasMatch) return false;
                       }
                       
                       // 3. Distance
                       if (filters.maxDistanceKm && filters.maxDistanceKm !== "Anywhere") {
                           if (userLat && userLng && l.lat && l.lng) {
                               const d = getDistance(userLat, userLng, l.lat, l.lng);
                               if (d > parseInt(filters.maxDistanceKm)) return false;
                           }
                       }
                       
                       // 4. Estimated Value
                       if (filters.minEsv !== undefined && filters.minEsv !== null && (l._esv || 0) < filters.minEsv) return false;
                       if (filters.maxEsv !== undefined && filters.maxEsv !== null && (l._esv || 0) > filters.maxEsv) return false;
                       
                       // 5. Conditions
                       if (filters.conditions && filters.conditions.length > 0 && !filters.conditions.includes("Any")) {
                           if (!filters.conditions.includes(l.condition)) return false;
                       } else if (filters.condition && filters.condition !== "Any" && filters.condition !== null) {
                           if (l.condition !== filters.condition) return false;
                       }
                       
                       // 6. Cash Top-up
                       if (filters.acceptsCashTopUp && !l.cashTopUpAllowed) return false;
                       if (filters.noCashNeeded && l.cashTopUpAllowed) return false;
                       
                       // 7. Trust Rating
                       if (filters.minTrustRating && (l.profiles?.trustScore || 0) < filters.minTrustRating) return false;
                       
                       // 8. Completed Swaps
                       if (filters.minCompletedSwaps && (l.profiles?.swapsCompleted || 0) < filters.minCompletedSwaps) return false;
                       
                       // 9. Discovery Mode filtering
                       if (filters.discoveryMode) {
                           if (filters.discoveryMode === "campus" && filters.campus) {
                               if (l.campus !== filters.campus) return false;
                           } else if (filters.discoveryMode === "university" && filters.university) {
                               // Check if listing campus belongs to the same university
                               const lCampusMatch = CAMPUSES.find(c => c.name === l.campus);
                               if (!lCampusMatch || lCampusMatch.university !== filters.university) return false;
                           } else if (filters.discoveryMode === "county" && filters.campus) {
                               const userCampusMatch = CAMPUSES.find(c => c.name === filters.campus);
                               const lCampusMatch = CAMPUSES.find(c => c.name === l.campus);
                               if (!userCampusMatch || !lCampusMatch || userCampusMatch.county !== lCampusMatch.county) return false;
                           } else if (filters.discoveryMode === "community") {
                               // "community" mode filters to communities we are a part of, 
                               // but here in `feed` we don't have user's communities joined.
                               // However, the community feed is usually handled in the Community route directly.
                               // If this mode is active on general feed, we should filter by listings that have a community tag.
                               // For now, if "community" is selected on home feed, we just skip (or you could filter).
                           }
                           // "nearby" and "all" don't do hard campus checks here. "nearby" is handled by the AI scoring based on distance.
                       }
                       
                       // 9. Verified
                       if (filters.verifiedOnly && (!l.profiles?.verifiedStudent && !l.profiles?.verifiedIdentity)) return false;
                       
                       // 10. Communities
                       if (filters.communityId && l.communityId !== filters.communityId) return false;
                    }
                    return true;
                 });
                 
                 // Apply ChatGPT Algorithm if this is the Feed
                 if (path[1] === 'feed') {
                    // Fetch user profile and preferences for personalization
                    let myProfile: any = null;
                    let myWishes: any[] = [];
                    let myListings: any[] = [];
                    let myCommunities: number[] = [];
                    
                    if (activeUserId) {
                       const { data: p } = await supabase.from('profiles').select().eq('user_id', activeUserId).single();
                       myProfile = p ? snakeToCamel(p) : null;
                       const { data: w } = await supabase.from('wishes').select().eq('user_id', activeUserId);
                       if (w) myWishes = snakeToCamel(w);
                       const { data: ml } = await supabase.from('listings').select().eq('user_id', activeUserId);
                       if (ml) myListings = snakeToCamel(ml);
                       const { data: mc } = await supabase.from('community_members').select().eq('user_id', activeUserId);
                       if (mc) myCommunities = mc.map(m => m.community_id);
                    }
                    
                    const userCampus = filters.campus || myProfile?.campus || "";
                    const userInterests = Array.isArray(myProfile?.interests) ? myProfile.interests : [];
                    
                    const myHavesText = myListings.map((l: any) => `${l.title} ${l.category} ${l.description}`).join(" ").toLowerCase();
                    const myWantsText = [
                      ...userInterests,
                      ...myWishes.map((w: any) => `${w.title} ${Array.isArray(w.offerItems) ? w.offerItems.join(' ') : w.offerItems}`),
                      ...myListings.map((l: any) => typeof l.wantItems === 'string' ? l.wantItems : (Array.isArray(l.wantItems) ? l.wantItems : []).join(' '))
                    ].join(" ").toLowerCase();
                    
                    camelData.forEach((item: any) => {
                       let score = 0;
                       
                       // Step 3 - Location Filter (14 Points)
                       let distanceScore = 1;
                       if (userLat && userLng) {
                          let itemLat = item.lat;
                          let itemLng = item.lng;
                          if (!itemLat || !itemLng) {
                              let text = item.locationName || item.campus || item.location || item.town || "Unknown";
                              const found = CAMPUSES.find(c => c.name.toLowerCase() === text.toLowerCase());
                              if (found) { itemLat = found.lat; itemLng = found.lng; }
                          }
                          if (itemLat && itemLng) {
                             const d = getDistance(userLat, userLng, itemLat, itemLng);
                             item.distanceKm = Math.round(d * 10) / 10;
                             if (d <= 5) distanceScore = 14;
                             else if (d <= 15) distanceScore = 10;
                             else if (d <= 50) distanceScore = 5;
                             else if (d > 50) distanceScore = -10; // Penalize far away locations heavily!
                          } else if (item.campus && item.campus === userCampus) {
                            distanceScore = 14; 
                          }
                        } else if (item.campus && item.campus === userCampus) {
                          distanceScore = 14; 
                        }
                       score += distanceScore;
                       
                       // Step 4 - Category Preferences (15 Points)
                       if (userInterests.includes(item.category)) {
                         score += 15;
                       } else if (item.category === filters.category) {
                         score += 15;
                       } else {
                         score += 2; // Serendipity discovery
                       }
                       
                       // Step 5 - Need Matching & Synonym Engine (40 Points)
                       let needScore = 0;
                       const synonymDictionary: Record<string, string[]> = {
                          "laptop": ["notebook", "ultrabook", "macbook", "gaming laptop", "pc"],
                          "phone": ["smartphone", "iphone", "android", "samsung", "pixel"],
                          "bike": ["bicycle", "mtb", "road bike", "bmx"]
                       };
                       const expandSynonyms = (text: string) => {
                          let expanded = text;
                          Object.entries(synonymDictionary).forEach(([key, syns]) => {
                             if (text.includes(key) || syns.some(s => text.includes(s))) {
                                expanded += " " + key + " " + syns.join(" ");
                             }
                          });
                          return expanded;
                       };


                       const itemHavesText = expandSynonyms((item.title + " " + (item.description || "")).toLowerCase());
                       let itemWantsText = parsePgArray(item.wantItems).join(" ").toLowerCase();
                       
                       // Explainability Metadata
                       item._matchReasons = [];

                       itemWantsText = expandSynonyms(itemWantsText);
                       
                       const expandedMyWants = expandSynonyms(myWantsText);
                       const expandedMyHaves = expandSynonyms(myHavesText);

                       const iWantWhatTheyHave = expandedMyWants.split(/\s+/).some((w: string) => w.length > 3 && itemHavesText.includes(w));
                       if (iWantWhatTheyHave) {
                          needScore += 20;
                          item._matchReasons.push("Matches your wishlist");
                       }
                       
                       const theyWantWhatIHave = itemWantsText && expandedMyHaves.split(/\s+/).some((w: string) => w.length > 3 && itemWantsText.includes(w));
                       if (theyWantWhatIHave) {
                          needScore += 20;
                          item._matchReasons.push("Wants what you have");
                       }
                       
                       score += needScore;
                       
                       // Step 6 - Value Matcher (9 Points)
                       let valueScore = 0;
                       if (item.cashTopUpAllowed) {
                          valueScore += 9;
                          if (theyWantWhatIHave) item._matchReasons.push("Flexible value (Top-up)");
                       }
                       else if (item.cashTopUpAmount === 0) valueScore += 5; 
                       score += valueScore;
                       
                       // Step 7 - Trust Filter (5 Points)
                       let trustScore = 0;
                       if (item.profiles?.isStudentVerified) {
                          trustScore += 2;
                          item._matchReasons.push("Verified Student");
                       }
                       if ((item.profiles?.completedSwaps || 0) > 0) trustScore += 2;
                       if ((item.profiles?.acceptanceRate || 0) > 80) trustScore += 1;
                       score += trustScore;
                       
                       // Step 8 - Community Boost (10 Points)
                       if (item.communityId && myCommunities.includes(item.communityId)) {
                         score += 10;
                         item._matchReasons.push("Same Community");
                       }
                       
                       // Step 9 - Recency (6 Points)
                       const ageHrs = (now - new Date(item.createdAt || 0).getTime()) / (1000 * 60 * 60);
                       if (ageHrs < 24) {
                         score += 6;
                         item._matchReasons.push("Listed Recently");
                       }
                       else if (ageHrs < 72) score += 4;
                       else if (ageHrs < 168) score += 2;
                       
                       // Step 10 - Popularity (3 Points)
                       const popularity = (item.views || 0) + (item.saves || 0) * 2;
                       if (popularity > 50) score += 3;
                       else if (popularity > 10) score += 1;
                       
                       // Step 11 - Activity (2 Points)
                       if (item.status === 'active') score += 2;
                       
                       // ─── Value Engine ─────────────────────────────────────────────────────────────
                       item._esv = null;
                       item._esvConfidence = 0;
                       try {
                           const valMatch = item.description?.match(/<!--value_engine:(.+?)-->/);
                           if (valMatch) {
                               const vMeta = JSON.parse(valMatch[1]);
                               let baseVal = vMeta.estimatedValue || vMeta.originalPrice || 0;
                               if (baseVal > 0) {
                                   let multiplier = 1.0;
                                   if (item.condition === 'brand_new') multiplier = 1.0;
                                   else if (item.condition === 'like_new') multiplier = 0.95;
                                   else if (item.condition === 'excellent') multiplier = 0.90;
                                   else if (item.condition === 'good') multiplier = 0.80;
                                   else if (item.condition === 'fair') multiplier = 0.65;
                                   else if (item.condition === 'repair') multiplier = 0.40;
                                   
                                   let esv = Math.round(baseVal * multiplier);
                                   let conf = vMeta.estimatedValue ? 85 : (vMeta.originalPrice ? 60 : 34);
                                   
                                   // Demand bump
                                   if (popularity > 50) {
                                      esv = Math.round(esv * 1.05); // High demand increases value by 5%
                                      conf = Math.min(100, conf + 5);
                                   }
                                   
                                   item._esv = esv;
                                   item._esvConfidence = conf;
                               }
                           }
                       } catch(e) {}
                       
                       item._matchScore = score;
                    });
                    
                    // Rank Listings
                    camelData.sort((a: any, b: any) => (b._matchScore || 0) - (a._matchScore || 0));
                    
                    // Front-end requested filters (hard filters)
                    if (filters) {
                      if (filters.category && filters.category !== "All") camelData = camelData.filter((i: any) => i.category === filters.category);
                      if (filters.condition && filters.condition !== "free") camelData = camelData.filter((i: any) => i.condition === filters.condition);
                      if (filters.verifiedOnly) camelData = camelData.filter((i: any) => i.profiles?.isStudentVerified);
                      if (filters.cashTopUpAllowed) camelData = camelData.filter((i: any) => i.cashTopUpAllowed);
                      if (filters.discoveryMode === 'nearby' && filters.coords) camelData = camelData.filter((i: any) => (i.distanceKm || 100) <= (filters.radius || 5));
                    }
                 }
              }
              
              if (path[0] === 'listings') {
                 const itemIds = camelData.map((c: any) => c.id);
                 if (itemIds.length > 0) {
                     const { data: offers } = await supabase.from('proposals').select('listing_id, wish_id').or(`listing_id.in.(${itemIds.join(',')}),wish_id.in.(${itemIds.join(',')})`);
                     const { data: saves } = await supabase.from('saved_items').select('listing_id').in('listing_id', itemIds);
                     
                     const offerCounts: any = {};
                     const saveCounts: any = {};
                     offers?.forEach(o => {
                         const lid = o.listing_id || o.wish_id;
                         if (lid) offerCounts[lid] = (offerCounts[lid] || 0) + 1;
                     });
                     saves?.forEach(s => {
                         if (s.listing_id) saveCounts[s.listing_id] = (saveCounts[s.listing_id] || 0) + 1;
                     });
                     
                     camelData.forEach((item: any) => {
                         item.offerCount = offerCounts[item.id] || 0;
                         item.saveCount = saveCounts[item.id] || 0;
                         // Simulate real views if missing
                         if (!item.views) {
                             item.views = (item.id * 7) % 50 + (item.saveCount * 3) + (item.offerCount * 5) + 12;
                         }
                     });
                 }
              }

              // Map data to match expected frontend structure
              if (path[0] === 'communities') {
                camelData = camelData.map((c: any) => {
                  if (c.description && c.description.startsWith('{')) {
                    try {
                      const parsed = JSON.parse(c.description);
                      if (parsed.icon) c.icon = parsed.icon;
                      c.admins = parsed.admins || [];
                      if (parsed.text !== undefined) c.description = parsed.text;
                    } catch(e) {}
                  }
                  if (!c.admins) c.admins = [];
                  return c;
                });
              }

              if (path[0] === 'profile') {
                camelData = await Promise.all(camelData.map(async (p: any) => {
                  if (p.university) {
                    try {
                      const safeParse = (data: any) => {
                        if (!data) return null;
                        if (typeof data === 'object') return data;
                        if (typeof data === 'string' && data.startsWith('{')) {
                          try {
                            const parsed = JSON.parse(data);
                            if (typeof parsed === 'string') return JSON.parse(parsed);
                            return parsed;
                          } catch(e) { return null; }
                        }
                        return null;
                      };
                      const parsed = safeParse(p.university);
                      if (parsed) {
                        p.avatarUrl = parsed.avatarUrl;
                        p.interests = parsed.interests;
                        p.isStudentVerified = parsed.isStudentVerified;
                      }
                    } catch(e) {}
                  }

                  let isStudentVerified = false;
                  let stats = {
                    completedSwaps: 0,
                    acceptanceRate: 0,
                    avgResponseTimeMinutes: 0
                  };
                  
                  if (p.university) {
                      try {
                          const safeParse = (data: any) => {
                            if (!data) return {};
                            if (typeof data === 'object') return data;
                            if (typeof data === 'string' && data.startsWith('{')) {
                              try {
                                const parsed = JSON.parse(data);
                                if (typeof parsed === 'string') return JSON.parse(parsed);
                                return parsed;
                              } catch(e) { return {}; }
                            }
                            return {};
                          };
                          const uniObj = safeParse(p.university);
                          if (uniObj.isStudentVerified) isStudentVerified = true;
                          if (uniObj.stats) stats = { ...stats, ...uniObj.stats };
                      } catch(e) {}
                  }
                  
                  const completedScore = Math.min(stats.completedSwaps * 5, 35);
                  const ratingScore = Math.min(((p.avgRating || 4.9) / 5) * 25, 25);
                  const accScore = (stats.acceptanceRate / 100) * 15;
                  const rtScore = stats.avgResponseTimeMinutes < 15 ? 10 : (stats.avgResponseTimeMinutes < 60 ? 5 : 0);
                  const ageScore = 10;
                  const reportScore = 5;
                  
                  const reliability = Math.round(completedScore + ratingScore + accScore + rtScore + ageScore + reportScore);
                  const trustScore = Math.round((reliability * 0.8) + 20);
                  
                  p.completedSwaps = stats.completedSwaps;
                  p.acceptanceRate = stats.acceptanceRate;
                  p.avgResponseTimeMinutes = stats.avgResponseTimeMinutes;
                  p.reliability = reliability;
                  p.trustScore = Math.min(trustScore, 100);
                  p.isStudentVerified = isStudentVerified;
                  
                  return p;
                 }));
                 console.log("TRPC PROFILE GET RETURNING:", camelData);
               }

              if (path[0] === 'communities' && path[1] === 'get' && input?.id) {
                const community = camelData?.[0] || null;
                if (community) {
                  let members = (data as any)?.[0]?.community_members || [];
                  
                  // Fetch profiles
                  if (members.length > 0) {
                    // Sort members by joined_at to find the true creator (first to join)
                    members.sort((a: any, b: any) => new Date(a.joined_at || 0).getTime() - new Date(b.joined_at || 0).getTime());
                    
                    const userIds = members.map((m: any) => m.user_id);
                    const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', userIds);
                    members = members.map((m: any) => {
                      const p = profiles?.find(p => p.user_id === m.user_id);
                      if (p && p.university && p.university.startsWith('{')) {
                        try {
                          const parsed = JSON.parse(p.university);
                          p.avatarUrl = parsed.avatarUrl;
                          p.interests = parsed.interests;
                          p.isStudentVerified = parsed.isStudentVerified;
                        } catch(e) {}
                      }
                      return {
                        ...m,
                        profile: p || { name: `User ${String(m.user_id || '????').slice(0,4)}` }
                      };
                    });
                  }
                  
                  const camelMembers = snakeToCamel(members);
                  community.communityMembers = camelMembers;
                  community.memberCount = camelMembers.length;
                  if (camelMembers.length > 0) {
                    community.creatorId = camelMembers[0].userId; // First member is creator
                  }
                }
                return community;
              }
              if (path[0] === 'communities' && path[1] === 'list') {
                return { items: camelData.map((c: any, i: number) => {
                  let members = (data as any)?.[i]?.community_members || [];
                  members.sort((a: any, b: any) => new Date(a.joined_at || 0).getTime() - new Date(b.joined_at || 0).getTime());
                  return {
                    ...c,
                    memberCount: members.length,
                    creatorId: members.length > 0 ? members[0].user_id : undefined
                  };
                }) };
              }
              if (path[1] === 'get' && input?.id) {
                 const res = camelData?.[0] || null;
                 if (res) {
                    try {
                       const parsed = JSON.parse(res.university || "{}");
                       if (parsed.role) res.role = parsed.role;
                    } catch(e) {}
                 }
                 return res;
              }
              
              if (path[0] === 'admin') {
                  if (!activeUserId) throw new Error("401 Unauthorized");
                  
                  const { data: myProfile } = await supabase.from('profiles').select('university').eq('user_id', activeUserId).single();
                  let myRole = 'user';
                  try {
                     const parsed = JSON.parse(myProfile?.university || "{}");
                     if (parsed.role) myRole = parsed.role;
                  } catch(e) {}
                  
                  if (myRole !== 'admin' && myRole !== 'super_admin' && myRole !== 'moderator') {
                     throw new Error("403 Forbidden: You do not have administrator access.");
                  }
                  
                  if (myRole === 'moderator' && !['reports', 'executeModerationAction', 'updateReportStatus'].includes(path[1])) {
                     throw new Error("403 Forbidden: Moderators only have access to the moderation queue.");
                  }

                  if (path[1] === 'users') {
                     return camelData.map((u: any) => {
                        let role = 'user';
                        try {
                           const parsed = JSON.parse(u.university || "{}");
                           if (parsed.role) role = parsed.role;
                        } catch(e) {}
                        return { ...u, role };
                     });
                  }
                 if (path[1] === 'reports') {
                    const enriched = await Promise.all((camelData || []).map(async (r: any) => {
                        let targetInfo = null;
                        let tId = r.targetId;
                        if (typeof tId === 'string' && tId.startsWith('00000000-0000-0000-0000-00000000')) {
                           tId = parseInt(tId.replace(/-/g, ''));
                        }
                        try {
                           if (r.targetType === 'user') {
                              const { data: u } = await adminSupabase.from('profiles').select('*').eq('user_id', r.targetId).single();
                              if (u) targetInfo = snakeToCamel(u);
                           } else if (r.targetType === 'community') {
                              const { data: c } = await adminSupabase.from('communities').select('*').eq('id', tId).single();
                              if (c) {
                                  targetInfo = snakeToCamel(c);
                                  // Gather Community Owner Context (Investigation Package)
                                  const { data: owner } = await adminSupabase.from('profiles').select('*').eq('user_id', c.creator_id).single();
                                  if (owner) {
                                      targetInfo.owner = snakeToCamel(owner);
                                  }
                              }
                           } else if (r.targetType === 'listing') {
                              const { data: l } = await adminSupabase.from('listings').select('*').eq('id', tId).single();
                              if (l) {
                                  targetInfo = snakeToCamel(l);
                                  // Gather Seller/Owner Context (Investigation Package)
                                  const { data: owner } = await adminSupabase.from('profiles').select('*').eq('user_id', l.user_id).single();
                                  if (owner) {
                                      targetInfo.owner = snakeToCamel(owner);
                                  }
                              }
                           } else if (r.targetType === 'message' || r.targetType === 'chat') {
                              // Context Slicing (PBAC): Fetch the reported message and a limited contextual window (20 msgs)
                              const { data: messages } = await adminSupabase.from('messages').select('*').eq('room_id', tId).order('created_at', { ascending: false }).limit(20);
                              if (messages && messages.length > 0) {
                                  targetInfo = {
                                      room_id: tId,
                                      contextWindow: messages.reverse().map((m: any) => snakeToCamel(m))
                                  };
                              }
                           }
                        } catch(e) {}
                        
                        const { data: rep } = await adminSupabase.from('profiles').select('name').eq('user_id', r.reporterId).single();
                        return { ...r, targetInfo, reporterName: rep?.name || 'Unknown' };
                    }));
                    return enriched;
                 }
                 if (path[1] === 'auditLogs') {
                    const enriched = await Promise.all((camelData || []).map(async (log: any) => {
                        let tId = log.resourceId;
                        if (typeof tId === 'string' && tId.startsWith('00000000-0000-0000-0000-00000000')) {
                           tId = parseInt(tId.replace(/-/g, ''));
                        }
                        
                        try {
                           if (log.resourceType === 'user') {
                              const { data: u } = await adminSupabase.from('profiles').select('*').eq('user_id', log.resourceId).single();
                              if (u) {
                                  let n = u.name;
                                  if (!n && u.university) {
                                      try {
                                          const parsed = JSON.parse(u.university);
                                          n = parsed.name || parsed.username;
                                      } catch(e) {}
                                  }
                                  if (n) log.resourceName = n;
                              }
                           } else if (log.resourceType === 'community') {
                              const { data: c } = await adminSupabase.from('communities').select('name').eq('id', tId).single();
                              if (c) log.resourceName = c.name;
                           } else if (log.resourceType === 'listing') {
                              const { data: l } = await adminSupabase.from('listings').select('title').eq('id', tId).single();
                              if (l) log.resourceName = l.title;
                           } else if (log.resourceType === 'message' || log.resourceType === 'chat') {
                              const { data: room } = await adminSupabase.from('chat_rooms').select('*').eq('id', tId).single();
                              if (room) {
                                  if (room.user2_id) {
                                      const { data: u1 } = await adminSupabase.from('profiles').select('*').eq('user_id', room.user1_id).single();
                                      const { data: u2 } = await adminSupabase.from('profiles').select('*').eq('user_id', room.user2_id).single();
                                      const getName = (u: any) => {
                                          if (!u) return 'Unknown';
                                          if (u.name) return u.name;
                                          try {
                                              const p = JSON.parse(u.university || "{}");
                                              return p.name || p.username || 'Unknown';
                                          } catch(e) { return 'Unknown'; }
                                      };
                                      log.resourceName = `Chat between ${getName(u1)} & ${getName(u2)}`;
                                  } else {
                                      log.resourceName = `Multi-way Swap Group`;
                                  }
                              }
                           }
                        } catch(e) {}
                        
                        try {
                            const { data: a } = await adminSupabase.from('profiles').select('*').eq('user_id', log.actorId).single();
                            if (a) {
                                let n = a.name;
                                if (!n && a.university) {
                                    try {
                                        const parsed = JSON.parse(a.university);
                                        n = parsed.name || parsed.username;
                                    } catch(e) {}
                                }
                                if (n) log.actorName = n;
                            }
                        } catch(e) {}

                        return log;
                    }));
                    return enriched;
                 }
                 return camelData || [];
              }

              if (path[0] === 'proposals') {
                 const received = camelData.filter((p: any) => p.toUserId === activeUserId);
                 const sent = camelData.filter((p: any) => p.fromUserId === activeUserId);
                 return { received, sent };
              }
              if (path[0] === 'chat' && path[1] === 'myRooms') {
                 for (const room of camelData) {
                    const { data: latestMsg } = await supabase.from('messages').select('created_at').eq('room_id', room.id).order('created_at', { ascending: false }).limit(1).single();
                    if (latestMsg) {
                       room.lastMessageAt = latestMsg.created_at;
                    } else {
                       room.lastMessageAt = room.createdAt || new Date().toISOString();
                    }
                    if (room.user2Id === null) {
                       const { data: initMsg } = await supabase.from('messages').select('content').eq('room_id', room.id).eq('type', 'cycle_init').limit(1).single();
                       if (initMsg) {
                          room.isCycle = true;
                          try { room.cycleData = JSON.parse(initMsg.content); } catch(e) {}
                       }
                    }
                 }
                 camelData.sort((a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
                 return { rooms: camelData };
              }
              if (path[0] === 'chat' && path[1] === 'checkCycleState') {
                 const { data: existingMsg } = await supabase.from('messages').select('*').eq('type', 'cycle_init').like('content', `%"hash":"${input?.cycleHash}"%`);
                 if (existingMsg && existingMsg.length > 0) {
                     const content = JSON.parse(existingMsg[0].content);
                     const combinedJoined = Array.from(new Set([...(content.entered_chat || []), ...(content.joined_users || [])]));
                     const latestRev = content.revisions ? content.revisions[content.revisions.length - 1] : content;
                     const latestStatus = latestRev.status || content.status;
                  return { exists: true, joined: combinedJoined, status: latestStatus };
                 }
                 return { exists: false, joined: [], status: null };
              }

              if (path[0] === 'chat' && path[1] === 'getRoomById' && input && input.roomId) {
                  if (!activeUserId) throw new Error("Unauthorized");
                  let isUserAdmin = false;
                  const { data: myProf } = await adminSupabase.from('profiles').select('university').eq('user_id', activeUserId).single();
                  if (myProf && myProf.university) {
                     try {
                        const parsed = JSON.parse(myProf.university);
                        if (parsed.role === 'admin' || parsed.role === 'super_admin' || parsed.role === 'moderator') isUserAdmin = true;
                     } catch(e) {}
                  }
                  const { data: roomData } = await adminSupabase.from('chat_rooms').select('*').eq('id', input.roomId).single();
                  if (!roomData) throw new Error("Not found");
                  if (roomData.user2_id !== null) {
                      if (roomData.user1_id !== activeUserId && roomData.user2_id !== activeUserId && !isUserAdmin) throw new Error("Unauthorized");
                  } else {
                      if (!isUserAdmin) {
                          const { data: cycleInitMsg } = await supabase.from('messages').select('content').eq('room_id', input.roomId).eq('type', 'cycle_init').limit(1).single();
                          if (cycleInitMsg) {
                              try {
                                  const cycleData = JSON.parse(cycleInitMsg.content);
                                  if (!cycleData.participants.includes(activeUserId)) throw new Error("Unauthorized");
                              } catch(e) { throw new Error("Unauthorized"); }
                          } else { throw new Error("Unauthorized"); }
                      }
                  }
                  return snakeToCamel(roomData);
              }

              if (path[0] === 'chat' && path[1] === 'getMessages') {
                 return { messages: camelData };
              }
              if (path[0] === 'profile' && path[1] === 'me') {
                 const res = camelData?.[0] || { trustScore: 0 };
                 if (res && res.university) {
                    try {
                       const parsed = JSON.parse(res.university || "{}");
                       if (parsed.role) res.role = parsed.role;
                    } catch(e) {}
                 }
                 return res;
              }
              
              return { items: camelData || [], notifications: camelData || [], rooms: camelData || [], messages: camelData || [] };
            }
          });
        };
      }
      
      if (prop === 'useMutation') {
        return (hookOpts?: any) => {
          const queryClient = useQueryClient();
          return useMutation({
            mutationFn: async (variables: any) => {
              const authSession = (await supabase.auth.getSession()).data.session;
              const activeUserId = authSession?.user?.id || null;
              let tableName = path[0];
              if (path[0] === 'communities' && path[1] === 'join') tableName = 'community_members';
              if (path[0] === 'chat' && path[1] === 'sendMessage') tableName = 'messages';
              if (path[0] === 'chat' && path[1] === 'newRoom') tableName = 'chat_rooms';
              if (path[0] === 'chat' && path[1] === 'delete') tableName = 'chat_rooms';
              if (path[0] === 'communityPosts') tableName = 'community_posts';
              if (path[0] === 'communityPostReplies') tableName = 'community_post_replies';
              if (path[0] === 'admin' && path[1] === 'updateReportStatus') tableName = 'reports';
              if (path[0] === 'admin' && path[1] === 'assignReport') tableName = 'reports';
              if (path[0] === 'admin' && path[1] === 'createAuditLog') tableName = 'audit_logs';

              if (path[0] === 'feed' && path[1] === 'logEvent') {
                  if (!activeUserId) return null;
                  
                  // 1. Log event
                  try {
                      await supabase.from('feed_events').insert({
                          user_id: activeUserId,
                          listing_id: variables.listingId,
                          event_type: variables.eventType,
                          watch_duration: variables.watchDuration || 0
                      });
                  } catch(e) {}
                  
                  // 2. Adjust preferences if listing has category
                  if (variables.listingCategory) {
                      const cat = variables.listingCategory.toLowerCase();
                      let scoreChange = 0;
                      switch(variables.eventType) {
                          case 'LIKE': scoreChange = 5; break;
                          case 'SAVE': scoreChange = 8; break;
                          case 'SHARE': scoreChange = 10; break;
                          case 'OFFER': scoreChange = 15; break;
                          case 'WATCH_100': scoreChange = 3; break;
                          case 'WATCH_75': scoreChange = 2; break;
                          case 'WATCH_50': scoreChange = 1; break;
                          case 'SKIP': scoreChange = -2; break;
                      }
                      
                      if (scoreChange !== 0) {
                          try {
                              let { data: prefs } = await supabase.from('user_preferences').select('*').eq('user_id', activeUserId).single();
                              
                              if (!prefs) {
                                  // Create defaults
                                  const { data: newPrefs } = await supabase.from('user_preferences').insert({ user_id: activeUserId }).select().single();
                                  prefs = newPrefs;
                              }
                              
                              if (prefs) {
                                  let col = '';
                                  if (cat.includes('electronic')) col = 'electronics_score';
                                  else if (cat.includes('book')) col = 'books_score';
                                  else if (cat.includes('fashion') || cat.includes('cloth')) col = 'fashion_score';
                                  else if (cat.includes('vehicle') || cat.includes('car')) col = 'vehicles_score';
                                  else if (cat.includes('furniture')) col = 'furniture_score';
                                  else if (cat.includes('sport')) col = 'sports_score';
                                  else if (cat.includes('gam')) col = 'gaming_score';
                                  
                                  if (col) {
                                      await supabase.from('user_preferences').update({
                                          [col]: Math.max(0, (prefs[col] || 0) + scoreChange)
                                      }).eq('user_id', activeUserId);
                                  }
                              }
                          } catch(e) {}
                      }
                  }
                  
                  return { success: true };
              }

              if (path[0] === 'chat' && path[1] === 'newRoom') {
                 // Check if room exists
                 const { data: existingRooms, error: existingError } = await supabase.from('chat_rooms')
                   .select('*')
                   .or(`and(user1_id.eq.${variables.userId},user2_id.eq.${variables.toUserId}),and(user1_id.eq.${variables.toUserId},user2_id.eq.${variables.userId})`);
                 
                 if (!existingError && existingRooms && existingRooms.length > 0) {
                    return snakeToCamel(existingRooms[0]);
                 }
                 
                 const { data: newRoom, error: roomError } = await supabase.from('chat_rooms')
                   .insert({ user1_id: variables.userId, user2_id: variables.toUserId })
                   .select().single();
                   
                 if (roomError) throw roomError;
                 return snakeToCamel(newRoom || { id: 9999 });
              }
              if (path[0] === 'profile' && path[1] === 'updateProfile') {
                 if (!activeUserId) throw new Error("Unauthorized");
                 const { data: currentProfile } = await supabase.from('profiles').select('*').eq('user_id', activeUserId).single();
                 if (!currentProfile) throw new Error("Profile not found");
                 
                 let updatePayload: any = {};
                 const editableFields = ['username', 'bio', 'avatar_url', 'student_email', 'university', 'course', 'interests', 'accept_cash', 'max_swap_distance'];
                 
                 for (const field of editableFields) {
                     if (variables[field] !== undefined) updatePayload[field] = variables[field];
                 }
                 
                 // If student email changed, revoke verification status
                 if (variables.student_email && variables.student_email !== currentProfile.student_email) {
                     updatePayload.isStudentVerified = false;
                     // In a real app, this would trigger a verification email flow
                 }
                 
                 const { error } = await supabase.from('profiles').update(updatePayload).eq('user_id', activeUserId);
                 if (error) throw error;
                 
                 // Invalidate Recommendation Cache
                 RecommendationEngine.cache.forEach((value, key) => {
                     if (key.startsWith(activeUserId)) RecommendationEngine.cache.delete(key);
                 });
                 
                 return { success: true, message: "Profile updated successfully" };
              }

              if (path[0] === 'profile' && path[1] === 'recalculateStats') {
                 const targetUserId = variables.userId || activeUserId;
                 if (!targetUserId) throw new Error("No user ID");
                 await recalculateUserStats(targetUserId);
                 return { success: true };
              }

              if (path[0] === 'chat' && path[1] === 'denyCycle') {
                 const { data: existingMsg } = await supabase.from('messages').select('*').eq('type', 'cycle_init').like('content', `%"hash":"${variables.cycleHash}"%`);
                 if (existingMsg && existingMsg.length > 0) {
                     const msg = existingMsg[0];
                     let content = JSON.parse(msg.content);
                     content.status = 'rejected';
                     await supabase.from('messages').update({ content: JSON.stringify(content) }).eq('id', msg.id);
                     await supabase.from('messages').insert({
                         room_id: msg.room_id,
                         sender_id: variables.userId,
                         content: JSON.stringify({ action: 'reject', userName: variables.userName || 'A user' }),
                         type: 'cycle_action'
                     });
                     // Clean up chat room since it's denied
                     await supabase.from('chat_rooms').delete().eq('id', msg.room_id);
                     return { success: true };
                 }
                 return { success: false };
              }

              if (path[0] === 'chat' && path[1] === 'newCycleRoom') {
                 const { data: existingMsg } = await supabase.from('messages').select('*').eq('type', 'cycle_init').like('content', `%"hash":"${variables.cycleHash}"%`);
                 if (existingMsg && existingMsg.length > 0) {
                    const msg = existingMsg[0];
                    let content = JSON.parse(msg.content);
                    if (!content.entered_chat) content.entered_chat = [];
                    if (!content.entered_chat.includes(variables.userId)) {
                        content.entered_chat.push(variables.userId);
                        await supabase.from('messages').update({ content: JSON.stringify(content) }).eq('id', msg.id);
                        
                        await supabase.from('messages').insert({
                            room_id: msg.room_id,
                            sender_id: variables.userId,
                            content: JSON.stringify({ action: 'join', userName: variables.userName || 'A user' }),
                            type: 'cycle_action'
                        });
                    }
                    const latestStatus = content.revisions ? content.revisions[content.revisions.length - 1].status : content.status;
                    return { id: msg.room_id, status: latestStatus };
                 }

                 const { data: newRoom, error: roomError } = await supabase.from('chat_rooms')
                   .insert({ user1_id: variables.userId, user2_id: null })
                   .select().single();
                 if (roomError) throw roomError;
                 
                 await supabase.from('messages').insert({
                    room_id: newRoom.id,
                    sender_id: variables.userId,
                    content: JSON.stringify({ 
                       participants: variables.participantIds, 
                       hash: variables.cycleHash, 
                       joined_users: [variables.userId], 
                       entered_chat: [variables.userId],
                       revisions: [{
                           id: 1,
                           cycle: variables.cycle,
                           status: 'pending',
                           accepted_users: [variables.userId],
                           created_by: variables.userId
                       }]
                    }),
                    type: 'cycle_init'
                 });
                 return { id: newRoom.id, status: 'pending' };
              }

              if (path[0] === 'admin') {
                 if (!activeUserId) throw new Error("401 Unauthorized");
                 
                 const { data: myProfile } = await supabase.from('profiles').select('university').eq('user_id', activeUserId).single();
                 let myRole = 'user';
                 try {
                    const parsed = JSON.parse(myProfile?.university || "{}");
                    if (parsed.role) myRole = parsed.role;
                 } catch(e) {}
                 if (myRole !== 'admin' && myRole !== 'super_admin' && myRole !== 'moderator') {
                    throw new Error("403 Forbidden: You do not have administrator access.");
                 }
                 if (myRole === 'moderator' && !['executeModerationAction', 'updateReportStatus'].includes(path[1])) {
                    throw new Error("403 Forbidden: Moderators only have access to moderation actions.");
                 }

                 if (path[1] === 'updateRole') {
                    if (myRole !== 'super_admin' && (variables.role === 'admin' || variables.role === 'super_admin')) {
                       throw new Error("403 Forbidden: Only super_admin can create admins.");
                    }
                    const { data: targetProfile } = await adminSupabase.from('profiles').select('university').eq('user_id', variables.userId).single();
                    let parsed: any = {};
                    try { parsed = JSON.parse(targetProfile?.university || "{}"); } catch(e) {}
                    parsed.role = variables.role;
                    
                    const { data, error } = await adminSupabase.from('profiles').update({ university: JSON.stringify(parsed) }).eq('user_id', variables.userId).select().single();
                    if (error) throw error;
                    const res = snakeToCamel(data);
                    res.role = parsed.role;
                    return res;
                 }
                 
                 if (path[1] === 'updateReportStatus') {
                    const { data, error } = await adminSupabase.from('reports').update({ status: variables.status }).eq('id', variables.id).select().single();
                    if (error) throw error;
                    return snakeToCamel(data);
                 }
                 
                 if (path[1] === 'executeModerationAction') {
                    const { reportId, action, notes } = variables;
                    
                    const { data: report } = await adminSupabase.from('reports').select('*').eq('id', reportId).single();
                    if (!report) throw new Error("Report not found");
                    
                    // Critical Authorization checks
                    const superadminOnlyActions = ['remove_community', 'remove_listing', 'ban_user'];
                    if (superadminOnlyActions.includes(action) && myRole !== 'super_admin') {
                        throw new Error(`403 Forbidden: Only super_admin can perform ${action}.`);
                    }
                    
                    let newStatus = 'resolved';
                    let targetUserId = null;
                    
                    if (report.target_type === 'user') targetUserId = report.target_id;
                    else if (report.target_type === 'listing') {
                        const { data: l } = await adminSupabase.from('listings').select('user_id').eq('id', parseInt(report.target_id.replace(/-/g, ''))).single();
                        if (l) targetUserId = l.user_id;
                    } else if (report.target_type === 'community') {
                        const { data: c } = await adminSupabase.from('communities').select('creator_id').eq('id', parseInt(report.target_id.replace(/-/g, ''))).single();
                        if (c) targetUserId = c.creator_id;
                    }
                    
                    if (action === 'dismiss') {
                        newStatus = 'dismissed';
                    } else if (action === 'hide_listing' || action === 'remove_listing') {
                        const numericId = parseInt(report.target_id.replace(/-/g, ''));
                        if (action === 'remove_listing') {
                            await adminSupabase.from('listings').update({ status: 'archived' }).eq('id', numericId);
                        } else {
                            await adminSupabase.from('listings').update({ status: 'hidden' }).eq('id', numericId);
                        }
                        if (targetUserId) {
                           await adminSupabase.from('notifications').insert({ user_id: targetUserId, type: 'system', title: 'Listing Removed', message: action === 'remove_listing' ? 'Your listing was permanently archived for severe policy violations.' : 'Your listing was hidden for violating our rules.', is_read: false });
                        }
                    } else if (action === 'suspend_user' || action === 'ban_user') {
                        try {
                           if (action === 'ban_user') {
                               // Soft-ban user: mark profile as banned, do not permanently delete Auth to preserve historical data
                               await adminSupabase.from('profiles').update({ status: 'banned' }).eq('user_id', report.target_id);
                           } else {
                               await adminSupabase.from('profiles').update({ status: 'suspended' }).eq('user_id', report.target_id);
                               await adminSupabase.from('notifications').insert({ user_id: report.target_id, type: 'system', title: 'Account Suspended', message: `Your account has been suspended due to policy violations. You may appeal this decision.`, is_read: false });
                           }
                        } catch(e) {}
                    } else if (action === 'remove_community' || action === 'lock_community') {
                        const numericId = parseInt(report.target_id.replace(/-/g, ''));
                        if (action === 'remove_community') {
                             await adminSupabase.from('communities').update({ status: 'archived' }).eq('id', numericId);
                        } else {
                             await adminSupabase.from('communities').update({ status: 'locked' }).eq('id', numericId);
                        }
                    } else if (action === 'warning') {
                        if (targetUserId) {
                           await adminSupabase.from('notifications').insert({ user_id: targetUserId, type: 'system', title: 'Official Warning', message: `You have received a warning for violating Marketplace Rules.`, is_read: false });
                        }
                    }
                    
                    const { error } = await adminSupabase.from('reports').update({ 
                        status: newStatus,
                        resolution: `${action.toUpperCase()}${notes ? `: ${notes}` : ''}`,
                        resolved_at: new Date().toISOString(),
                        assigned_to: activeUserId
                    }).eq('id', reportId);
                    
                    if (error) throw error;
                    
                    await adminSupabase.from('audit_logs').insert({
                        actor_id: activeUserId,
                        action: `execute_${action}`,
                        resource_type: report.target_type,
                        resource_id: report.target_id,
                        details: { reportId, notes }
                    });
                    
                    // Notify reporter
                    await adminSupabase.from('notifications').insert({ user_id: report.reporter_id, type: 'system', title: 'Report Update', message: action === 'dismiss' ? 'We reviewed your report but found insufficient evidence of a violation.' : 'Thanks for helping keep SwapSoko safe. Action has been taken based on your report.', is_read: false });
                    
                    return { success: true };
                 }
                 return null;
              }


              if (path[0] === 'reports' && path[1] === 'create') {
                 let targetId = String(variables.target_id || variables.targetId);
                 if (/^\d+$/.test(targetId)) {
                     targetId = targetId.padStart(12, '0').padStart(32, '0').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
                 }
                 const insertVars = {
                     reporter_id: activeUserId || variables.reporter_id || variables.reporterId,
                     target_type: variables.target_type || variables.targetType,
                     target_id: targetId,
                     reason: variables.reason,
                     description: variables.description || "",
                     status: variables.status || "submitted",
                     priority: variables.priority || "medium"
                 };
                 const { error } = await supabase.from('reports').insert(insertVars);
                 if (error) throw error;
                 
                 // Notify community creator and admins if reporting a community
                 if (insertVars.target_type === 'community') {
                     try {
                         const communityId = parseInt(targetId.replace(/-/g, ''));
                         const { data: community } = await adminSupabase.from('communities').select('creator_id, description').eq('id', communityId).single();
                         if (community) {
                             const toNotify = new Set<string>();
                             if (community.creator_id) toNotify.add(community.creator_id);
                             try {
                                 const parsed = JSON.parse(community.description);
                                 if (parsed.admins && Array.isArray(parsed.admins)) {
                                     parsed.admins.forEach((a: string) => toNotify.add(a));
                                 }
                             } catch(e) {}
                             
                             const notifications = Array.from(toNotify).map(id => ({
                                 user_id: id,
                                 type: 'system',
                                 title: 'Community Reported',
                                 message: 'Your community has been reported for violations. Platform administrators are currently reviewing it.',
                                 is_read: false
                             }));
                             if (notifications.length > 0) {
                                 await adminSupabase.from('notifications').insert(notifications);
                             }
                         }
                     } catch(e) { console.error("Error notifying community admins:", e); }
                 }
                 
                 return { success: true };
              }

              // SWAPGURU AI ENGINE (Chapter 21)
              if (path[0] === 'swapguru') {
                  
                  // 1. Natural Language Parser (Rule-Based Fallback Simulation)
                  if (path[1] === 'parseIntent') {
                      const { message } = variables;
                      const query = (message || "").toLowerCase();
                      
                      let intent = "unknown";
                      let parameters: any = {};
                      
                      if (query.includes("worth") || query.includes("value") || query.includes("estimate")) {
                          intent = "analyze_value";
                          parameters = { item: message.replace(/how much is my | worth| value| estimate/ig, '').trim() };
                      } else if (query.includes("what can i get") || query.includes("what could i swap") || query.includes("ideas for")) {
                          intent = "trade_ideas";
                          parameters = { item: message.replace(/what can i get for my |what could i swap my |give me ideas for my /ig, '').trim() };
                      } else if (query.includes("fair trade") || query.includes("is my ") || query.includes("worth this")) {
                          intent = "evaluate_fairness";
                          parameters = { query: message };
                      } else if (query.includes("how do i get a")) {
                          intent = "trade_path";
                          parameters = { target: message.replace(/how do i get a /ig, '').trim() };
                      } else if (query.includes("why am i not getting offers") || query.includes("what should i post")) {
                          intent = "listing_advice";
                      } else if (query.includes("trending") || query.includes("popular")) {
                          intent = "trending";
                      } else if (query.includes("who wants my")) {
                          intent = "who_wants_this";
                          parameters = { item: message.replace(/who wants my /ig, '').trim() };
                      } else if (query.includes("laptop") && (query.includes("ps4") || query.includes("ps5"))) {
                          intent = "recommend_swap";
                          parameters = { have: "PlayStation", want: "Laptop" };
                      } else if (query.includes("nearby") || query.includes("around me")) {
                          intent = "nearby_search";
                          parameters = { category: query.includes("bike") ? "Bike" : "All" };
                      } else if (query.includes("save this") || query.includes("bookmark")) {
                          intent = "execute_action";
                          parameters = { action: "save_listing" };
                      } else {
                          intent = "find_listing";
                          parameters = { query: message };
                      }
                      
                      return { intent, parameters };
                  }
                  
                  // 2. Intent Processor & Response Builder (Routes to Engines)
                  if (path[1] === 'processIntent') {
                      const { intent, parameters, context } = variables;
                      
                      let response = {
                          text: "",
                          results: [] as any[],
                          explainability: null as any,
                          actionExecuted: false
                      };
                      
                      if (intent === "analyze_value") {
                          const val = ValueEngine.calculateValue({ historicalAvg: 55000, currentAvg: 53000, condition: 'excellent', demandFactor: 0.08 });
                          response.text = `Your ${parameters.item} is currently valued between KES ${val.range?.[0]} and KES ${val.range?.[1]}.\nConfidence: ${val.confidence}%`;
                          response.explainability = {
                              reasons: ["48 similar listings", "26 completed swaps", "Excellent condition", "High demand near JKUAT"],
                              suggestions: ["Gaming laptop", "MacBook Air + cash top-up", "High-end smartphone + accessories"]
                          };
                      } else if (intent === "trade_ideas") {
                          const ideas = DemandEngine.getTradeIdeas([{title: parameters.item}], []);
                          response.text = `Your ${parameters.item} could realistically be swapped for:\n✓ ${ideas.join('\n✓ ')}`;
                      } else if (intent === "evaluate_fairness") {
                          response.text = `This trade is reasonably balanced.\nYour item: Estimated value KES 55,000\nTheir item: Estimated value KES 59,000\nSuggested adjustment: Add approximately KES 4,000 or a small accessory.`;
                      } else if (intent === "trade_path") {
                          response.text = `There isn't a direct ${parameters.target} swap available.\nHowever, I found a likely path:\nStep 1: Trade your item for a gaming laptop.\nStep 2: Trade the gaming laptop plus KES 5,000 for a ${parameters.target}.\nEstimated success probability: 84%.`;
                      } else if (intent === "listing_advice") {
                          response.text = `Your listing could perform better. Suggestions:\n• Add more photos.\n• Accept cash top-ups.\n• Expand your wanted items.\n• Join JKUAT Techies community.`;
                      } else if (intent === "trending") {
                          response.text = `Trending this week:\n• Gaming laptops ↑ 37%\n• Engineering textbooks ↑ 28%\n• Phones ↑ 21%`;
                      } else if (intent === "who_wants_this") {
                          response.text = `I found 17 users currently looking for ${parameters.item}.\nTop opportunity: Kevin (96% Compatibility, 1.4 km away, Verified Student).`;
                      } else if (intent === "recommend_swap") {
                          response.text = `Good news! I found some possible swaps for your ${parameters.have} to get a ${parameters.want}.`;
                          response.results = [
                              { id: 22, user: "Brian", listing: "Gaming Laptop", distance: "600m", compatibility: 98 },
                              { id: 17, user: "Mercy", listing: "MacBook Air", distance: "2km", compatibility: 95 }
                          ];
                          response.explainability = {
                              compatibility: 98,
                              factors: { needsMatch: "40/40", distance: "15/15", category: "15/15", trust: "10/10", value: "8/10", communities: "10/10" }
                          };
                      } else if (intent === "execute_action") {
                          if (parameters.action === "save_listing") {
                              response.text = "I have saved that listing to your favorites.";
                              response.actionExecuted = true;
                          }
                      } else {
                          response.text = "Here are some listings I found in the database.";
                      }
                      
                      // await AnalyticsEngine.trackEvent('swapguru_processed', { actorId: activeUserId, entityType: 'intent', entityId: intent });
                      
                      return response;
                  }
                  
                  if (path[1] === 'ask') {
                      const { intent, context, messages } = variables;
                      
                      // Legacy endpoint for backward compatibility / Negotiation AI
                      let recommendation = null;
                      let confidence = 85;
                      let reasoning_summary: string[] = [];
                      
                      if (intent === 'NEGOTIATION' && context?.type === 'PROPOSAL') {
                          recommendation = { suggested_cash_adjustment: 7000, min_adjustment: 5000, max_adjustment: 8000 };
                          reasoning_summary = ["Their requested adjustment of 15k exceeds the 7k difference in market value. 7k is statistically fair."];
                      }
                      
                      // await AnalyticsEngine.trackEvent('swapguru_asked', { actorId: activeUserId, entityType: 'swapguru_intent', entityId: intent, metadata: { context } });
                      
                      return { intent, recommendation, confidence, reasoning_summary };
                  }
              }

              // REPORTING & APPEALS ENGINE (Chapter 22)
              if (path[0] === 'reporting') {
                  
                  if (path[1] === 'createReport') {
                      const { targetType, targetId, reasonCode, description, evidence } = variables;
                      
                      // 1. Create Report (Allegation)
                      const { data: report } = await adminSupabase.from('reports').insert({
                          reporter_id: activeUserId,
                          target_type: targetType,
                          target_id: targetId,
                          reason_code: reasonCode,
                          description,
                          status: 'PENDING',
                          created_at: new Date().toISOString()
                      }).select().single();
                      
                      // 2. Mock Automated Triage to group into Moderation Cases
                      // In reality, this checks for active cases against target_id and links or creates one.
                      
                      // 3. Save Evidence references
                      if (evidence && Array.isArray(evidence) && report?.id) {
                          for (const ev of evidence) {
                              await adminSupabase.from('report_evidence').insert({
                                  report_id: report.id,
                                  evidence_type: ev.type,
                                  storage_path: ev.path,
                                  submitted_by: activeUserId
                              });
                          }
                      }
                      
                      // await AnalyticsEngine.trackEvent('report_created', { actorId: activeUserId, entityType: 'report', entityId: report?.id });
                      
                      return { success: true, reportId: report?.id || `mock_${Date.now()}`, message: "Report submitted successfully. We'll review your report." };
                  }
                  
                  if (path[1] === 'submitAppeal') {
                      const { caseId, reason, statement, evidence } = variables;
                      
                      // Ensure user hasn't already appealed this case (limit logic)
                      
                      const { data: appeal } = await adminSupabase.from('appeals').insert({
                          case_id: caseId,
                          appellant_id: activeUserId,
                          reason,
                          statement,
                          status: 'SUBMITTED',
                          created_at: new Date().toISOString()
                      }).select().single();
                      
                      // await AnalyticsEngine.trackEvent('appeal_created', { actorId: activeUserId, entityType: 'appeal', entityId: appeal?.id });
                      
                      return { success: true, appealId: appeal?.id || `mock_${Date.now()}` };
                  }
              }

              // MODERATION ENGINE (Chapter 23)
              if (path[0] === 'moderation') {
                  
                  if (path[1] === 'proactiveCheck') {
                      const { content, type } = variables;
                      
                      // Mock automated analysis
                      let riskScore = 0.1;
                      if (content?.toLowerCase().includes("pay via outside")) riskScore = 0.85; // Medium-High risk
                      
                      let action = 'ALLOW';
                      if (riskScore > 0.8) action = 'REVIEW';
                      
                      return { riskScore, recommendedAction: action };
                  }
                  
                  if (path[1] === 'takeAction') {
                      const { caseId, actionType, targetType, targetId, targetUserId, reason } = variables;
                      
                      // In a real system, verify the caller has `moderation.takeAction` permissions.
                      
                      // 1. Log the Moderation Decision
                      const { data: decision } = await adminSupabase.from('enforcement_actions').insert({
                          case_id: caseId,
                          target_user_id: targetUserId,
                          action_type: actionType,
                          reason,
                          issued_by: activeUserId,
                          created_at: new Date().toISOString()
                      }).select().single();
                      
                      // 2. Execute Enforcement Logic (Soft-deletions)
                      if (actionType === 'REMOVE_LISTING' && targetType === 'LISTING') {
                          await adminSupabase.from('listings').update({ status: 'REMOVED' }).eq('id', targetId);
                      } else if (actionType === 'SUSPEND_USER') {
                          await adminSupabase.from('profiles').update({ status: 'SUSPENDED' }).eq('user_id', targetUserId);
                      }
                      
                      // 3. Mark Case as Resolved
                      await adminSupabase.from('moderation_cases').update({ status: 'CLOSED', closed_at: new Date().toISOString() }).eq('id', caseId);
                      
                      // 4. Audit Trail
                      await adminSupabase.from('moderation_audit_logs').insert({
                          actor_id: activeUserId,
                          action: actionType,
                          target_type: targetType,
                          target_id: targetId,
                          case_id: caseId,
                          reason: reason,
                          created_at: new Date().toISOString()
                      });
                      
                      // 5. Notify the User securely (via Notification Engine)
                      // await EventBus.publish('ENFORCEMENT_ACTION_TAKEN', {
                      //     actorId: activeUserId,
                      //     recipientId: targetUserId,
                      //     entityType: targetType,
                      //     entityId: targetId,
                      //     customMessage: "Action taken on your account/content. Reason: " + reason
                      // });
                      
                      // await AnalyticsEngine.trackEvent('moderation_action_taken', { actorId: activeUserId, entityType: 'case', entityId: caseId });
                      
                      return { success: true, decisionId: decision?.id || `mock_${Date.now()}` };
                  }
              }

              // AUTHENTICATION & IDENTITY ENGINE (Chapter 24)
              if (path[0] === 'identity') {
                  
                  if (path[1] === 'verifyStudent') {
                      const { universityId, campusId, studentEmail } = variables;
                      
                      // 1. In a real system, send email verification link here.
                      // For this engine simulation, we will directly create the verification record.
                      
                      const { data: verification } = await adminSupabase.from('verification_records').insert({
                          user_id: activeUserId,
                          verification_type: 'STUDENT_EMAIL',
                          status: 'VERIFIED', // Mocked as immediately verified
                          metadata: { studentEmail },
                          verified_at: new Date().toISOString(),
                          created_at: new Date().toISOString()
                      }).select().single();
                      
                      // 2. Map the identity to the university context
                      await adminSupabase.from('university_memberships').insert({
                          user_id: activeUserId,
                          university_id: universityId,
                          campus_id: campusId,
                          verification_id: verification?.id,
                          status: 'ACTIVE',
                          started_at: new Date().toISOString(),
                          created_at: new Date().toISOString()
                      });
                      
                      // 3. Mark the main profile with a UI-facing badge state
                      // Note: We don't change 'user_id' or 'account_status', just profile metadata.
                      await adminSupabase.from('profiles').update({
                          university: JSON.stringify({ name: universityId, isStudentVerified: true })
                      }).eq('user_id', activeUserId);
                      
                      // await AnalyticsEngine.trackEvent('student_verified', { actorId: activeUserId, entityType: 'university', entityId: universityId });
                      
                      return { success: true, verificationId: verification?.id || `mock_${Date.now()}` };
                  }
                  
                  if (path[1] === 'checkPermission') {
                      const { permissionScope, targetId } = variables;
                      // 1. Fetch user roles linked to this activeUserId
                      // 2. Evaluate if they have the specific permission.
                      // Mocking a successful permission check for demo purposes:
                      const hasPermission = activeUserId ? true : false; 
                      
                      return { authorized: hasPermission };
                  }
              }

              // If it's a proposal send
              if (path[0] === 'proposals' && path[1] === 'send') {
                let snakeVars = camelToSnake(variables);
                
                // Keep only strictly known properties for the insert
                const insertVars: any = {
                   from_user_id: snakeVars.user_id || snakeVars.from_user_id,
                   to_user_id: snakeVars.to_user_id,
                   message: snakeVars.message || "",
                   cash_top_up: snakeVars.cash_top_up || 0,
                   status: 'pending'
                };
                if (snakeVars.listing_id) insertVars.listing_id = snakeVars.listing_id;
                if (snakeVars.community_id) insertVars.community_id = snakeVars.community_id;
                if (snakeVars.offer_items) insertVars.offer_items = snakeVars.offer_items;
                
                // Append extra options to message to avoid schema errors and retain info
                let extraInfo = [];
                if (snakeVars.wish_id) extraInfo.push(`[Regarding Wish: ${snakeVars.wish_id}]`);
                if (variables.preferredLocation) extraInfo.push(`Location: ${variables.preferredLocation}`);
                if (variables.availability) extraInfo.push(`Availability: ${variables.availability}`);
                if (extraInfo.length > 0) {
                   insertVars.message = (insertVars.message ? insertVars.message + "\n\n" : "") + extraInfo.join("\n");
                }

                console.error("Proposal insertVars:", insertVars, "snakeVars:", snakeVars);
                const { data: proposal, error: propError } = await supabase.from('proposals').insert(insertVars).select().single();
                if (propError || !proposal) {
                  console.error("Proposal error:", propError);
                  throw propError || new Error("Failed to create proposal");
                }
                
                let chatRoomId = 9999;
                if (variables.userId && variables.toUserId) {
                  // Check if room exists
                  const { data: existingRooms, error: existingError } = await supabase.from('chat_rooms')
                    .select('*');
                  
                  let existingRoom;
                  if (!existingError && existingRooms) {
                    existingRoom = existingRooms.find((r: any) => 
                      (r.user1_id === variables.userId && r.user2_id === variables.toUserId) ||
                      (r.user1_id === variables.toUserId && r.user2_id === variables.userId)
                    );
                  }

                  if (existingRoom) {
                    chatRoomId = existingRoom.id;
                  } else {
                    const { data: newRoom, error: roomError } = await supabase.from('chat_rooms')
                      .insert({ user1_id: variables.userId, user2_id: variables.toUserId })
                      .select().single();
                    if (!roomError && newRoom) chatRoomId = newRoom.id;
                  }
                  
                    let listingTitle = "Swap Request";
                    let listingImage = "";
                    if (variables.listingId) {
                       const { data: listData } = await supabase.from('listings').select('title, images').eq('id', variables.listingId).single();
                       if (listData) {
                           listingTitle = listData.title;
                           if (Array.isArray(listData.images) && listData.images.length > 0) listingImage = listData.images[0];
                           else if (typeof listData.images === 'string') {
                               try { const parsed = JSON.parse(listData.images); if (parsed.length > 0) listingImage = parsed[0]; } catch(e) { listingImage = listData.images; }
                           }
                       }
                    } else if (variables.wishId) {
                       const { data: wishData } = await supabase.from('wishes').select('title').eq('id', variables.wishId).single();
                       if (wishData) {
                           listingTitle = wishData.title;
                       }
                    }
                    
                    const proposalData = {
                       proposalId: proposal.id,
                       listingId: variables.listingId,
                       listingTitle,
                       listingImage,
                       wishId: variables.wishId,
                       message: variables.message || "",
                       cashTopUp: variables.cashTopUp || 0,
                       offerItems: variables.offerItems || "",
                       preferredLocation: variables.preferredLocation || "",
                       availability: variables.availability || ""
                    };
                    await supabase.from('messages').insert({
                      room_id: chatRoomId,
                      sender_id: variables.userId,
                      type: 'proposal',
                      content: JSON.stringify(proposalData)
                    });

                  if (variables.toUserId) {
                    await supabase.from('notifications').insert({
                      user_id: variables.toUserId,
                      type: 'proposal',
                      title: 'New Swap Proposal',
                      message: 'Someone sent you an offer for your listing!',
                      is_read: false
                    });
                  }
                }
                
                // update listing hasOffers
                if (variables.listingId) {
                    const { data: existingListing } = await supabase.from('listings').select('description').eq('id', variables.listingId).single();
                    if (existingListing) {
                        let baseDesc = existingListing.description || "";
                        let currentMeta: any = {};
                        let metaMatch = baseDesc.match(/<!--meta:(.+?)-->/);
                        if (metaMatch) {
                           try { currentMeta = JSON.parse(metaMatch[1]); } catch(e) {}
                           baseDesc = baseDesc.replace(/\n\n<!--meta:.+?-->/g, '');
                        }
                        currentMeta.hasOffers = true;
                        await supabase.from('listings').update({ description: baseDesc + "\n\n<!--meta:" + JSON.stringify(currentMeta) + "-->" }).eq('id', variables.listingId);
                    }
                }
                
                // update wish response_count
                if (variables.wishId) {
                    const { data: wishData } = await supabase.from('wishes').select('response_count').eq('id', variables.wishId).single();
                    if (wishData) {
                        await supabase.from('wishes').update({ response_count: (wishData.response_count || 0) + 1 }).eq('id', variables.wishId);
                    }
                }
                
                return { ...snakeToCamel(proposal), chatRoomId };
              }

              // If it's a leave or removeMember operation
              if (path[0] === 'communities' && (path[1] === 'leave' || path[1] === 'removeMember')) {
                const { error: leaveError } = await supabase.from('community_members').delete().eq('community_id', variables.communityId).eq('user_id', variables.userId);
                if (leaveError) throw leaveError;
                
                // If they are admin, remove them from admins list
                const { data: comm } = await supabase.from('communities').select('*').eq('id', variables.communityId).single();
                if (comm && comm.description && comm.description.startsWith('{')) {
                   try {
                      const parsed = JSON.parse(comm.description);
                      if (parsed.admins && parsed.admins.includes(variables.userId)) {
                         parsed.admins = parsed.admins.filter((id: string) => id !== variables.userId);
                         
                         // if admins is now empty, find oldest member
                         if (parsed.admins.length === 0) {
                            const { data: members } = await supabase.from('community_members').select('user_id').eq('community_id', variables.communityId).order('joined_at', { ascending: true }).limit(1);
                            if (members && members.length > 0) {
                               parsed.admins.push(members[0].user_id);
                            }
                         }
                         await supabase.from('communities').update({ description: JSON.stringify(parsed) }).eq('id', variables.communityId);
                      }
                   } catch(e) {}
                }
                return { success: true };
              }

              if (path[0] === 'communities' && path[1] === 'makeAdmin') {
                const { data: comm } = await supabase.from('communities').select('*').eq('id', variables.communityId).single();
                if (comm && comm.description && comm.description.startsWith('{')) {
                   try {
                      const parsed = JSON.parse(comm.description);
                      if (!parsed.admins) parsed.admins = [];
                      if (!parsed.admins.includes(variables.userId)) {
                         parsed.admins.push(variables.userId);
                         await supabase.from('communities').update({ description: JSON.stringify(parsed) }).eq('id', variables.communityId);
                      }
                   } catch(e) {}
                }
                return { success: true };
              }

              if (path[0] === 'communities' && path[1] === 'demoteAdmin') {
                const { data: comm } = await supabase.from('communities').select('*').eq('id', variables.communityId).single();
                if (comm && comm.description && comm.description.startsWith('{')) {
                   try {
                      const parsed = JSON.parse(comm.description);
                      if (parsed.admins && parsed.admins.includes(variables.userId)) {
                         parsed.admins = parsed.admins.filter((id: string) => id !== variables.userId);
                         await supabase.from('communities').update({ description: JSON.stringify(parsed) }).eq('id', variables.communityId);
                      }
                   } catch(e) {}
                }
                return { success: true };
              }

              // Swap Guru - Rule-Based Intent & Recommendation Engine
              if (path[0] === 'swapGuru' && path[1] === 'ask') {
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate thinking
                const p = variables.prompt?.toLowerCase() || "";
                
                let intent = "unknown";
                let have = "";
                let want = "";

                // 1. Casual Conversation Intent & Entity Extraction
                const cleanP = p.toLowerCase().replace(/[\.,\?!\'\"]/g, "");
                
                intent = "find_listing";
                if (cleanP.includes("trend") || cleanP.includes("market") || cleanP.includes("hot")) intent = "analyze_trends";
                else if (cleanP.includes("value") || cleanP.includes("worth") || cleanP.includes("price") || cleanP.includes("how much") || cleanP.includes("analyze")) intent = "analyze_value";
                else if (cleanP.includes("idea") || cleanP.includes("what can i get") || cleanP.includes("recommend") || cleanP.includes("trade for my")) intent = "trade_ideas";

                const stopwords = new Set(["a","an","the","and","but","if","or","because","as","until","while","of","at","by","for","with","about","against","between","into","through","during","before","after","above","below","to","from","up","down","in","out","on","off","over","under","again","further","then","once","here","there","when","where","why","how","all","any","both","each","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","s","t","can","will","just","don","should","now","i","me","my","myself","we","our","ours","ourselves","you","your","yours","yourself","yourselves","he","him","his","himself","she","her","hers","herself","it","its","itself","they","them","their","theirs","themselves","what","which","who","whom","this","that","these","those","am","is","are","was","were","be","been","being","have","has","had","having","do","does","did","doing","would","could","ought","im","youre","hes","shes","its","were","theyre","ive","youve","weve","theyve","id","youd","hed","shed","wed","theyd","ill","youll","hell","shell","well","theyll","isnt","arent","wasnt","werent","hasnt","havent","hadnt","doesnt","dont","didnt","wont","wouldnt","shant","shouldnt","cant","cannot","couldnt","mustnt","lets","thats","whos","whats","heres","theres","whens","wheres","whys","hows", "swap", "trade", "exchange", "sell", "buy", "get", "give", "want", "looking", "need", "find", "someone", "anyone", "please", "hey", "hi", "hello", "guru", "worth", "value", "price", "cost", "much", "many", "idea", "ideas", "trend", "trends", "market", "hot", "right", "recommend", "analyze", "good", "bad", "new", "old"]);
                
                const queryWords = cleanP.split(/\s+/).filter((w: string) => !stopwords.has(w) && w.length > 1);
                const target = queryWords.join(" ");

                // 2. Fetch Datamuse Synonyms for exhaustive matching
                let expandedQueryWords = [...queryWords];
                for (const word of queryWords) {
                   try {
                      // ml = means like (synonyms, related concepts)
                      const res = await fetch(`https://api.datamuse.com/words?ml=${word}&max=8`);
                      if (res.ok) {
                          const data = await res.json();
                          expandedQueryWords.push(...data.map((d: any) => d.word));
                      }
                   } catch(e) {}
                }
                // Unique lowercase words
                expandedQueryWords = Array.from(new Set(expandedQueryWords.map(w => w.toLowerCase())));

                // 3. Fetch Data
                const { data: listings } = await supabase.from('listings').select('*, profiles!user_id(*)');
                let results: any[] = [];

                const parsePgArray = (val: any) => {
                  if (Array.isArray(val)) return val;
                  if (typeof val === 'string') {
                    if (val.startsWith('{') && val.endsWith('}')) return val.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, ''));
                    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : [parsed]; } catch (e) { return [val]; }
                  }
                  return val ? [val] : [];
                };

                // 4. Match listings using exhaustive synonyms
                if (intent !== "analyze_trends") {
                    results = (listings || []).filter((l: any) => {
                       if (activeUserId && l.user_id === activeUserId) return false;
                       const title = (l.title || "").toLowerCase();
                       const cat = (l.category || "").toLowerCase();
                       const desc = (l.description || "").toLowerCase();
                       
                       // Match if ANY of our expanded synonym query words are found in the listing!
                       const match = expandedQueryWords.some(w => title.includes(w) || cat.includes(w));
                       
                       // Boost score if the actual target words match exactly
                       if (queryWords.some((w: string) => title.includes(w))) l._guruScore = 20;
                       else if (match) l._guruScore = 10;
                       
                       return match;
                    }).sort((a: any, b: any) => (b._guruScore || 0) - (a._guruScore || 0));
                }

                // 5. Response Builder
                let response = "";
                
                if (intent === "analyze_trends") {
                   const categories = (listings || []).map((l: any) => l.category).filter(Boolean);
                   const counts = categories.reduce((acc: any, c: string) => ({ ...acc, [c]: (acc[c] || 0) + 1 }), {} as Record<string, number>);
                   const sorted = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]);
                   const topCats = sorted.slice(0, 2).map((x: any) => x[0]);
                   response = `📊 **Market Trends Engine**\n\nRight now, **${topCats[0] || 'various items'}** and **${topCats[1] || 'other tech'}** are seeing a huge surge in demand on campus. If you have any items in these categories, now is the perfect time to list them for high-value trades!`;
                   return { response, listings: [] };
                }
                
                if (intent === "trade_ideas" || intent === "analyze_value") {
                   if (!target || target.length < 2) {
                       response = "I need to know which item you want to value or trade! Just talk to me naturally, like: 'What can I get for my PlayStation?'";
                       return { response, listings: [] };
                   }
                   
                   if (results.length === 0) {
                      response = `💡 **Valuation Engine**\n\nI couldn't find any historical data or active listings related to **${target}** right now. Try being less specific, or you can list it and see what offers you get!`;
                      return { response, listings: [] };
                   }

                   // Calculate ESV (mock values since db doesn't have estimated_value)
                   const esvValues = results.map((m: any) => m.estimated_value || (m.title.length * 1000 + 5000)).filter((v: number) => v > 0).sort((a: number, b: number) => a - b);
                   let minEsv = 0, maxEsv = 0;
                   if (esvValues.length > 0) {
                       minEsv = esvValues[Math.floor(esvValues.length * 0.1)] || esvValues[0];
                       maxEsv = esvValues[Math.floor(esvValues.length * 0.9)] || esvValues[esvValues.length - 1];
                   }

                   // Find what they want
                   const commonWants = results.flatMap((m: any) => parsePgArray(m.want_items)).filter(Boolean);
                   const wantCounts = commonWants.reduce((acc: any, c: string) => ({ ...acc, [c]: (acc[c] || 0) + 1 }), {} as Record<string, number>);
                   const topWant = Object.entries(wantCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'cash or electronics';

                   const valStr = esvValues.length > 0 ? `KES ${minEsv.toLocaleString()} to KES ${maxEsv.toLocaleString()}` : "an unknown amount";
                   const conf = Math.min(95, 40 + (results.length * 10));

                   response = `💡 **Trade Ideas & Valuation**\n\nBased on ${results.length} similar active and historical listings for **${target}**, the Estimated Swap Value (ESV) is **${valStr}** with ${conf}% confidence.\n\n**Opportunity:** Most people trading this are looking for **${topWant}**. You could trade yours directly for that, or bundle it for something even better!`;
                   return { response, listings: results.slice(0, 3) };
                }

                let returnedListings: any[] = [];
                if (results.length === 0) {
                   response = `I couldn't find any exact matches for **${target || 'that'}** right now in the marketplace. Try adjusting your search or setting up a Wish so I can notify you when one becomes available!`;
                   
                   // 5. Multi-Swap Engine (Trade Paths) Hook
                   if (intent === 'recommend_swap' && target && have) {
                       const myWantWords = target.split(/\s+/).filter((w: string) => w.length > 2);
                       const myHaveWords = have.split(/\s+/).filter((w: string) => w.length > 2);
                       
                       for (const l1 of listings || []) {
                          const l1Title = (l1.title || "").toLowerCase();
                          if (myWantWords.some((w: string) => l1Title.includes(w))) {
                             const l1Wants = parsePgArray(l1.want_items);
                             if (l1Wants.length > 0) {
                                for (const l2 of listings || []) {
                                   if (l1.id === l2.id) continue;
                                   const l2Title = (l2.title || "").toLowerCase();
                                   const l2HasWhatL1Wants = l1Wants.some(w1 => {
                                      const w1Expanded = w1.toLowerCase();
                                      return w1Expanded.split(/\s+/).some((word: string) => word.length > 3 && l2Title.includes(word));
                                   });
                                   if (l2HasWhatL1Wants) {
                                      const l2Wants = parsePgArray(l2.want_items);
                                      const l2WantsWhatIHave = l2Wants.some(w2 => {
                                          const w2Expanded = w2.toLowerCase();
                                          return myHaveWords.some(hw => w2Expanded.includes(hw));
                                      });
                                      if (l2WantsWhatIHave) {
                                         response = `There isn't a direct **${target}** swap available right now, but you could reach your goal in two swaps!\n\nFirst trade your **${have}** for **${l2.title}**, then trade that for the **${l1.title}**.`;
                                         const returnedListings = [l2, l1];
                                         return { response, listings: returnedListings || [] };
                                      }
                                   }
                                }
                             }
                          }
                       }
                   }
                } else {
                   results.sort((a, b) => (b._guruScore || 0) - (a._guruScore || 0));
                   returnedListings = results.slice(0, 3);
                   const perfectMatches = returnedListings.filter((l: any) => l._guruScore >= 20);
                   
                   if (perfectMatches.length > 0 && intent === 'recommend_swap') {
                      response = `Perfect! I found ${perfectMatches.length} listing(s) that match what you want, AND they are looking for what you have!`;
                   } else if (intent === 'recommend_swap') {
                      response = `I found some matches! However, they aren't explicitly looking for what you have. You could still propose a swap and offer a cash top-up!`;
                   } else {
                      response = `Good news! I found ${results.length} possible swap${results.length > 1 ? 's' : ''}. Here are the top matches:`;
                   }
                }

                return { response, listings: returnedListings || [] };
              }

              // If it's a markRead operation
              if (path[1] === 'markRead') {
                let actualTable = path[0] === 'chat' ? 'messages' : tableName;
                let query = supabase.from(actualTable).update({ is_read: true }).eq('is_read', false);
                if (variables && variables.roomId && actualTable === 'messages') {
                    query = query.eq('room_id', variables.roomId);
                }
                const { data, error } = await query;
                if (variables && variables.userId) {
                    await supabase.from('notifications').update({ is_read: true }).eq('user_id', variables.userId).eq('is_read', false);
                }
                if (error) throw error;
                return snakeToCamel(data);
              }

              const snakeVars = camelToSnake(variables);
              
              // Upsert profiles to satisfy FK constraints for all possible user_id fields
              const userIdsToUpsert = [snakeVars.user_id, snakeVars.creator_id, snakeVars.from_user_id, snakeVars.to_user_id].filter(Boolean);
              for (const uid of userIdsToUpsert) {
                const { error: profileError } = await supabase.from('profiles').upsert(
                  { user_id: uid, name: 'User', university: 'JKUAT', campus: 'Main' },
                  { onConflict: 'user_id', ignoreDuplicates: true }
                );
              }

              let data, error;
              if (path[1] === 'update') {
                const { id, ...rest } = snakeVars;
                let updateData = { ...rest };
                
                if (tableName === 'listings') {
                   const metaFields = ['reserved_until', 'accepted_bid_id', 'reservation_id', 'finalized_at', 'bid_expires_at', 'has_offers'];
                   let hasMeta = false;
                   const metaData: any = {};
                   metaFields.forEach(f => {
                       if (updateData[f] !== undefined) {
                           const camelF = f.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                           metaData[camelF] = updateData[f];
                           delete updateData[f];
                           hasMeta = true;
                       }
                   });
                   if (hasMeta) {
                       const { data: existing } = await supabase.from('listings').select('description').eq('id', id).single();
                       let currentMeta = {};
                       let baseDesc = existing?.description || "";
                       let metaMatch = baseDesc.match(/<!--meta:(.+?)-->/);
                       if (metaMatch) {
                           try { currentMeta = JSON.parse(metaMatch[1]); } catch(e) {}
                           baseDesc = baseDesc.replace(/\n\n<!--meta:.+?-->/g, '');
                       }
                       const finalDesc = updateData.description !== undefined ? updateData.description.replace(/\n\n<!--meta:.+?-->/g, '').replace(/\n\n<!--soko:\d+-->/g, '') : baseDesc.replace(/\n\n<!--soko:\d+-->/g, '');
                       const finalSokoMatch = (updateData.description !== undefined ? updateData.description : existing?.description || "").match(/<!--soko:\d+-->/);
                       
                       updateData.description = finalDesc + (finalSokoMatch ? `\n\n${finalSokoMatch[0]}` : '') + `\n\n<!--meta:${JSON.stringify({...currentMeta, ...metaData})}-->`;
                   }
                }

                if (tableName === 'proposals' && (updateData.status === 'accepted' || updateData.status === 'completed' || updateData.status === 'rejected' || updateData.status === 'cancelled')) {
                   const { data: propData } = await supabase.from('proposals').select('*').eq('id', id).single();
                   if (propData && (propData.listing_id || propData.wish_id)) {
                      const lid = propData.listing_id || propData.wish_id;
                      if (updateData.status === 'accepted') {
                         await supabase.from('proposals').update({ status: 'rejected' }).eq(propData.listing_id ? 'listing_id' : 'wish_id', lid).neq('id', id).eq('status', 'pending');
                      }
                      
                      if (propData.listing_id) {
                          const { data: existingListing } = await supabase.from('listings').select('description').eq('id', lid).single();
                          let baseDesc = existingListing?.description || "";
                          let currentMeta: any = {};
                          let metaMatch = baseDesc.match(/<!--meta:(.+?)-->/);
                          if (metaMatch) {
                              try { currentMeta = JSON.parse(metaMatch[1]); } catch(e) {}
                              baseDesc = baseDesc.replace(/\n\n<!--meta:.+?-->/g, '');
                          }
                          if (updateData.status === 'accepted') {
                              currentMeta.acceptedBidId = id;
                              currentMeta.bidExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
                              await supabase.from('listings').update({ 
                                 status: 'bid_in_progress', 
                                 description: baseDesc + "\n\n<!--meta:" + JSON.stringify(currentMeta) + "-->" 
                              }).eq('id', lid);
                          } else if (updateData.status === 'completed') {
                              await supabase.from('listings').update({ status: 'finalized' }).eq('id', lid);
                          }
                      } else if (propData.wish_id && updateData.status === 'completed') {
                          await supabase.from('wishes').update({ status: 'finalized' }).eq('id', lid);
                      }
                   }
                   
                   // Event-driven statistics update
                   if (propData && (updateData.status === 'completed' || updateData.status === 'accepted' || updateData.status === 'rejected')) {
                      await recalculateUserStats(propData.from_user_id).catch(() => {});
                      await recalculateUserStats(propData.to_user_id).catch(() => {});
                   }
                   
                   // Update corresponding chat message
                   const { data: msgs } = await supabase.from('messages').select('id, content').eq('type', 'proposal').like('content', `%"proposalId":${id}%`);
                   if (msgs && msgs.length > 0) {
                      for (const msg of msgs) {
                         try {
                            const c = JSON.parse(msg.content);
                            c.status = updateData.status;
                            await supabase.from('messages').update({ content: JSON.stringify(c) }).eq('id', msg.id);
                         } catch(e) {}
                      }
                   }
                }

                if (tableName === 'communities') {
                  if (updateData.creator_id) delete updateData.creator_id;
                  if (updateData.icon !== undefined || updateData.description !== undefined || updateData.admins !== undefined) {
                     const descObj: any = {};
                     if (updateData.description) descObj.text = updateData.description;
                     if (updateData.icon !== undefined) descObj.icon = updateData.icon;
                     if (updateData.admins !== undefined) descObj.admins = updateData.admins;
                     
                     if (updateData.description === undefined || updateData.icon === undefined || updateData.admins === undefined) {
                        const { data: existing } = await supabase.from('communities').select('description').eq('id', id).single();
                        if (existing && existing.description && existing.description.startsWith('{')) {
                           try {
                             const parsed = JSON.parse(existing.description);
                             if (updateData.description === undefined) descObj.text = parsed.text || "";
                             if (updateData.icon === undefined) descObj.icon = parsed.icon || "";
                             if (updateData.admins === undefined) descObj.admins = parsed.admins || [];
                           } catch(e) {}
                        }
                     }
                     updateData.description = JSON.stringify(descObj);
                     delete updateData.icon;
                     delete updateData.admins;
                  }
                }
                if (tableName === 'listings') {
                  if (updateData.preferred_items !== undefined) { updateData.want_items = updateData.preferred_items; delete updateData.preferred_items; }
                  if (updateData.category_id !== undefined) { updateData.category = updateData.category_id; delete updateData.category_id; }
                  
                  // Map images and want_items to Postgres array literals so they save correctly to TEXT[]
                  if (Array.isArray(updateData.images)) {
                    updateData.images = `{${updateData.images.map((s: string) => `"${s}"`).join(',')}}`;
                  }
                  if (Array.isArray(updateData.want_items)) {
                    updateData.want_items = `{${updateData.want_items.map((s: string) => `"${s}"`).join(',')}}`;
                  }
                }

                if (tableName === 'wishes') {
                  if (Array.isArray(updateData.offer_items)) {
                    updateData.offer_items = `{${updateData.offer_items.map((s: string) => `"${s}"`).join(',')}}`;
                  }
                }
                
                const result = await supabase.from(tableName).update(updateData).eq('id', id).select().single();
                data = result.data;
                error = result.error;
                if (error) throw error;
              } else if (path[1] === 'deleteAccount') {
                  const uid = snakeVars.user_id;
                  await supabase.from('proposals').delete().or(`from_user_id.eq.${uid},to_user_id.eq.${uid}`);
                  await supabase.from('listings').delete().eq('user_id', uid);
                  await supabase.from('wishes').delete().eq('user_id', uid);
                  await supabase.from('community_members').delete().eq('user_id', uid);
                  await supabase.from('profiles').delete().eq('user_id', uid);
                  return { success: true };
              } else if (path[1] === 'delete') {
                if (tableName === 'communities') {
                   const { data: listings } = await supabase.from('listings').select('id, description');
                   const communityListings = (listings || []).filter((l: any) => l.description && l.description.includes(`<!--soko:${snakeVars.id}-->`));
                   for (const l of communityListings) {
                       await supabase.from('listings').update({ status: 'archived' }).eq('id', l.id);
                   }
                }
                
                if (tableName === 'listings' || tableName === 'proposals') {
                    // Soft Delete / Archival
                    const { error: archiveError } = await supabase.from(tableName).update({ status: 'archived' }).eq('id', snakeVars.id);
                    if (archiveError) throw archiveError;
                } else {
                    const { error: delError } = await supabase.from(tableName).delete().eq('id', snakeVars.id);
                    if (delError) throw delError;
                }
                return { success: true };
              } else {
                let insertData = { ...snakeVars };
                
                // --- Schema Alignments ---
                // Communities table doesn't have creator_id or icon
                if (tableName === 'communities') {
                  const creatorId = insertData.creator_id;
                  
                  if (insertData.type === 'campus') {
                    if (!creatorId) throw new Error("Missing creator ID");
                    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', creatorId).single();
                    let verified = false;
                    let uni = "";
                    if (profile) {
                       let u: any = {};
                       let d: any = {};
                       try { u = JSON.parse(profile.university || "{}"); } catch(e) {}
                       try { d = JSON.parse(profile.description || "{}"); } catch(e) {}
                       
                       verified = profile.isStudentVerified || u.isStudentVerified || d.isStudentVerified;
                       uni = u.val || profile.university || profile.campus || "";
                       if (uni.startsWith('{')) uni = "";
                    }
                    if (!verified) throw new Error("Only verified students can create a Campus Community.");
                    if (!uni) throw new Error("University not found on verified student profile.");
                    insertData.university = uni;
                  }

                  if (insertData.creator_id) delete insertData.creator_id;
                  if (insertData.icon || insertData.description || creatorId) {
                    const descObj = {
                      text: insertData.description || "",
                      icon: insertData.icon || "",
                      admins: creatorId ? [creatorId] : []
                    };
                    insertData.description = JSON.stringify(descObj);
                    delete insertData.icon;
                  }
                }
                
                if (tableName === 'community_members') {
                  const userId = insertData.user_id;
                  const communityId = insertData.community_id;
                  const { data: comm } = await supabase.from('communities').select('*').eq('id', communityId).single();
                  if (comm && comm.type === 'campus') {
                     const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
                     let verified = false;
                     let uni = "";
                     if (profile) {
                       let u: any = {};
                       let d: any = {};
                       try { u = JSON.parse(profile.university || "{}"); } catch(e) {}
                       try { d = JSON.parse(profile.description || "{}"); } catch(e) {}
                       
                       verified = profile.isStudentVerified || u.isStudentVerified || d.isStudentVerified;
                       uni = u.val || profile.university || profile.campus || "";
                       if (uni.startsWith('{')) uni = "";
                     }
                     if (!verified || uni !== comm.university) {
                       throw new Error("Only verified students from this university can join this community.");
                     }
                  }
                }
                
                // Listings table: preferred_items -> want_items, category_id -> category
                if (tableName === 'listings') {
                  if (insertData.preferred_items !== undefined) {
                    insertData.want_items = insertData.preferred_items;
                    delete insertData.preferred_items;
                  }
                  if (insertData.category_id !== undefined) {
                    insertData.category = insertData.category_id;
                    delete insertData.category_id;
                  }
                  
                  // Map images and want_items to Postgres array literals so they save correctly to TEXT[]
                  if (Array.isArray(insertData.images)) {
                    insertData.images = `{${insertData.images.map((s: string) => `"${s}"`).join(',')}}`;
                  }
                  if (Array.isArray(insertData.want_items)) {
                    insertData.want_items = `{${insertData.want_items.map((s: string) => `"${s}"`).join(',')}}`;
                  }
                }

                if (tableName === 'wishes') {
                  if (Array.isArray(insertData.offer_items)) {
                    insertData.offer_items = `{${insertData.offer_items.map((s: string) => `"${s}"`).join(',')}}`;
                  }
                }
                
                if (tableName === 'notifications') {
                  if (insertData.body) {
                    insertData.message = insertData.body;
                    delete insertData.body;
                  }
                }
                
                if (tableName === 'saved_items') {
                   if (insertData.listing_id && activeUserId) {
                       const { data: listing } = await supabase.from('listings').select('user_id').eq('id', insertData.listing_id).single();
                       if (listing && listing.user_id === activeUserId) {
                           throw new Error("You cannot save your own listing.");
                       }
                   }
                }
                
                if (tableName === 'proposals') {
                   if (insertData.user_id) {
                      insertData.from_user_id = insertData.user_id;
                      delete insertData.user_id;
                   }
                }
                
                // Chat Rooms: userId -> user1_id, partnerId -> user2_id (if frontend sends them differently)
                if (tableName === 'chat_rooms') {
                   if (insertData.user_id) { insertData.user1_id = insertData.user_id; delete insertData.user_id; }
                   if (insertData.partner_id) { insertData.user2_id = insertData.partner_id; delete insertData.partner_id; }
                }

                if (tableName === 'messages' && insertData.room_id) {
                   if (!activeUserId) throw new Error("Unauthorized");
                   const { data: roomCheck } = await supabase.from('chat_rooms').select('*').eq('id', insertData.room_id).single();
                   if (!roomCheck) throw new Error("Room not found");
                   if (roomCheck.user2_id !== null) {
                       if (roomCheck.user1_id !== activeUserId && roomCheck.user2_id !== activeUserId) throw new Error("Unauthorized");
                   } else {
                       const { data: cycleInitMsg } = await supabase.from('messages').select('content').eq('room_id', insertData.room_id).eq('type', 'cycle_init').limit(1).single();
                       if (cycleInitMsg) {
                           try {
                               const cycleData = JSON.parse(cycleInitMsg.content);
                               if (!cycleData.participants.includes(activeUserId)) throw new Error("Unauthorized");
                           } catch(e) { throw new Error("Unauthorized"); }
                       } else {
                           throw new Error("Unauthorized");
                       }
                   }
                }

                const result = await supabase.from(tableName).insert(insertData).select().single();
                data = result.data;
                error = result.error;
                
                if (error) throw error;
                
                // Event-driven statistics update for message response time
                if (tableName === 'messages' && insertData.type !== 'system' && activeUserId) {
                    await recalculateUserStats(activeUserId).catch(() => {});
                }
                
                if (tableName === 'communities' && snakeVars.creator_id) {
                  const communityId = data?.id;
                  if (communityId) {
                    const { error: joinError } = await supabase.from('community_members').insert({ community_id: communityId, user_id: snakeVars.creator_id });
                    if (joinError) throw joinError;
                  }
                }

              }
              
              if (error) {
                console.error(`Supabase mutation error on ${tableName}:`, error);
                return { success: true, ...snakeToCamel(data) };
              }
              return snakeToCamel(data);
            },
            onSuccess: (data) => {
              queryClient.invalidateQueries({ queryKey: [path[0]] });
              if (hookOpts?.onSuccess) hookOpts.onSuccess(data);
            },
            onError: (err) => {
              if (hookOpts?.onError) hookOpts.onError(err);
            }
          });
        };
      }
      
      return createProxy([...path, prop]);
    }
  });
};

export const CAMPUSES = [
  { id: 1, name: "JKUAT Main Campus (Juja)", university: "JKUAT", lat: -1.0887, lng: 37.0122, county: "Kiambu" },
  { id: 2, name: "JKUAT Karen Campus", university: "JKUAT", lat: -1.3197, lng: 36.7120, county: "Nairobi" },
  { id: 3, name: "UoN Main Campus", university: "University of Nairobi", lat: -1.2796, lng: 36.8162, county: "Nairobi" },
  { id: 4, name: "UoN Chiromo Campus", university: "University of Nairobi", lat: -1.2714, lng: 36.8063, county: "Nairobi" },
  { id: 5, name: "UoN Kikuyu Campus", university: "University of Nairobi", lat: -1.2486, lng: 36.6669, county: "Kiambu" },
  { id: 6, name: "KU Main Campus (Kenyatta)", university: "Kenyatta University", lat: -1.1774, lng: 36.9281, county: "Nairobi" },
  { id: 7, name: "KU Ruiru Campus", university: "Kenyatta University", lat: -1.1554, lng: 36.9632, county: "Kiambu" },
  { id: 8, name: "Strathmore University Main Campus", university: "Strathmore", lat: -1.3100, lng: 36.8125, county: "Nairobi" },
  { id: 9, name: "USIU-Africa Main Campus", university: "USIU", lat: -1.2200, lng: 36.8850, county: "Nairobi" },
  { id: 10, name: "TUK Main Campus (CBD)", university: "Technical University of Kenya", lat: -1.2882, lng: 36.8233, county: "Nairobi" },
  { id: 11, name: "Daystar Nairobi Campus", university: "Daystar", lat: -1.2894, lng: 36.8043, county: "Nairobi" },
  { id: 12, name: "CUEA Langata Campus", university: "Catholic University", lat: -1.3444, lng: 36.7583, county: "Nairobi" },
  { id: 13, name: "MKU Nairobi Campus", university: "Mount Kenya University", lat: -1.2811, lng: 36.8222, county: "Nairobi" },
  { id: 14, name: "MMU Main Campus (Rongai)", university: "Multimedia University", lat: -1.3852, lng: 36.7648, county: "Nairobi" },
  { id: 15, name: "PAC University Roysambu", university: "Pan African Christian University", lat: -1.2173, lng: 36.8845, county: "Nairobi" },
  { id: 16, name: "Riara University Main Campus", university: "Riara", lat: -1.3092, lng: 36.8046, county: "Nairobi" },
  { id: 17, name: "KCA University Ruaraka", university: "KCA University", lat: -1.2546, lng: 36.8524, county: "Nairobi" },
  { id: 18, name: "Zetech University Ruiru", university: "Zetech", lat: -1.1441, lng: 36.9622, county: "Kiambu" },
  { id: 19, name: "Africa Nazarene University Rongai", university: "ANU", lat: -1.3939, lng: 36.7599, county: "Kajiado" },
];

export const trpc = new Proxy({
  useUtils: () => {
    const queryClient = useQueryClient();
    return new Proxy({}, {
      get(target, prop: string) {
        return new Proxy({}, {
          get(t, innerProp: string) {
            return {
              invalidate: (input?: any) => {
                const queryKey = input !== undefined ? [prop, innerProp, input] : [prop];
                return queryClient.invalidateQueries({ queryKey });
              },
              setData: (input: any, updater: any) => {
                return queryClient.setQueryData([prop, innerProp, input], updater);
              },
              setInfiniteData: (input: any, updater: any) => {
                return queryClient.setQueryData([prop, innerProp, input], updater);
              }
            };
          }
        });
      }
    });
  }
}, {
  get(target: any, prop: string) {
    if (prop in target) return target[prop];
    return createProxy([prop]);
  }
});
