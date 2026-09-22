export interface ValuationResult {
    estimatedMin: number;
    estimatedMax: number;
    estimatedMid: number;
    tradeValue: number;
    confidence: 'High' | 'Medium' | 'Low';
    modelVersion: string;
    breakdown: {
        baseValue: number;
        conditionMultiplier: number;
        ageMultiplier: number;
        demandMultiplier: number;
        brandPremium: number;
    };
}

export const ValueEstimationEngine = {
    /**
     * Chapter 4, Section 30: Hybrid Valuation Model
     * Base Comparable Value + Condition + Age + Demand + Local Market + Trade-Liquidity = Estimated Trade Value
     */
    estimateValue(item: any): ValuationResult {
        // 1. BASE VALUE (Fallback for missing market data)
        const categoryBaseValues: Record<string, number> = {
            'Electronics': 40000,
            'Phones': 50000,
            'Laptops': 65000,
            'Gaming': 45000,
            'Fashion': 8000,
            'Vehicles': 800000,
            'Furniture': 25000,
            'Books': 2000
        };
        
        // Normally we would query the database for comparable completed swaps here (Section 11).
        // Since this is a synchronous mock engine, we rely on the user's cash top-up or expected value as a baseline hint if available,
        // otherwise we fallback to category base.
        let baseValue = item.cashTopUp ? item.cashTopUp : categoryBaseValues[item.category] || 15000;
        
        // 2. CONDITION ADJUSTMENT (Section 13)
        // Like New = 1.0, Good = 0.85, Fair = 0.65, Poor = 0.40
        let conditionMultiplier = 0.85; // Default Good
        if (item.condition) {
            const cond = item.condition.toLowerCase();
            if (cond.includes('new') || cond.includes('excellent')) conditionMultiplier = 1.0;
            else if (cond.includes('fair') || cond.includes('okay')) conditionMultiplier = 0.65;
            else if (cond.includes('poor') || cond.includes('broken')) conditionMultiplier = 0.40;
        }

        // 3. AGE DEPRECIATION (Section 14)
        // Different categories depreciate differently.
        let ageMultiplier = 0.90; // Default 10% depreciation
        if (item.category === 'Electronics' || item.category === 'Phones' || item.category === 'Laptops') {
            // Fast depreciation
            ageMultiplier = 0.75; 
        } else if (item.category === 'Furniture') {
            // Slow depreciation
            ageMultiplier = 0.95;
        }

        // 4. BRAND PREMIUM (Section 15)
        let brandPremium = 1.0;
        const titleStr = (item.title || "").toLowerCase();
        if (titleStr.includes('apple') || titleStr.includes('macbook') || titleStr.includes('iphone')) {
            brandPremium = 1.25; // 25% premium for Apple
        } else if (titleStr.includes('playstation') || titleStr.includes('ps5')) {
            brandPremium = 1.15;
        } else if (titleStr.includes('samsung') && titleStr.includes('galaxy s')) {
            brandPremium = 1.10;
        }

        // 5. DEMAND ADJUSTMENT (Section 16 & 17)
        // Highly searched items bump trade liquidity
        let demandMultiplier = 1.0;
        if (item.likesCount && item.likesCount > 10) {
            demandMultiplier = 1.10; // High demand -> 10% bump
        }

        // --- FINAL CALCULATION ---
        const estimatedMid = Math.round(baseValue * conditionMultiplier * ageMultiplier * brandPremium);
        
        // Range generation (Section 19: The Value Range)
        const estimatedMin = Math.round(estimatedMid * 0.90); // -10%
        const estimatedMax = Math.round(estimatedMid * 1.10); // +10%

        // Trade Value (Section 18: Market vs Trade Value)
        // Desirable items get a trade value bump
        const tradeValue = Math.round(estimatedMid * demandMultiplier);

        // Confidence Score (Section 20)
        let confidence: 'High' | 'Medium' | 'Low' = 'Medium';
        if (item.condition && item.title && item.category) {
            confidence = 'High';
        } else if (!item.category) {
            confidence = 'Low';
        }

        return {
            estimatedMin,
            estimatedMax,
            estimatedMid,
            tradeValue,
            confidence,
            modelVersion: "valuation_v1",
            breakdown: {
                baseValue,
                conditionMultiplier,
                ageMultiplier,
                brandPremium,
                demandMultiplier
            }
        };
    },

    /**
     * Chapter 4, Section 22: The Fair Trade Indicator
     */
    compareValues(userItemValue: number, targetItemValue: number) {
        const diff = Math.abs(userItemValue - targetItemValue);
        const maxVal = Math.max(userItemValue, targetItemValue);
        const gapPercentage = diff / (maxVal || 1);

        if (gapPercentage <= 0.15) {
            return {
                status: 'CLOSE_VALUE',
                label: '🟢 CLOSE VALUE',
                difference: diff
            };
        } else {
            return {
                status: 'VALUE_GAP',
                label: '🟠 VALUE GAP',
                difference: diff
            };
        }
    }
};
