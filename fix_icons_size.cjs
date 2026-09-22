const fs = require('fs');
let code = fs.readFileSync('client/src/lib/icons.tsx', 'utf8');

// The exported signature is:
// export const Heart = (props: React.SVGProps<SVGSVGElement>) => (
//   <svg width="158" height="159" viewBox="0 0 158 159" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>

code = code.replace(/\(props: React\.SVGProps<SVGSVGElement>\) => \(\n  <svg([^>]+)\{\.\.\.props\}>/g, (match, p1) => {
  // we want to intercept the size prop
  return `({ size, ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (\n  <svg width={size || "24"} height={size || "24"}${p1}{...props}>`;
});

// Since the original SVGs had hardcoded width="158" height="159" from the replace string above, 
// wait, the hardcoded width and height are BEFORE {...props}.
// If I inject `width={size || "24"} height={size || "24"}` and then the original `width="158" height="159"` remains, it will be invalid or overriden by the original.
// Let's remove the original hardcoded width/height entirely.
code = code.replace(/width="[0-9]+"\s+height="[0-9]+"\s+/g, '');

fs.writeFileSync('client/src/lib/icons.tsx', code);
console.log('Fixed size props!');
