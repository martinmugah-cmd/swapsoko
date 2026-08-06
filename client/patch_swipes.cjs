const fs = require('fs');
const file = 'src/pages/Swipes.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`  }

    <motion.div
      drag={flipped ? false : "x"}`,
`  }

  return (
    <motion.div
      drag={flipped ? false : "x"}`
);

fs.writeFileSync(file, content);
console.log('patched Swipes.tsx');
