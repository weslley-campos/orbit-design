// Appends ?v=<version> to the relative script and stylesheet URLs of a built copy of design/,
// so a deploy never mixes freshly fetched files with modules the browser still has cached.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const [dir, version] = process.argv.slice(2);
if (!dir || !version) throw new Error('usage: node stamp-version.mjs <dir> <version>');

const stamp = (url) => `${url}?v=${version}`;
const rules = {
  '.js': [/(\b(?:from|import)\s*\(?\s*)(['"])(\.{1,2}\/[^'"?]+\.js)\2/g, (_, lead, quote, url) => `${lead}${quote}${stamp(url)}${quote}`],
  '.html': [/\b((?:href|src)=")([^":?#]+\.(?:js|css))"/g, (_, lead, url) => `${lead}${stamp(url)}"`],
};

let files = 0;
for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
  const rule = rules[extname(entry.name)];
  if (!entry.isFile() || !rule) continue;
  const path = join(entry.parentPath, entry.name);
  const text = readFileSync(path, 'utf8');
  const next = text.replace(...rule);
  if (next !== text) { writeFileSync(path, next); files += 1; }
}
console.log(`stamped ${files} files with v=${version}`);
