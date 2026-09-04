/* Generate the inline-SVG QR path used on 5/tallwood.html.

   The page ships the matrix as a hard-coded <path> so it costs nothing at
   runtime and cannot fail to render. Re-run this if the published URL changes,
   then paste the printed path into the .qr <svg> in 5/tallwood.html.

   The <svg> keeps a viewBox of "-4 -4 41 41" — the 4-module margin either side
   is the quiet zone, without which many scanners will not read the code.

   Usage: node tools/qr.js [url]
*/
const QR = require('qrcode');

const url = process.argv[2] || 'https://suyash503.github.io/LandingPage/5/tallwood.html';
const q = QR.create(url, { errorCorrectionLevel: 'M' });
const size = q.modules.size;
const data = q.modules.data;

// Merge horizontal runs into single rects — roughly halves the path length.
let d = '';
for (let y = 0; y < size; y++) {
  let x = 0;
  while (x < size) {
    if (!data[y * size + x]) { x++; continue; }
    let run = 0;
    while (x + run < size && data[y * size + x + run]) run++;
    d += 'M' + x + ' ' + y + 'h' + run + 'v1h-' + run + 'z';
    x += run;
  }
}

console.log('url:      ' + url);
console.log('modules:  ' + size + 'x' + size + '  (viewBox "-4 -4 ' + (size + 8) + ' ' + (size + 8) + '")');
console.log('path len: ' + d.length);
console.log('');
console.log(d);
