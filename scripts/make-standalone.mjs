import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
// Same production React app, packaged as a single offline HTML file.
const directory = resolve('docs');
let html = await readFile(resolve(directory, 'index.html'), 'utf8');
for (const match of [...html.matchAll(/<link\b[^>]*href=(?:"([^"]+\.css)"|'([^']+\.css)'|([^\s>]+\.css))[^>]*>/g)]) {
  const css = await readFile(resolve(directory, match[1] || match[2] || match[3]), 'utf8');
  html = html.replace(match[0], () => '<style>' + css + '</style>');
}
for (const match of [...html.matchAll(/<script\b[^>]*src=(?:"([^"]+\.js)"|'([^']+\.js)'|([^\s>]+\.js))[^>]*><\/script>/g)]) {
  const js = await readFile(resolve(directory, match[1] || match[2] || match[3]), 'utf8');
  html = html.replace(match[0], '');
  html = html.replace('</body>', () => '<script>' + js.replaceAll('</script', '<\\/script') + '</script></body>');
}
if (/<(?:script|link)\b[^>]*(?:src|href)=/.test(html) || !html.includes('createElement')) throw new Error('Standalone HTML was not bundled completely.');
await writeFile(resolve(directory, '56-booking.html'), html);
await writeFile(resolve(directory, '.nojekyll'), '');
console.log('Готово: docs/index.html и автономный docs/56-booking.html');
