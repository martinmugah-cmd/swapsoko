const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// 1. In onSend for SwapAgreementModal (which creates a pending agreement)
// Wait, when they send an agreement, it is "pending" for the other person to "accept".
// The existing onSend does: handleSend("[SWAP_AGREEMENT]" + JSON.stringify(data), "text");
const onSendMatch = /onSend=\{\s*async\s*\(\w*\)\s*=>\s*\{[\s\S]*?handleSend\("\[SWAP_AGREEMENT\]"[\s\S]*?\}\s*\}/;

const onSendReplacement = `onSend={async (data) => {
               try {
                 const partnerId = room.user1Id === user?.id ? room.user2Id : room.user1Id;
                 await supabase.from('proposals').insert({
                    from_user_id: user?.id,
                    to_user_id: partnerId,
                    listing_id: agreementState.listingId,
                    status: 'pending',
                    message: data.itemsExchanged,
                    cash_top_up: data.cashTopUp ? parseInt(data.cashTopUp) : 0
                 });
                 handleSend("[SWAP_AGREEMENT]" + JSON.stringify(data), "text");
                 setAgreementState({isOpen: false});
               } catch (e: any) {
                 toast.error("Error sending agreement: " + e.message);
               }
            }}`;
            
code = code.replace(onSendMatch, onSendReplacement);

// 2. In onFinalize (when they Accept the agreement)
const onFinalizeMatch = /onFinalize=\{\s*async\s*\(\w*\)\s*=>\s*\{[\s\S]*?deleteListingMutation\.mutate[\s\S]*?\}\s*\}/;

const onFinalizeReplacement = `onFinalize={async (data) => {
               const partnerId = room.user1Id === user?.id ? room.user2Id : room.user1Id;
               deleteListingMutation.mutate({ id: agreementState.listingId! });
               if (agreementState.msgId) {
                 await supabase.from('messages').update({ content: "[AGREEMENT_SIGNED]" + JSON.stringify(data) }).eq('id', agreementState.msgId);
               }
               // Mark as completed in proposals table
               await supabase.from('proposals').update({ status: 'completed' })
                 .or(\`from_user_id.eq.\${partnerId},to_user_id.eq.\${partnerId}\`)
                 .eq('listing_id', agreementState.listingId);
                 
               handleSend("[RECEIPT]" + JSON.stringify({...data, timestamp: Date.now(), partnerName}), "text");
            }}`;

code = code.replace(onFinalizeMatch, onFinalizeReplacement);

// 3. For rejection, the function is handleRejectProposal in Chat.tsx
// Let's find handleRejectProposal
const handleRejectMatch = /const handleRejectProposal = \([\s\S]*?handleSend\("\[REJECT_PROPOSAL\]" \+ rawContent, "text"\);\s*\}/;
if (handleRejectMatch.test(code)) {
    code = code.replace(handleRejectMatch, (match) => {
        return match.replace(/handleSend\("\[REJECT_PROPOSAL\]" \+ rawContent, "text"\);/, `
    const partnerId = room.user1Id === user?.id ? room.user2Id : room.user1Id;
    supabase.from('proposals').update({ status: 'rejected' })
       .or(\`from_user_id.eq.\${partnerId},to_user_id.eq.\${partnerId}\`)
       .neq('status', 'completed').then();
    handleSend("[REJECT_PROPOSAL]" + rawContent, "text");`);
    });
}

// 4. For countering, handleCounterProposal
const handleCounterMatch = /const handleCounterProposal = \([\s\S]*?setAgreementState\(\{ isOpen: true, listingId: room\.listingId \}\);\s*\}/;
if (handleCounterMatch.test(code)) {
    code = code.replace(handleCounterMatch, (match) => {
        return match.replace(/setAgreementState\(\{ isOpen: true, listingId: room\.listingId \}\);/, `
    const partnerId = room.user1Id === user?.id ? room.user2Id : room.user1Id;
    supabase.from('proposals').update({ status: 'countered' })
       .or(\`from_user_id.eq.\${partnerId},to_user_id.eq.\${partnerId}\`)
       .neq('status', 'completed').then();
    setAgreementState({ isOpen: true, listingId: room.listingId });`);
    });
}

fs.writeFileSync('src/pages/Chat.tsx', code);
console.log("Chat proposals sync fixed");
