import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { CorrelationId } from '@comune-virtuale/shared';
import { CORRELATION_HEADER, resolveCorrelationId } from '@comune-virtuale/shared/correlation';

declare module 'fastify' {
  interface FastifyRequest {
    correlationId: CorrelationId;
  }
}

async function correlationPluginImpl(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    const incoming = request.headers[CORRELATION_HEADER] as string | undefined;
    const correlationId = resolveCorrelationId(incoming);
    request.correlationId = correlationId;
    reply.header(CORRELATION_HEADER, correlationId);
  });
}

export const correlationPlugin = fp(correlationPluginImpl, {
  name: 'correlation-plugin',
});

export function getCorrelationId(request: FastifyRequest): CorrelationId {
  return request.correlationId;
}

export function setCorrelationReplyHeader(reply: FastifyReply, correlationId: CorrelationId) {
  reply.header(CORRELATION_HEADER, correlationId);
}
