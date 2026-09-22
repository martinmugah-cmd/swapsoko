const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Chat.tsx', 'utf8');

// The faulty replacements I want to undo. Let's just find and replace the specific strings.

// 1. ChatBubble cycle card click
content = content.replace(
  'onClick={async () => {\n              if (isSubmitting) return;\n              setIsSubmitting(true); \n                                 if (!isOwnListing) {',
  'onClick={async () => {\n                                 if (!isOwnListing) {'
);

// 2. ChatRoom header click
content = content.replace(
  '        <button onClick={async () => {\n              if (isSubmitting) return;\n              setIsSubmitting(true); if (room?.user2Id === null) setShowMenu(true); else navigate(`/profile/${partnerId}`); }} className="flex items-center gap-2 flex-1 min-w-0 text-left">',
  '        <button onClick={async () => { if (room?.user2Id === null) setShowMenu(true); else navigate(`/profile/${partnerId}`); }} className="flex items-center gap-2 flex-1 min-w-0 text-left">'
);

// 3. Report user click
content = content.replace(
  '                <button onClick={async () => {\n              if (isSubmitting) return;\n              setIsSubmitting(true); setShowMenu(false); setIsReporting(true); }} className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 font-bold border-t border-gray-100">Report User</button>',
  '                <button onClick={async () => { setShowMenu(false); setIsReporting(true); }} className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 font-bold border-t border-gray-100">Report User</button>'
);

// 4. Reject offer close button
content = content.replace(
  '                <button onClick={async () => {\n              if (isSubmitting) return;\n              setIsSubmitting(true); setRejectState({isOpen: false}); setCustomRejectMsg(""); }} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">',
  '                <button onClick={async () => { setRejectState({isOpen: false}); setCustomRejectMsg(""); }} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">'
);

// 5. Reject offer submit button
content = content.replace(
  '                  onClick={async () => {\n              if (isSubmitting) return;\n              setIsSubmitting(true);\n                    if (customRejectMsg.trim()) handleRejectSubmit(customRejectMsg);\n                  }}',
  '                  onClick={async () => {\n                    if (customRejectMsg.trim()) handleRejectSubmit(customRejectMsg);\n                  }}'
);

// 6. Image attach button
content = content.replace(
  '              <button onClick={async () => {\n              if (isSubmitting) return;\n              setIsSubmitting(true); fileInputRef.current?.click(); setShowQuickReplies(false); }} className="flex flex-col items-center flex-shrink-0">',
  '              <button onClick={async () => { fileInputRef.current?.click(); setShowQuickReplies(false); }} className="flex flex-col items-center flex-shrink-0">'
);

// 7. Fix pData
content = content.replace(/pData\.proposalId/g, 'room?.proposalId');

fs.writeFileSync('client/src/pages/Chat.tsx', content);
console.log('Fixed Chat.tsx using Node');
