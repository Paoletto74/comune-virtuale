import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { CORRELATION_HEADER, isValidUuid } from '@comune-virtuale/shared';
import { correlationPlugin, getCorrelationId } from './correlation-plugin.js';

describe('correlationPlugin', () => {
  it('propagates incoming correlation id to routes registered after the plugin', async () => {
    const app = Fastify();
    await app.register(correlationPlugin);

    app.get('/health', async (request) => ({
      status: 'ok',
      correlationId: getCorrelationId(request),
    }));

    await app.ready();

    const incomingId = '550e8400-e29b-41d4-a716-446655440000';
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { [CORRELATION_HEADER]: incomingId },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers[CORRELATION_HEADER]).toBe(incomingId);
    expect(response.json()).toMatchObject({
      status: 'ok',
      correlationId: incomingId,
    });

    await app.close();
  });

  it('generates a correlation id when the header is missing', async () => {
    const app = Fastify();
    await app.register(correlationPlugin);

    app.get('/health', async (request) => ({
      correlationId: getCorrelationId(request),
    }));

    await app.ready();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    const generatedId = response.headers[CORRELATION_HEADER];
    expect(typeof generatedId).toBe('string');
    expect(isValidUuid(String(generatedId))).toBe(true);
    expect(response.json()).toMatchObject({
      correlationId: generatedId,
    });

    await app.close();
  });
});
