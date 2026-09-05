// Read-only. --root supports isolated fixtures; never writes or repairs files.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkCourse } from './lib.js';
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--root')) {
  console.error('usage: npm run course:check [-- --root <scratch-root>]');
  process.exit(2);
}
const root = args.length ? path.resolve(args[1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { errors, stats } = checkCourse(root);
for (const error of errors) console.error(`course:check: ${error}`);
console.log(`course:check: ${errors.length ? 'FAIL' : 'PASS'} — ${stats.topics} topics, ${stats.subskills ?? 0} subskills, ${stats.hours ?? '?'} estimated hours, ${stats.chaptersPending} chapters pending; ${stats.links} local references and ${stats.sources} source uses checked.`);
console.log('Structural consistency and traceability only; no source freshness, live validation, mastery or teaching-effectiveness claim.');
process.exitCode = errors.length ? 1 : 0;
