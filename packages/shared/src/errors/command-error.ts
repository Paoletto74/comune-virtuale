import type { CorrelationId } from '../ids/index.js';

/** CommandError — contracts_v1/command_errors.yaml */

export type ErrorCategory =
  | 'AUTH'
  | 'PERMISSION'
  | 'VALIDATION'
  | 'BUSINESS'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'RATE_LIMIT'
  | 'TECHNICAL'
  | 'TEMPORARY';

export interface CommandErrorBody {
  code: string;
  messageKey: string;
  correlationId: CorrelationId;
  details?: Record<string, unknown>;
  retryable: boolean;
}

export interface CommandErrorResponse {
  error: CommandErrorBody;
}

export function createCommandError(
  code: string,
  messageKey: string,
  correlationId: CorrelationId,
  options?: { details?: Record<string, unknown>; retryable?: boolean },
): CommandErrorResponse {
  return {
    error: {
      code,
      messageKey,
      correlationId,
      details: options?.details,
      retryable: options?.retryable ?? false,
    },
  };
}

export function errorCategoryToStatus(category: ErrorCategory): number {
  switch (category) {
    case 'VALIDATION':
      return 400;
    case 'AUTH':
      return 401;
    case 'PERMISSION':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'CONFLICT':
      return 409;
    case 'BUSINESS':
      return 422;
    case 'RATE_LIMIT':
      return 429;
    case 'TEMPORARY':
      return 503;
    case 'TECHNICAL':
    default:
      return 500;
  }
}
