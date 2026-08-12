import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../plugins/auth-plugin.js';
import { getCorrelationId } from '../plugins/correlation-plugin.js';
import { AppError } from '../plugins/error-handler-plugin.js';
import type { PreviewBootstrapService } from '../../application/dev/preview-bootstrap-service.js';

export interface PreviewRouteDeps {
  enableDevAuth: boolean;
  previewBootstrap?: PreviewBootstrapService;
}

export async function registerPreviewRoutes(
  app: FastifyInstance,
  deps: PreviewRouteDeps,
): Promise<void> {
  if (!deps.enableDevAuth || !deps.previewBootstrap) {
    return;
  }

  app.post('/api/v1/dev/preview-bootstrap', async (request) => {
    const actor = await requireAuth(request);
    if (!actor.citizenId) {
      throw new AppError('BUSINESS', 'CITIZEN_REQUIRED', 'error.citizen.required');
    }

    const result = await deps.previewBootstrap!.bootstrap(actor.citizenId);
    return {
      success: true,
      ...result,
      correlationId: getCorrelationId(request),
    };
  });
}
