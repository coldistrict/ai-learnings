// learn:regen — regenerate the three views from closed journals (plan §9.1).
// Deterministic and byte-stable (V6). Also repairs the state.json pointer and
// clears a stale lock left by a crash after rename (V5).
import { repoRoot, writeViews, repairPointerAndLock } from './lib.js';

const root = repoRoot();
writeViews(root);
const { pointerRepaired, lockCleared } = repairPointerAndLock(root);
console.log('Views regenerated: COMPETENCY_LEDGER.md, LEARNING_STATE.md, PROVENANCE.md');
if (pointerRepaired) console.log('Pointer repaired: learning/state.json.last_closed_session updated.');
if (lockCleared) console.log('Stale lock cleared (its session was already closed).');
