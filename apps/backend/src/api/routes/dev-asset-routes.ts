import type { FastifyInstance } from 'fastify';
import { getCorrelationId } from '../plugins/correlation-plugin.js';
import type { AssetCatalogService } from '../../application/dev/asset-catalog-service.js';

export interface DevAssetRouteDeps {
  enableDevAuth: boolean;
  assetCatalog?: AssetCatalogService;
}

export async function registerDevAssetRoutes(
  app: FastifyInstance,
  deps: DevAssetRouteDeps,
): Promise<void> {
  if (!deps.enableDevAuth || !deps.assetCatalog) {
    return;
  }

  app.get('/api/v1/dev/asset-status', async (request) => {
    const rows = await deps.assetCatalog!.scanCatalog();
    const summary = await deps.assetCatalog!.summarize();
    return {
      summary,
      categories: deps.assetCatalog!.listCategoryDirs(),
      assets: rows,
      correlationId: getCorrelationId(request),
    };
  });
}
