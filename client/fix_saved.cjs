const fs = require('fs');
let code = fs.readFileSync('src/lib/trpc.ts', 'utf8');

// Insert idIn support in trpc.ts generic query builder
const match = /if \(input && input\.roomId\) \{/;
code = code.replace(match, `if (input && (input as any).idIn && Array.isArray((input as any).idIn) && (input as any).idIn.length > 0) {
                 query = query.in('id', (input as any).idIn);
              }
              
              if (input && input.roomId) {`);

fs.writeFileSync('src/lib/trpc.ts', code);

// Now fix Profile.tsx
let prof = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
prof = prof.replace(
    /const feedQuery = trpc\.listings\.feed\.useQuery\(\{ limit: 100 \}, \{ enabled: isAuthenticated && activeTab === "saved" \}\);/,
    `const feedQuery = trpc.listings.list.useQuery({ idIn: savedItemIds.length > 0 ? savedItemIds.map(Number) : [-1] } as any, { enabled: isAuthenticated && activeTab === "saved" });`
);

prof = prof.replace(
    /const wishesFeedQuery = trpc\.wishes\.list\.useQuery\(\{\}, \{ enabled: isAuthenticated && activeTab === "saved" \}\);/,
    `const wishesFeedQuery = trpc.wishes.list.useQuery({ idIn: savedWishIds.length > 0 ? savedWishIds.map(Number) : [-1] } as any, { enabled: isAuthenticated && activeTab === "saved" });`
);

prof = prof.replace(
    /const communitiesQuery = trpc\.communities\.list\.useQuery\(\{\}, \{ enabled: isAuthenticated && activeTab === "saved" \}\);/,
    `const communitiesQuery = trpc.communities.list.useQuery({ idIn: watchedCommunityIds.length > 0 ? watchedCommunityIds.map(Number) : [-1] } as any, { enabled: isAuthenticated && activeTab === "saved" });`
);

fs.writeFileSync('src/pages/Profile.tsx', prof);
console.log("Saved tab fixed");
