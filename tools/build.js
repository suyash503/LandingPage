/* Re-inject `src/foldline.template.html` into the published bundle.
   The bundle stores the template as a single JSON-encoded line; everything
   else in the file (asset manifest, loader runtime) is left untouched. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BUNDLE = path.join(ROOT, 'index.html');
const SRC = path.join(ROOT, 'src', 'foldline.template.html');

const lines = fs.readFileSync(BUNDLE, 'utf8').split('\n');
const idx = lines.findIndex((l) => l.trim().startsWith('<script type="__bundler/template">'));
if (idx === -1) throw new Error('template script tag not found');

// Normalised so a CRLF checkout on Windows can't change the output.
const template = fs.readFileSync(SRC, 'utf8').split('\r\n').join('\n');

// The loader reads this line with JSON.parse, so `</script>` has to stay
// escaped exactly the way the publisher escapes it.
const SLASH_ESC = '<' + String.fromCharCode(92) + 'u002F';
lines[idx + 1] = JSON.stringify(template).split('</').join(SLASH_ESC);

fs.writeFileSync(BUNDLE, lines.join('\n'), 'utf8');
console.log('rebuilt index.html (' + template.length + ' template bytes)');
