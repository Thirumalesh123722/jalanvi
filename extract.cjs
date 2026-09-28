const fs = require('fs');
const content = fs.readFileSync('C:/Users/K TIRUMALESH/.gemini/antigravity/brain/d7cbc249-3ed0-46b3-b16a-9226f4306304/.system_generated/steps/2/content.md', 'utf8');

const target = 'freeze the scope now';
const idx = content.indexOf(target);
console.log('Index of freeze scope:', idx);
if (idx !== -1) {
  // Extract 60k characters from here
  const text = content.substring(idx - 100, idx + 80000);
  // Unescape \n, \", etc.
  const cleaned = text
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\t/g, '\t');
  fs.writeFileSync('C:/Users/K TIRUMALESH/.gemini/antigravity/brain/d7cbc249-3ed0-46b3-b16a-9226f4306304/master_plan.txt', cleaned);
  console.log('Saved master plan text!');
}
