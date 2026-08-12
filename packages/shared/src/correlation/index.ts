import { randomUUID } from 'node:crypto';
import { asCorrelationId, asIdempotencyKey } from '../ids/index.js';
import type { CorrelationId, IdempotencyKey } from '../ids/index.js';
import { isValidUuid } from '../ids/index.js';
export { CORRELATION_HEADER, IDEMPOTENCY_HEADER } from './constants.js';

export function generateCorrelationId(): CorrelationId {
  return asCorrelationId(randomUUID());
}

export function parseCorrelationId(value: string | undefined): CorrelationId | null {
  if (!value || !isValidUuid(value)) {
    return null;
  }
  return asCorrelationId(value);
}

export function parseIdempotencyKey(value: string | undefined): IdempotencyKey | null {
  if (!value || !isValidUuid(value)) {
    return null;
  }
  return asIdempotencyKey(value);
}

export function resolveCorrelationId(incoming: string | undefined): CorrelationId {
  return parseCorrelationId(incoming) ?? generateCorrelationId();
}
