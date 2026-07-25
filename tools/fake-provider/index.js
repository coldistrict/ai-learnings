// Deterministic fake provider (tutor-owned fixture infrastructure; plan §5.3
// provider sequence: fake → replay → real; Stage 2 authorizes this fake).
// Zero network, zero nondeterminism: behavior is fully scripted per call.
//
//   const p = createFakeProvider({ script: [ ...steps ] });
//   const { text, usage } = await p.complete({ system, input });
//
// Step kinds:
//   { kind: 'ok', json: {...} }            → JSON.stringify(json) as text
//   { kind: 'ok_text', text: '...' }       → raw text (e.g. JSON with issues)
//   { kind: 'malformed', text?: '...' }    → non-JSON prose (default provided)
//   { kind: 'rate_limit', retry_after_ms } → throws code RATE_LIMITED
//   { kind: 'unavailable' }                → throws code PROVIDER_UNAVAILABLE
//   { kind: 'invalid_request' }            → throws code INVALID_REQUEST
//   { kind: 'hang', ms }                   → resolves normally after ms
// Any step may carry usage: { input_tokens, output_tokens }; otherwise usage
// is derived deterministically from input/output lengths.
// The script is consumed one step per complete() call; running past the end
// throws code SCRIPT_EXHAUSTED so tests fail loudly instead of looping.

export class ProviderError extends Error {
  constructor(code, message, extra = {}) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
    Object.assign(this, extra);
  }
}

const DEFAULT_MALFORMED =
  'Sure! Based on the evidence, the incident looks like a pagination issue. '
  + '{"category": "cursor-pagination", "causal_service": "reconciliation-scanner"'; // truncated on purpose

function tokens(s) {
  return Math.max(1, Math.ceil(String(s ?? '').length / 4));
}

export function createFakeProvider({ script = [], name = 'fake-provider' } = {}) {
  let cursor = 0;
  const calls = [];

  async function complete(request = {}) {
    const call = { index: cursor, request };
    calls.push(call);
    if (cursor >= script.length) {
      throw new ProviderError('SCRIPT_EXHAUSTED',
        `${name}: script exhausted after ${script.length} step(s) — the code under test called the provider more times than the fixture allows`);
    }
    const step = script[cursor++];
    const inTok = step.usage?.input_tokens ?? tokens(`${request.system ?? ''}${request.input ?? ''}`);

    switch (step.kind) {
      case 'ok': {
        const text = JSON.stringify(step.json);
        return { text, usage: { input_tokens: inTok, output_tokens: step.usage?.output_tokens ?? tokens(text) } };
      }
      case 'ok_text': {
        return { text: step.text, usage: { input_tokens: inTok, output_tokens: step.usage?.output_tokens ?? tokens(step.text) } };
      }
      case 'malformed': {
        const text = step.text ?? DEFAULT_MALFORMED;
        return { text, usage: { input_tokens: inTok, output_tokens: step.usage?.output_tokens ?? tokens(text) } };
      }
      case 'rate_limit':
        throw new ProviderError('RATE_LIMITED', `${name}: rate limited`, { retry_after_ms: step.retry_after_ms ?? 1000 });
      case 'unavailable':
        throw new ProviderError('PROVIDER_UNAVAILABLE', `${name}: temporarily unavailable`);
      case 'invalid_request':
        throw new ProviderError('INVALID_REQUEST', `${name}: request rejected as invalid (non-retryable)`);
      case 'hang': {
        await new Promise((res) => setTimeout(res, step.ms ?? 5000));
        const text = JSON.stringify(step.json ?? { late: true });
        return { text, usage: { input_tokens: inTok, output_tokens: tokens(text) } };
      }
      default:
        throw new ProviderError('BAD_FIXTURE', `${name}: unknown script step kind ${step.kind}`);
    }
  }

  return { name, complete, calls, get remaining() { return script.length - cursor; } };
}
