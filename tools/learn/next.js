// learn:next — resolve what "Teach me the next session" means (plan §9.4).
// Priority: interrupted live session → mandatory remediation → due durable
// check → current milestone gate / next dependency-ordered module.
import { repoRoot, nextAction } from './lib.js';

const { class: cls, text } = nextAction(repoRoot());
console.log(`next-action-class: ${cls}`);
console.log(`next: ${text}`);
