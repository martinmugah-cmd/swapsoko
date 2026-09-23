import { ValueEstimationEngine } from './ValueEstimationEngine';

export interface MatchContext {
  userWishes?: any[];
  userListings?: any[]; // the items the user owns
  userInterests?: Record<string, number>;
  userCoords?: { lat: number; lng: number };
  maxTopUp?: number; // User's preferred max cash adjustment
}

export interface MatchResult {
  score: number;
  confidence: number;
  tier: "EXCELLENT" | "STRONG" | "POSSIBLE" | "WEAK" | "POOR";
  breakdown: {
    value: number;
    intent: number;
    item: number;
    preference: number;
    location: number;
    condition: number;
    trust: number;
    availability: number;
  };
  matchedWithMyListingId?: number; // If they have multiple items, which one matched best?
  reasons: string[];
}

export const MatchEngine = {
  MODEL_VERSION: 'match_v1',
  WEIGHTS: {
    value: 0.25,
    intent: 0.20,
    item: 0.15,
    preference: 0.15,
    location: 0.10,
    condition: 0.05,
    trust: 0.05,
    availability: 0.05
  },

  calculateMatch(targetListing: any, context: MatchContext): MatchResult {
    // 1. Availability Filter (Gating)
    if (targetListing.status !== 'active') {
       return this.createZeroMatch("Listing is not available");
    }

    // Evaluate against all user items to find the strongest match
    let bestResult: MatchResult | null = null;
    const userListings = context.userListings && context.userListings.length > 0 
       ? context.userListings 
       : [null]; // If user has no items, calculate a generic intent/preference match

    for (const myListing of userListings) {
       const res = this.calculateSingleMatch(myListing, targetListing, context);
       if (!bestResult || res.score > bestResult.score) {
           bestResult = res;
       }
    }

    return bestResult || this.createZeroMatch("No compatible items");
  },

  calculateSingleMatch(myListing: any | null, targetListing: any, context: MatchContext): MatchResult {
    const breakdown = {
       value: this.calculateValueScore(myListing, targetListing, context),
       intent: this.calculateIntentScore(targetListing, context),
       item: this.calculateItemScore(myListing, targetListing),
       preference: this.calculatePreferenceScore(targetListing, context),
       location: this.calculateLocationScore(targetListing, context),
       condition: this.calculateConditionScore(myListing, targetListing),
       trust: this.calculateTrustScore(targetListing),
       availability: 100 // Pre-gated to 100 if active
    };

    const reasons: string[] = [];

    let rawScore = (
      (breakdown.value * this.WEIGHTS.value) +
      (breakdown.intent * this.WEIGHTS.intent) +
      (breakdown.item * this.WEIGHTS.item) +
      (breakdown.preference * this.WEIGHTS.preference) +
      (breakdown.location * this.WEIGHTS.location) +
      (breakdown.condition * this.WEIGHTS.condition) +
      (breakdown.trust * this.WEIGHTS.trust) +
      (breakdown.availability * this.WEIGHTS.availability)
    );

    const score = Math.min(100, Math.max(0, Math.round(rawScore)));

    if (breakdown.value > 90) reasons.push("Great value alignment");
    if (breakdown.intent > 80) reasons.push("Matches your wishlist");
    if (breakdown.location > 80) reasons.push("Nearby trader");
    if (breakdown.trust > 80) reasons.push("Highly trusted trader");
    
    // Confidence calc based on completeness of data
    let confidence = 100;
    if (!targetListing.condition) confidence -= 20;
    if (!targetListing.category) confidence -= 10;
    if (breakdown.value === 0 && !myListing) confidence = 30; // Cannot do value match properly

    return {
       score,
       confidence: Math.max(0, confidence),
       tier: this.getTier(score),
       breakdown,
       matchedWithMyListingId: myListing?.id,
       reasons: reasons.slice(0, 3) // Return top 3 reasons
    };
  },

  getTier(score: number): MatchResult["tier"] {
    if (score >= 90) return "EXCELLENT";
    if (score >= 75) return "STRONG";
    if (score >= 60) return "POSSIBLE";
    if (score >= 40) return "WEAK";
    return "POOR";
  },

  createZeroMatch(reason: string): MatchResult {
    return {
      score: 0,
      confidence: 100,
      tier: "POOR",
      breakdown: { value: 0, intent: 0, item: 0, preference: 0, location: 0, condition: 0, trust: 0, availability: 0 },
      reasons: [reason]
    };
  },

  // --- Sub-scoring engines ---

  calculateValueScore(myListing: any, target: any, context: MatchContext): number {
    if (!myListing) return 50; // Neutral if user has nothing to trade yet

    const myVal = ValueEstimationEngine.estimateValue(myListing).tradeValue;
    const targetVal = ValueEstimationEngine.estimateValue(target).tradeValue;
    
    if (myVal === 0 || targetVal === 0) return 50;

    let gap = Math.abs(myVal - targetVal);
    
    // Cash top up tolerance
    const maxTopUp = context.maxTopUp || 10000; 
    if (target.cashTopUpAllowed || myListing.cashTopUpAllowed) {
       // Reduce gap by up to maxTopUp
       gap = Math.max(0, gap - maxTopUp);
    }

    const valueRatio = gap / Math.max(myVal, targetVal);
    
    // Convert ratio (0 to 1) to a score (100 to 0)
    const score = Math.max(0, 100 - (valueRatio * 200));
    return Math.round(score);
  },

  calculateIntentScore(target: any, context: MatchContext): number {
    if (!context.userWishes) return 0;
    
    const targetText = \`\${target.title} \${target.category} \${target.description || ''}\`.toLowerCase();
    
    let bestIntent = 0;
    for (const wish of context.userWishes) {
        const wishText = \`\${wish.title} \${Array.isArray(wish.offerItems) ? wish.offerItems.join(' ') : (wish.offerItems || '')}\`.toLowerCase();
        
        // Semantic overlap check (mocked via word tokens for now)
        const words = wishText.split(/\s+/).filter(w => w.length > 3);
        if (words.some(w => targetText.includes(w))) {
           bestIntent = 95;
           break;
        }
    }
    
    return bestIntent;
  },

  calculateItemScore(myListing: any, target: any): number {
     if (!myListing) return 50;
     // Does my listing match their 'wantItems'?
     const myText = \`\${myListing.title} \${myListing.category}\`.toLowerCase();
     const theirWants = Array.isArray(target.wantItems) ? target.wantItems.join(' ').toLowerCase() : (target.wantItems || '').toLowerCase();
     
     if (!theirWants) return 50;
     
     const words = myText.split(/\s+/).filter(w => w.length > 3);
     if (words.some(w => theirWants.includes(w))) {
        return 95;
     }
     
     // Same super-category fallback
     if (myListing.category === target.category) return 70;
     
     return 30;
  },

  calculatePreferenceScore(target: any, context: MatchContext): number {
     if (!context.userInterests || !target.category) return 50;
     const interest = context.userInterests[target.category.toLowerCase()];
     if (interest !== undefined) {
         return Math.round(interest * 100);
     }
     return 20; // Unexplored category
  },

  calculateLocationScore(target: any, context: MatchContext): number {
     if (!context.userCoords || !target.lat || !target.lng) return 60; // Neutral if unknown

     const R = 6371; 
     const dLat = (target.lat - context.userCoords.lat) * Math.PI / 180; 
     const dLon = (target.lng - context.userCoords.lng) * Math.PI / 180;
     const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(context.userCoords.lat * Math.PI / 180) * Math.cos(target.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
     const d = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));

     if (d <= 2) return 100;
     if (d <= 5) return 95;
     if (d <= 10) return 85;
     if (d <= 25) return 70;
     if (d <= 50) return 50;
     return 30;
  },

  calculateConditionScore(myListing: any, target: any): number {
      if (!target.condition) return 50;
      
      const conditionRanks: Record<string, number> = {
         'brand_new': 100,
         'like_new': 90,
         'excellent': 80,
         'good': 60,
         'fair': 40,
         'repair': 10
      };

      const targetRank = conditionRanks[target.condition] || 50;
      if (!myListing || !myListing.condition) return targetRank;

      const myRank = conditionRanks[myListing.condition] || 50;
      
      // We want to penalize heavily if we give Excellent and get Fair.
      // But we reward if we give Good and get Excellent.
      const diff = targetRank - myRank;
      
      if (diff >= 0) return 100; // Upgrade!
      if (diff > -20) return 80;
      if (diff > -40) return 40;
      return 10; // Huge downgrade
  },

  calculateTrustScore(target: any): number {
     let score = 50; // Base score for new users
     if (target.profiles?.isStudentVerified) score += 20;
     if (target.profiles?.verifiedIdentity) score += 20;
     
     const completed = target.profiles?.swapsCompleted || 0;
     if (completed > 10) score += 30;
     else if (completed > 2) score += 15;

     return Math.min(100, score);
  }
};
