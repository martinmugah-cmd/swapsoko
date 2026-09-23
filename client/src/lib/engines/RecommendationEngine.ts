import { ValueEstimationEngine } from './ValueEstimationEngine';

export interface RecommendationContext {
  userId?: string;
  userListings?: any[];
  userInterests?: Record<string, number>; // e.g., { 'electronics': 0.9, 'fashion': 0.2 }
  surface?: 'home' | 'swipe' | 'reels';
}

export const RecommendationEngine = {
  /**
   * Main Pipeline
   */
  generateFeed(allListings: any[], context: RecommendationContext): any[] {
    let candidates = this.filterEligibility(allListings, context.userId);
    candidates = this.scoreAndRank(candidates, context);
    candidates = this.applyDiversity(candidates);
    return candidates;
  },

  /**
   * Step 1: Eligibility (Section 5)
   */
  filterEligibility(listings: any[], userId?: string): any[] {
    return listings.filter(l => {
      // Don't show my own listings
      if (userId && l.user_id === userId) return false;
      // In a real app, also filter out blocked, deleted, already swapped, etc.
      if (l.status && l.status !== 'active') return false;
      return true;
    });
  },

  /**
   * Step 2: Scoring and Ranking (Sections 14, 23, 30)
   */
  scoreAndRank(listings: any[], context: RecommendationContext): any[] {
    // If the user has listings, we use the most valuable one as a baseline for value compatibility
    let maxUserValue = 0;
    if (context.userListings && context.userListings.length > 0) {
        maxUserValue = Math.max(...context.userListings.map(l => ValueEstimationEngine.estimateValue(l).tradeValue));
    }

    const scored = listings.map(l => {
       let score = 50; // Base score
       let reason = "You may also like";

       // Freshness Boost (Section 23)
       const daysOld = (Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24);
       if (daysOld < 2) score += 15;
       else if (daysOld < 7) score += 5;
       else score -= 10;

       // Personalization: User Interests (Section 6, 11)
       if (context.userInterests && l.category) {
          const interestLevel = context.userInterests[l.category.toLowerCase()];
          if (interestLevel) {
              score += (interestLevel * 30);
              if (interestLevel > 0.7) reason = `Because you like ${l.category}`;
          }
       }

       // Value Compatibility (Section 30)
       if (maxUserValue > 0) {
           const lVal = ValueEstimationEngine.estimateValue(l).tradeValue;
           const valRatio = Math.min(lVal, maxUserValue) / Math.max(lVal, maxUserValue);
           
           if (valRatio > 0.8) {
               score += 20; // Extremely compatible
               reason = "Good trade for your items";
           } else if (valRatio > 0.5) {
               score += 5; // Possible with top-up
           } else {
               score -= 15; // Wildly different value, push down
           }
       }

       // Demand/Trending signal (Section 3)
       const likes = Array.isArray(l.likes) ? l.likes.length : 0;
       if (likes > 5) {
           score += 10;
           if (reason === "You may also like") reason = "Trending right now";
       }

       // Ensure min/max bounds
       score = Math.max(0, Math.min(100, score));

       // Different surfaces weight things differently (Section 45)
       // Example: Reels cares more about engagement/trending, Swipe cares more about value
       if (context.surface === 'swipe' && maxUserValue > 0) {
          // If swiping, strictly penalize huge value gaps further
          const lVal = ValueEstimationEngine.estimateValue(l).tradeValue;
          if (lVal > maxUserValue * 3) score -= 30; 
       }

       return { ...l, _recScore: score, _matchScore: score, _recReason: reason, _matchReasons: [reason] };
    });

    // Rank descending
    return scored.sort((a, b) => b._recScore - a._recScore);
  },

  /**
   * Step 3: Diversity (Sections 20, 21)
   */
  applyDiversity(rankedListings: any[]): any[] {
    const finalFeed = [];
    let consecutiveCategoryCount = 0;
    let lastCategory = "";

    const available = [...rankedListings];

    while (available.length > 0) {
        // Find the next acceptable item
        let selectedIdx = -1;
        
        for (let i = 0; i < available.length; i++) {
           const item = available[i];
           const cat = item.category || "unknown";

           // Rule: Max 2 consecutive items from the same category
           if (cat === lastCategory && consecutiveCategoryCount >= 2) {
               continue; // Skip, look for a different category
           }
           
           selectedIdx = i;
           break;
        }

        // If we couldn't find a diverse item, just take the top one (we have no choice)
        if (selectedIdx === -1) {
            selectedIdx = 0;
        }

        const selected = available.splice(selectedIdx, 1)[0];
        finalFeed.push(selected);

        const cat = selected.category || "unknown";
        if (cat === lastCategory) {
            consecutiveCategoryCount++;
        } else {
            lastCategory = cat;
            consecutiveCategoryCount = 1;
        }
    }

    return finalFeed;
  }
};
