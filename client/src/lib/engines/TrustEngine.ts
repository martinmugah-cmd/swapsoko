export interface TrustEvent {
  id: string;
  type: 'OFFER_RECEIVED' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED' | 'OFFER_RESPONDED' | 'SWAP_COMPLETED' | 'SWAP_CANCELLED_USER' | 'SWAP_CANCELLED_OTHER' | 'DISPUTE_OPENED' | 'DISPUTE_RESOLVED';
  timestamp: number;
}

export interface VerificationData {
  isStudentVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface TrustMetrics {
  offersReceived: number;
  offersAccepted: number;
  completedSwaps: number;
  cancellations: number;
  acceptanceRate: number;
  completionRate: number;
  cancellationRate: number;
  medianResponseTimeSec: number;
  recentReliability: number;
  lifetimeReliability: number;
}

export interface TrustResult {
  score: number;
  confidence: number;
  metrics: TrustMetrics;
  badges: string[];
  responseTimeLabel: string;
}

export const TrustEngine = {
  MODEL_VERSION: 'trust_v1',

  calculateTrust(events: TrustEvent[], verifications: VerificationData): TrustResult {
    // 1. Process Events into Base Metrics
    const now = Date.now();
    let offersReceived = 0;
    let offersAccepted = 0;
    let offersResponded = 0;
    let completedSwaps = 0;
    let userCancellations = 0;
    let responseTimes: number[] = [];

    // Group events by a simulated offerId for response time tracking.
    // In a real system, events would be tied to specific offers/swaps.
    // We will just process them linearly for the simulation.
    let lastOfferTime: number | null = null;

    events.sort((a, b) => a.timestamp - b.timestamp).forEach(e => {
        if (e.type === 'OFFER_RECEIVED') {
            offersReceived++;
            lastOfferTime = e.timestamp;
        }
        else if (e.type === 'OFFER_RESPONDED' || e.type === 'OFFER_ACCEPTED' || e.type === 'OFFER_REJECTED') {
            if (e.type === 'OFFER_ACCEPTED') offersAccepted++;
            if (lastOfferTime) {
                const rt = (e.timestamp - lastOfferTime) / 1000; // seconds
                if (rt > 0 && rt < 86400 * 7) { // filter out anomalies > 7 days
                    responseTimes.push(rt);
                }
                lastOfferTime = null; // reset
            }
        }
        else if (e.type === 'SWAP_COMPLETED') {
            completedSwaps++;
        }
        else if (e.type === 'SWAP_CANCELLED_USER') {
            userCancellations++;
        }
    });

    // 2. Calculate Derived Rates
    const acceptanceRate = offersReceived > 0 ? (offersAccepted / offersReceived) * 100 : 100;
    const completionRate = offersAccepted > 0 ? (completedSwaps / offersAccepted) * 100 : 100;
    const cancellationRate = offersAccepted > 0 ? (userCancellations / offersAccepted) * 100 : 0;
    
    responseTimes.sort((a, b) => a - b);
    const medianResponseTimeSec = responseTimes.length > 0 
       ? (responseTimes.length % 2 === 0 
          ? (responseTimes[responseTimes.length/2 - 1] + responseTimes[responseTimes.length/2]) / 2 
          : responseTimes[Math.floor(responseTimes.length/2)]) 
       : 0;

    // 3. Reliability Scoring (Base: 100)
    let lifetimeReliability = completionRate * 0.40 + acceptanceRate * 0.40 - cancellationRate * 1.5;
    
    // Penalize for bad response time (if over 12 hours)
    if (medianResponseTimeSec > 43200) lifetimeReliability -= 10;
    else if (medianResponseTimeSec > 86400) lifetimeReliability -= 25;
    
    lifetimeReliability = Math.max(0, Math.min(100, lifetimeReliability));

    // 4. Confidence (Bayesian Shrinkage concept)
    // If you only have 1 swap, confidence is low.
    const evidenceCount = offersReceived + completedSwaps;
    const confidence = Math.min(100, evidenceCount * 5); // 20+ events = 100% confidence

    // Shrink trust score toward average (e.g. 70) if confidence is low
    const avgTrust = 70;
    const trustScore = Math.round((lifetimeReliability * (confidence/100)) + (avgTrust * (1 - (confidence/100))));

    // 5. Response Time Label
    let responseTimeLabel = "New responder";
    if (responseTimes.length > 0) {
        if (medianResponseTimeSec < 300) responseTimeLabel = "Usually responds instantly";
        else if (medianResponseTimeSec < 1800) responseTimeLabel = "Usually responds quickly";
        else if (medianResponseTimeSec < 7200) responseTimeLabel = "Usually responds within a few hours";
        else if (medianResponseTimeSec < 86400) responseTimeLabel = "Usually responds within a day";
        else responseTimeLabel = "Slow responder";
    }

    // 6. Badges
    const badges: string[] = [];
    if (verifications.isStudentVerified) badges.push("VERIFIED_STUDENT");
    if (verifications.isEmailVerified) badges.push("VERIFIED_EMAIL");
    if (completedSwaps >= 5 && completionRate > 90) badges.push("RELIABLE_TRADER");
    if (responseTimes.length >= 3 && medianResponseTimeSec < 1800) badges.push("FAST_RESPONDER");

    return {
        score: trustScore,
        confidence,
        metrics: {
            offersReceived,
            offersAccepted,
            completedSwaps,
            cancellations: userCancellations,
            acceptanceRate: Math.round(acceptanceRate),
            completionRate: Math.round(completionRate),
            cancellationRate: Math.round(cancellationRate),
            medianResponseTimeSec,
            recentReliability: Math.round(lifetimeReliability),
            lifetimeReliability: Math.round(lifetimeReliability)
        },
        badges,
        responseTimeLabel
    };
  },

  // Mock function to generate events backwards from profile stats
  generateMockEvents(stats: any): TrustEvent[] {
      const events: TrustEvent[] = [];
      const now = Date.now();
      
      const compSwaps = stats.completedSwaps || 0;
      // Reverse engineer offers based on acceptance rate
      const accRate = stats.acceptanceRate ? (stats.acceptanceRate / 100) : 0.8;
      const offAcc = compSwaps > 0 ? Math.max(compSwaps, Math.floor(compSwaps * 1.1)) : (stats.acceptanceRate ? 5 : 0);
      const offRec = offAcc > 0 ? Math.floor(offAcc / accRate) : 0;
      
      const avgResp = stats.avgResponseTime || '1h'; // string like '5m', '1h'
      let respSec = 3600;
      if (typeof avgResp === 'string') {
         if (avgResp.includes('m')) respSec = parseInt(avgResp) * 60;
         else if (avgResp.includes('h')) respSec = parseInt(avgResp) * 3600;
      }

      // Add dummy events spread over time
      for (let i = 0; i < offRec; i++) {
          const t = now - (i * 86400000) - 100000;
          events.push({ id: `e_rec_${i}`, type: 'OFFER_RECEIVED', timestamp: t });
          
          if (i < offAcc) {
              events.push({ id: `e_acc_${i}`, type: 'OFFER_ACCEPTED', timestamp: t + (respSec * 1000) });
              if (i < compSwaps) {
                  events.push({ id: `e_com_${i}`, type: 'SWAP_COMPLETED', timestamp: t + (respSec * 1000) + 172800000 });
              } else {
                  // Some were cancelled
                  if (i % 2 === 0) events.push({ id: `e_can_${i}`, type: 'SWAP_CANCELLED_USER', timestamp: t + 86400000 });
              }
          }
      }
      
      return events;
  }
};
