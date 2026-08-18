/* Extract the editable template out of the published single-file bundle.
   Run once; after that `src/foldline.template.html` is the source of truth. */
const fs = require('fs');
const path = require('path');

const BUNDLE = path.join(__dirname, '..', 'index.html');
const OUT = path.join(__dirname, '..', 'src', 'foldline.template.html');

const lines = fs.readFileSync(BUNDLE, 'utf8').split('\n');
const idx = lines.findIndex((l) => l.trim().startsWith('<script type="__bundler/template">'));
if (idx === -1) throw new Error('template script tag not found');

fs.writeFileSync(OUT, JSON.parse(lines[idx + 1]), 'utf8');
console.log('wrote', OUT);
