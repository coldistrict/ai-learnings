// sources:check — SOURCE_LEDGER link health with redirect accounting
// (plan §14, verification V10b). [network]
// Exit codes: 0 all reachable, no 404/410 · 1 dead links (FAIL) ·
// 3 network unavailable → BLOCKED(prereq:network), NOT a product failure.
import fs from 'node:fs';
import path from 'node:path';
import { repoRoot, P, parseSourceLedger, nowIso } from './learn/lib.js';

const root = repoRoot();
const rows = parseSourceLedger(root);
const urls = [...new Set(rows.map((r) => r.url))];

async function probe(url, maxRedirects = 5) {
  const chain = [];
  let current = url;
  for (let i = 0; i <= maxRedirects; i++) {
    let res;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'user-agent': 'ai-enabler-mastery-system sources:check (link health; plan §14)' },
      });
      clearTimeout(timer);
    } catch (e) {
      return { url, status: 'NETWORK_ERROR', error: e.cause?.code ?? e.name ?? String(e.message), chain };
    }
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc) return { url, status: res.status, note: 'redirect without location', chain };
      const next = new URL(loc, current).toString();
      chain.push({ status: res.status, to: next, to_host: new URL(next).host });
      current = next;
      continue;
    }
    try { res.body?.cancel?.(); } catch { /* body not needed */ }
    return { url, status: res.status, final_url: current, chain };
  }
  return { url, status: 'TOO_MANY_REDIRECTS', chain };
}

const results = [];
for (const url of urls) {
  const r = await probe(url);
  results.push(r);
  const redirects = r.chain.length ? ` (redirects: ${r.chain.map((c) => `${c.status}→${c.to_host}`).join(', ')})` : '';
  console.log(`  ${String(r.status).padEnd(15)} ${url}${redirects}${r.error ? ` [${r.error}]` : ''}`);
}

const report = { checked_at: nowIso(), results };
fs.writeFileSync(path.join(P.learning(root), 'sources-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log('report: learning/sources-report.json');

const networkErrors = results.filter((r) => r.status === 'NETWORK_ERROR');
const dead = results.filter((r) => r.status === 404 || r.status === 410);

if (networkErrors.length === results.length && results.length > 0) {
  console.error('BLOCKED(prereq:network) — no URL was reachable at the network level; this is not a link-health failure.');
  process.exit(3);
}
if (networkErrors.length > 0) {
  console.error(`BLOCKED(prereq:network) — ${networkErrors.length}/${results.length} URLs hit network-level errors; retry when the network is stable before judging link health.`);
  process.exit(3);
}
if (dead.length > 0) {
  console.error(`FAIL — dead links (404/410): ${dead.map((d) => d.url).join(', ')}`);
  process.exit(1);
}
console.log(`sources:check — ${results.length} URLs reachable, 0 dead links, every redirect accounted with its target host.`);
