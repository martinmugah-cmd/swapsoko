const fs = require('fs');

const files = [
    'src/pages/Swipes.tsx',
    'src/pages/SwapWishes.tsx',
    'src/pages/SwapGuru.tsx',
    'src/pages/CommunityDetail.tsx'
];

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace:
    // toast.dismiss(toastId);
    // toast.success("Proposal sent!");
    // With:
    // toast.success("Proposal sent!", { id: toastId });
    code = code.replace(/toast\.dismiss\(toastId\);\s*toast\.success\("Proposal sent!"\);/g, 'toast.success("Proposal sent!", { id: toastId });');

    // Replace:
    // toast.dismiss(toastId);
    // toast.error("Failed to send proposal");
    // With:
    // toast.error("Failed to send proposal", { id: toastId });
    code = code.replace(/toast\.dismiss\(toastId\);\s*toast\.error\("Failed to send proposal"\);/g, 'toast.error("Failed to send proposal", { id: toastId });');
    
    // Some might have error.message
    code = code.replace(/toast\.dismiss\(toastId\);\s*toast\.error\("Failed to send proposal: " \+ error\.message\);/g, 'toast.error("Failed to send proposal: " + error.message, { id: toastId });');
    
    fs.writeFileSync(file, code);
});

console.log("Fixed toasts!");
