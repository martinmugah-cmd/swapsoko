export type TrustEventType = 
  | 'OFFER_RECEIVED' 
  | 'OFFER_ACCEPTED' 
  | 'OFFER_REJECTED' 
  | 'OFFER_EXPIRED'
  | 'SWAP_COMPLETED' 
  | 'SWAP_CANCELLED_USER' 
  | 'SWAP_CANCELLED_OTHER' 
  | 'NO_SHOW_CONFIRMED'
  | 'DISPUTE_OPENED' 
  | 'DISPUTE_RESOLVED'
  | 'REPORT_CREATED'
  | 'POLICY_VIOLATION_CONFIRMED'
  | 'POLICY_VIOLATION_REVERSED';

export interface TrustEvent {
  id: string;
  type: TrustEventType;
  timestamp: number;
}

export interface VerificationData {
  isStudentVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified?: boolean;
}

export interface TrustMetrics {
  offersReceived: number;
  offersAccepted: number;
  offersRejected: number;
  offersResponded: number;
  completedSwaps: number;
  cancellations: number;
  noShows: number;
  confirmedViolations: number;
  
  acceptanceRate: number; // accepted / (accepted + rejected)
  responseRate: number; // responded / received
  completionRate: number; // completed / accepted
  cancellationRate: number; // cancelled / accepted
  noShowRate: number; // no-shows / handovers
  medianResponseTimeSec: number;
}

export interface TrustResult {
  trustScore: number;
  riskScore: number;
  trustConfidence: 'New' | 'Emerging' | 'Established' | 'Highly Established';
  metrics: TrustMetrics;
  badges: string[];
  responseTimeLabel: string;
  safeguardsRequired: string[];
}

export const TrustEngine = {
  MODEL_VERSION: 'trust_v2_chap11',

  calculate(events: TrustEvent[], verifications: VerificationData, accountAgeDays: number): TrustResult {
    // 1. Process Event Ledger
    let offersReceived = 0;
    let offersAccepted = 0;
    let offersRejected = 0;
    let offersResponded = 0;
    let completedSwaps = 0;
    let userCancellations = 0;
    let noShows = 0;
    let confirmedViolations = 0;
    let responseTimes: number[] = [];
    let lastOfferTime: number | null = null;

    events.sort((a, b) => a.timestamp - b.timestamp).forEach(e => {
        if (e.type === 'OFFER_RECEIVED') {
            offersReceived++;
            lastOfferTime = e.timestamp;
        }
        else if (e.type === 'OFFER_ACCEPTED') {
            offersAccepted++;
            offersResponded++;
            if (lastOfferTime) responseTimes.push((e.timestamp - lastOfferTime) / 1000);
            lastOfferTime = null;
        }
        else if (e.type === 'OFFER_REJECTED') {
            offersRejected++;
            offersResponded++;
            if (lastOfferTime) responseTimes.push((e.timestamp - lastOfferTime) / 1000);
            lastOfferTime = null;
        }
        else if (e.type === 'SWAP_COMPLETED') completedSwaps++;
        else if (e.type === 'SWAP_CANCELLED_USER') userCancellations++;
        else if (e.type === 'NO_SHOW_CONFIRMED') noShows++;
        else if (e.type === 'POLICY_VIOLATION_CONFIRMED') confirmedViolations++;
        else if (e.type === 'POLICY_VIOLATION_REVERSED') confirmedViolations = Math.max(0, confirmedViolations - 1);
    });

    // 2. Calculate Derived Rates (Chapter 11 specific formulas)
    const decidedOffers = offersAccepted + offersRejected;
    const acceptanceRate = decidedOffers > 0 ? (offersAccepted / decidedOffers) * 100 : 100;
    const responseRate = offersReceived > 0 ? (offersResponded / offersReceived) * 100 : 100;
    const completionRate = offersAccepted > 0 ? (completedSwaps / offersAccepted) * 100 : 100;
    const cancellationRate = offersAccepted > 0 ? (userCancellations / offersAccepted) * 100 : 0;
    
    // Scheduled handovers roughly = accepted swaps - cancelled before handover (approximated here)
    const scheduledHandovers = Math.max(0, offersAccepted - userCancellations);
    const noShowRate = scheduledHandovers > 0 ? (noShows / scheduledHandovers) * 100 : 0;
    
    responseTimes.sort((a, b) => a - b);
    const medianResponseTimeSec = responseTimes.length > 0 
       ? (responseTimes.length % 2 === 0 
          ? (responseTimes[responseTimes.length/2 - 1] + responseTimes[responseTimes.length/2]) / 2 
          : responseTimes[Math.floor(responseTimes.length/2)]) 
       : 0;

    // 3. Trust Score Component Weighting
    // Completion reliability: 30%, Transaction history: 20%, Response: 15%, Acceptance: 10%, Community: 10%, Verification: 10%, Maturity: 5%
    let completionScore = completionRate - (noShowRate * 2); // No-shows heavily penalize completion reliability
    let txScore = Math.min(100, completedSwaps * 5); // 20 swaps = 100
    let respScore = responseRate;
    if (medianResponseTimeSec > 86400) respScore -= 20; // slow response penalty
    let accScore = acceptanceRate;
    let commScore = 100 - (confirmedViolations * 25);
    
    let verifScore = 0;
    if (verifications.isStudentVerified) verifScore += 40;
    if (verifications.isEmailVerified) verifScore += 30;
    if (verifications.isPhoneVerified) verifScore += 30;

    let matScore = Math.min(100, accountAgeDays * 2); // 50 days = max maturity

    let trustScore = Math.round(
       (completionScore * 0.30) + 
       (txScore * 0.20) + 
       (respScore * 0.15) + 
       (accScore * 0.10) + 
       (commScore * 0.10) + 
       (verifScore * 0.10) + 
       (matScore * 0.05)
    );
    trustScore = Math.max(0, Math.min(100, trustScore));

    // 4. Risk Engine
    let riskScore = 0;
    riskScore += userCancellations * 5;
    riskScore += noShows * 20;
    riskScore += confirmedViolations * 30;
    if (accountAgeDays < 7) riskScore += 10;
    if (!verifications.isPhoneVerified && !verifications.isStudentVerified) riskScore += 20;
    riskScore = Math.max(0, Math.min(100, riskScore));

    // 5. Confidence Level
    let trustConfidence: TrustResult['trustConfidence'] = 'New';
    if (completedSwaps >= 25) trustConfidence = 'Highly Established';
    else if (completedSwaps >= 10) trustConfidence = 'Established';
    else if (completedSwaps >= 3) trustConfidence = 'Emerging';

    // 6. Badges (Historical Rules)
    const badges: string[] = [];
    if (verifications.isStudentVerified) badges.push("Verified Student");
    
    // Fast Responder: min responses = 10, median time < 30 mins (1800s)
    if (offersResponded >= 10 && medianResponseTimeSec < 1800) badges.push("Fast Responder");
    
    // Reliable Trader: completed swaps >= 10, completion rate >= 95%
    if (completedSwaps >= 10 && completionRate >= 95) badges.push("Reliable Trader");
    
    // Swap Veteran: completed swaps >= 25
    if (completedSwaps >= 25) badges.push("Swap Veteran");

    // 7. Safeguards
    const safeguardsRequired: string[] = [];
    if (riskScore > 60) safeguardsRequired.push('MANUAL_REVIEW');
    if (trustScore < 40 && riskScore > 40) safeguardsRequired.push('ESCROW_PROTECTION_REQUIRED');

    // 8. Labels
    let responseTimeLabel = "New responder";
    if (offersResponded > 0) {
        if (medianResponseTimeSec < 300) responseTimeLabel = "Usually responds instantly";
        else if (medianResponseTimeSec < 1800) responseTimeLabel = "Usually responds quickly";
        else if (medianResponseTimeSec < 7200) responseTimeLabel = "Usually responds within a few hours";
        else if (medianResponseTimeSec < 86400) responseTimeLabel = "Usually responds within a day";
        else responseTimeLabel = "Slow responder";
    }

    return {
        trustScore,
        riskScore,
        trustConfidence,
        metrics: {
            offersReceived, offersAccepted, offersRejected, offersResponded,
            completedSwaps, cancellations: userCancellations, noShows, confirmedViolations,
            acceptanceRate: Math.round(acceptanceRate),
            responseRate: Math.round(responseRate),
            completionRate: Math.round(completionRate),
            cancellationRate: Math.round(cancellationRate),
            noShowRate: Math.round(noShowRate),
            medianResponseTimeSec
        },
        badges,
        responseTimeLabel,
        safeguardsRequired
    };
  },

  // Backward compatible mock generator for UI test data
  generateMockEvents(stats: any): TrustEvent[] {
      const events: TrustEvent[] = [];
      const now = Date.now();
      
      const compSwaps = stats.completedSwaps || 0;
      const accRate = stats.acceptanceRate ? (stats.acceptanceRate / 100) : 0.9;
      
      const offAcc = compSwaps > 0 ? Math.max(compSwaps, Math.floor(compSwaps * 1.05)) : 5;
      const offRej = Math.floor(offAcc / accRate) - offAcc;
      const offRec = offAcc + offRej;
      
      let respSec = 1800; // 30 min default

      for (let i = 0; i < offRec; i++) {
          const t = now - (i * 86400000) - 100000;
          events.push({ id: `er_${i}`, type: 'OFFER_RECEIVED', timestamp: t });
          
          if (i < offAcc) {
              events.push({ id: `ea_${i}`, type: 'OFFER_ACCEPTED', timestamp: t + (respSec * 1000) });
              if (i < compSwaps) {
                  events.push({ id: `ec_${i}`, type: 'SWAP_COMPLETED', timestamp: t + (respSec * 1000) + 172800000 });
              } else {
                  events.push({ id: `cx_${i}`, type: 'SWAP_CANCELLED_USER', timestamp: t + 86400000 });
              }
          } else {
              events.push({ id: `ej_${i}`, type: 'OFFER_REJECTED', timestamp: t + (respSec * 1000) });
          }
      }
      
      return events;
  }
};
