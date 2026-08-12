import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { createCommandError, errorCategoryToStatus } from '@comune-virtuale/shared';
import { getCorrelationId } from './correlation-plugin.js';

export class AppError extends Error {
  constructor(
    public readonly category:
      | 'AUTH'
      | 'PERMISSION'
      | 'VALIDATION'
      | 'BUSINESS'
      | 'CONFLICT'
      | 'NOT_FOUND'
      | 'RATE_LIMIT'
      | 'TECHNICAL'
      | 'TEMPORARY',
    public readonly code: string,
    public readonly messageKey: string,
    public readonly options?: { details?: Record<string, unknown>; retryable?: boolean },
  ) {
    super(messageKey);
  }
}

async function errorHandlerPluginImpl(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    const correlationId = getCorrelationId(request);

    if (error instanceof AppError) {
      const status = errorCategoryToStatus(error.category);
      return reply.status(status).send(
        createCommandError(error.code, error.messageKey, correlationId, {
          details: error.options?.details,
          retryable: error.options?.retryable ?? false,
        }),
      );
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'validation' in error &&
      (error as { validation?: unknown }).validation
    ) {
      return reply.status(400).send(
        createCommandError('VALIDATION_ERROR', 'error.validation.request', correlationId, {
          retryable: false,
        }),
      );
    }

    request.log.error({ err: error, correlationId }, 'Unhandled error');
    return reply.status(500).send(
      createCommandError('TECHNICAL_ERROR', 'error.technical.internal', correlationId, {
        retryable: true,
      }),
    );
  });
}

export const errorHandlerPlugin = fp(errorHandlerPluginImpl, {
  name: 'error-handler-plugin',
});
