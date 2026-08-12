/** Branded ID types — contracts_v1/ids.yaml */

export type CitizenId = string & { readonly __brand: 'CitizenId' };
export type AccountId = string & { readonly __brand: 'AccountId' };
export type SessionId = string & { readonly __brand: 'SessionId' };
export type TransactionId = string & { readonly __brand: 'TransactionId' };
export type CorrelationId = string & { readonly __brand: 'CorrelationId' };
export type IdempotencyKey = string & { readonly __brand: 'IdempotencyKey' };

export function asCitizenId(value: string): CitizenId {
  return value as CitizenId;
}

export function asAccountId(value: string): AccountId {
  return value as AccountId;
}

export function asSessionId(value: string): SessionId {
  return value as SessionId;
}

export function asCorrelationId(value: string): CorrelationId {
  return value as CorrelationId;
}

export function asIdempotencyKey(value: string): IdempotencyKey {
  return value as IdempotencyKey;
}

export function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
