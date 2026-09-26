import { MatchEngine, MatchContext } from './MatchEngine';

export interface MultiSwapEdge {
    fromUser: string;
    fromItem: string;
    toUser: string;
    toItem: string;
    matchScore: number;
}

export interface MultiSwapChain {
    id: string;
    participants: {
        userId: string;
        giveItemId: string;
        receiveItemId: string;
    }[];
    edges: MultiSwapEdge[];
    chainScore: number;
    chainTrust: number; // Lowest trust in the chain
    chainLength: number;
    logisticsKm: number;
}

export const MultiSwapEngine = {
    MAX_DEPTH: 4,
    MIN_EDGE_MATCH: 60,

    discoverCycles(startUserId: string, startItemId: string, allListings: any[], allUsers: any[]): MultiSwapChain[] {
        const chains: MultiSwapChain[] = [];
        const visitedUsers = new Set<string>();

        // We need a helper to find people who want an item
        // In a real DB, we'd query: SELECT user_id FROM wishes WHERE item_category = my_category
        // Here, we mock it by checking what other users have in their `wishes` arrays
        const findWantingUsers = (item: any) => {
             return allUsers.filter(u => u.id !== item.userId && 
                u.wishes?.some((w: any) => 
                     w.title?.toLowerCase().includes(item.category?.toLowerCase() || '') ||
                     w.category?.toLowerCase() === item.category?.toLowerCase()
                )
             );
        };

        // Standard BFS for cycle detection
        const queue: { path: any[], currentUserId: string, currentItemId: string }[] = [];
        queue.push({ path: [{ userId: startUserId, itemId: startItemId }], currentUserId: startUserId, currentItemId: startItemId });

        while (queue.length > 0) {
            const { path, currentUserId, currentItemId } = queue.shift()!;
            
            if (path.length > this.MAX_DEPTH) continue;

            const currentItem = allListings.find(l => l.id === currentItemId);
            if (!currentItem) continue;

            const candidates = findWantingUsers(currentItem);

            for (const candidate of candidates) {
                // If candidate is the start user AND we have > 1 edges, we found a cycle!
                if (candidate.id === startUserId && path.length > 1) {
                    const finalPath = [...path, { userId: startUserId, itemId: startItemId }];
                    const chain = this.buildChainFromPath(finalPath, allListings, allUsers);
                    if (chain && chain.chainScore >= this.MIN_EDGE_MATCH) {
                        chains.push(chain);
                    }
                    continue;
                }

                // Avoid loops in the middle
                if (path.some(p => p.userId === candidate.id)) continue;

                // What can this candidate offer?
                const candidateItems = allListings.filter(l => l.userId === candidate.id);
                for (const cItem of candidateItems) {
                    queue.push({
                        path: [...path, { userId: candidate.id, itemId: cItem.id }],
                        currentUserId: candidate.id,
                        currentItemId: cItem.id
                    });
                }
            }
        }

        // Rank and deduplicate
        const uniqueChains = Array.from(new Map(chains.map(c => [c.id, c])).values());
        
        return uniqueChains.sort((a, b) => {
             // Prefer shorter chains, then higher scores
             if (a.chainLength !== b.chainLength) return a.chainLength - b.chainLength;
             return b.chainScore - a.chainScore;
        });
    },

    buildChainFromPath(path: {userId: string, itemId: string}[], allListings: any[], allUsers: any[]): MultiSwapChain | null {
        const edges: MultiSwapEdge[] = [];
        const participants: any[] = [];
        let minScore = 100;
        let minTrust = 100; // Mock trust
        let totalLogistics = 0;

        for (let i = 0; i < path.length - 1; i++) {
            const current = path[i];
            const next = path[i + 1];

            const itemGiven = allListings.find(l => l.id === current.itemId);
            const itemReceived = allListings.find(l => l.id === next.itemId);

            if (!itemGiven || !itemReceived) return null;

            // Mock match score for edge
            // In reality we'd run MatchEngine.calculateMatch(itemGiven, { userWishes: ..., userStats: ... })
            const edgeScore = Math.floor(Math.random() * (98 - 75 + 1)) + 75; // Mock 75-98%
            if (edgeScore < minScore) minScore = edgeScore;

            edges.push({
                fromUser: current.userId,
                fromItem: current.itemId,
                toUser: next.userId,
                toItem: next.itemId,
                matchScore: edgeScore
            });

            participants.push({
                userId: current.userId,
                giveItemId: current.itemId,
                receiveItemId: next.itemId
            });

            totalLogistics += Math.floor(Math.random() * 10) + 2; // Mock 2-12 km per leg
        }

        const id = participants.map(p => p.userId).join('->');

        return {
            id,
            participants,
            edges,
            chainScore: minScore,
            chainTrust: 85, // Mock high trust for now
            chainLength: participants.length,
            logisticsKm: totalLogistics
        };
    }
};
