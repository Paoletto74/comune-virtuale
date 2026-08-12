/** Actor types — contracts_v1/commands.yaml */

export type ActorType = 'PLAYER' | 'NPC' | 'ADMIN' | 'SYSTEM' | 'SCHEDULER';

export interface CommandMeta {
  correlationId: string;
  idempotencyKey?: string;
  occurredAt: string;
}

export interface CommandResult<T = unknown> {
  success: boolean;
  data?: T;
  correlationId: string;
}

export type Role = 'PLAYER' | 'ADMIN' | 'SYSTEM';

export interface ActorContext {
  accountId: string;
  citizenId: string;
  roles: Role[];
  sessionId: string;
}
