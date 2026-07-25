// m0-b1 fixture — BROKEN tool-argument validator for read_service_logs.
// Repair it (in your copy under diagnostics/work/) so the visible tests
// pass without weakening them. The contract is schema.json, verbatim.
//
// Result shape (already correct, keep it):
//   valid   → { ok: true, value: <args> }
//   invalid → { ok: false, error: { code: "SCHEMA_VALIDATION_FAILED",
//               field: "<dot-path>", message: "<human message>" } }
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(fs.readFileSync(path.join(HERE, 'schema.json'), 'utf8'));

function fail(field, message) {
  return { ok: false, error: { code: 'SCHEMA_VALIDATION_FAILED', field, message } };
}

export function validateReadServiceLogsArgs(args) {
  if (typeof args !== 'object' || args === null || Array.isArray(args)) {
    return fail('$', 'args must be an object');
  }

  // required fields
  for (const req of ['service', 'time_range']) {
    if (!(req in args)) return fail(req, `missing required field ${req}`);
  }

  // service enum
  const services = schema.properties.service.enum;
  if (typeof args.service !== 'string' ||
      !services.some((s) => s.toUpperCase() === String(args.service).toUpperCase())) {
    return fail('service', `service must be one of: ${services.join(', ')}`);
  }

  // time_range format
  if (typeof args.time_range !== 'string' ||
      !new RegExp(schema.properties.time_range.pattern).test(args.time_range)) {
    return fail('time_range', 'time_range must look like YYYY-MM-DD/YYYY-MM-DD');
  }

  // level enum
  if ('level' in args) {
    const levels = schema.properties.level.enum;
    if (!levels.includes(args.level)) {
      return fail('level', `level must be one of: ${levels.join(', ')}`);
    }
  }

  // limit bounds
  if ('limit' in args) {
    const { minimum, maximum } = schema.properties.limit;
    if (typeof args.limit !== 'number' || args.limit < minimum || args.limit > maximum) {
      return fail('limit', `limit must be an integer in [${minimum}, ${maximum}]`);
    }
  }

  return { ok: true, value: args };
}
