import { ValueEstimationEngine } from './ValueEstimationEngine';

export type GuruIntent = 
  | 'VALUE_ANALYSIS' 
  | 'TRADE_ANALYSIS' 
  | 'TRADE_DISCOVERY' 
  | 'NEGOTIATION' 
  | 'GENERAL';

export interface GuruResponse {
  text: string;
  actions?: { label: string; actionType: string; payload?: any }[];
  contextData?: any;
}

export const SwapGuruEngine = {
  /**
   * Mock Intent Classifier (Section 7)
   */
  detectIntent(message: string): GuruIntent {
    const lower = message.toLowerCase();
    if (lower.includes('worth') || lower.includes('value') || lower.includes('how much')) {
      return 'VALUE_ANALYSIS';
    }
    if (lower.includes('fair') || lower.includes('good trade') || lower.includes('offer')) {
      return 'TRADE_ANALYSIS';
    }
    if (lower.includes('trade for') || lower.includes('what can i get') || lower.includes('find me')) {
      return 'TRADE_DISCOVERY';
    }
    if (lower.includes('counter') || lower.includes('negotiate')) {
      return 'NEGOTIATION';
    }
    return 'GENERAL';
  },

  /**
   * The Core Orchestrator (Section 46: SwapGuru should not replace other engines, it orchestrates them)
   */
  async processMessage(message: string, userListings: any[], targetListing?: any): Promise<GuruResponse> {
    const intent = this.detectIntent(message);

    // Default Fallback
    let response: GuruResponse = {
      text: "I'm your SwapGuru. I can help you evaluate trades, check market values, and find the perfect swap. What are you looking to do?",
    };

    if (intent === 'VALUE_ANALYSIS') {
      // Find what they are asking about
      const itemToValue = targetListing || (userListings.length > 0 ? userListings[0] : null);
      if (!itemToValue) {
        return { text: "I need to know which item you want me to evaluate. Select one of your items or a listing." };
      }
      
      const valuation = ValueEstimationEngine.estimateValue(itemToValue);
      response.text = `Based on current SwapSoko data, the **${itemToValue.title}** is estimated at:\n\n**KES ${valuation.estimatedMin.toLocaleString()} – ${valuation.estimatedMax.toLocaleString()}**\nTypical trade value: ~KES ${valuation.tradeValue.toLocaleString()}\n\nConfidence: ${valuation.confidence}`;
      response.actions = [
        { label: "Find trades for this", actionType: "NAVIGATE", payload: "/swipes" }
      ];
    }

    if (intent === 'TRADE_ANALYSIS' && targetListing && userListings.length > 0) {
      // Assume trading their first item for the target listing
      const myItem = userListings[0];
      const myVal = ValueEstimationEngine.estimateValue(myItem);
      const theirVal = ValueEstimationEngine.estimateValue(targetListing);
      
      const fairness = ValueEstimationEngine.compareValues(myVal.tradeValue, theirVal.tradeValue);
      
      response.text = `**Trade Analysis**\n\nYour ${myItem.title}: ~KES ${myVal.tradeValue.toLocaleString()}\nTheir ${targetListing.title}: ~KES ${theirVal.tradeValue.toLocaleString()}\n\n**Assessment:**\n${fairness.label} (Gap: KES ${fairness.difference.toLocaleString()})\n\n`;
      
      if (theirVal.tradeValue > myVal.tradeValue) {
        response.text += `The estimated values differ. Consider negotiating for a cash top-up of around KES ${fairness.difference.toLocaleString()} to balance the trade.`;
        response.actions = [
          { label: "Create Counter Offer", actionType: "PROPOSE_SWAP", payload: { listingId: targetListing.id, cashTopUp: fairness.difference } }
        ];
      } else {
        response.text += `This looks like a solid trade based on estimated market value!`;
        response.actions = [
          { label: "Send Offer", actionType: "PROPOSE_SWAP", payload: { listingId: targetListing.id, cashTopUp: 0 } }
        ];
      }
    }

    if (intent === 'TRADE_DISCOVERY') {
       if (userListings.length > 0) {
         const myItem = userListings[0];
         const myVal = ValueEstimationEngine.estimateValue(myItem);
         response.text = `Your **${myItem.title}** has a trade value around KES ${myVal.tradeValue.toLocaleString()}.\n\nBased on your inventory, you could realistically trade for:\n- Premium electronics in the KES ${myVal.estimatedMin.toLocaleString()} range.\n- Or use it as part of a Multi-Swap to upgrade.`;
         response.actions = [
           { label: "Start Swiping", actionType: "NAVIGATE", payload: "/swipes" }
         ];
       } else {
         response.text = "You don't have any items listed yet! Add an item to your inventory so I can find you some great trades.";
         response.actions = [
           { label: "Post an Item", actionType: "NAVIGATE", payload: "/post" }
         ];
       }
    }

    if (intent === 'GENERAL') {
      response.text = "I'm SwapGuru, the intelligence layer connecting SwapSoko's engines. Ask me to evaluate an item, compare a trade, or find something you might like!";
    }

    return response;
  }
};
