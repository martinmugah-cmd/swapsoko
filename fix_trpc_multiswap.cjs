const fs = require('fs');
let code = fs.readFileSync('client/src/lib/trpc.ts', 'utf8');

// 1. Import MultiSwapEngine
if (!code.includes('MultiSwapEngine')) {
    code = code.replace("import { MatchEngine } from './engines/MatchEngine';", "import { MatchEngine } from './engines/MatchEngine';\nimport { MultiSwapEngine } from './engines/MultiSwapEngine';");
}

// 2. Add the multiswap endpoint
const search = `    discover: {`;
const replace = `    multiSwap: {
        discover: {
            useQuery: (input: any, opts: any) => {
                return useQuery({
                    queryKey: ['multiSwap.discover', input],
                    queryFn: async () => {
                        await new Promise(r => setTimeout(r, 600));
                        // Mock the allUsers by duplicating the main profile for now, just for discovery demo
                        const mockUsers = [
                           { id: 'user_martin', wishes: [{ category: 'Electronics' }] },
                           { id: 'user_john', wishes: [{ category: 'Vehicles' }] },
                           { id: 'user_brian', wishes: [{ category: 'Fashion' }] }
                        ];
                        const mockListings = camelData.map((l, i) => ({
                            ...l,
                            userId: i % 3 === 0 ? 'user_martin' : (i % 3 === 1 ? 'user_john' : 'user_brian')
                        }));
                        
                        const chains = MultiSwapEngine.discoverCycles('user_martin', mockListings[0].id, mockListings, mockUsers);
                        return chains;
                    },
                    ...opts
                });
            }
        }
    },
    discover: {`;

code = code.replace(search, replace);

fs.writeFileSync('client/src/lib/trpc.ts', code);
console.log("trpc.ts updated with multiswap!");
