import { describe, expect, it } from 'vitest';
import { AssetCatalogService } from './asset-catalog-service.js';

describe('AssetCatalogService', () => {
  it('scans catalog and detects legacy portrait files as present', async () => {
    const service = new AssetCatalogService();
    const rows = await service.scanCatalog();

    expect(rows.length).toBeGreaterThan(100);

    const profile001 = rows.find((r) => r.assetKey === 'characters:profile_001');
    expect(profile001).toBeTruthy();
    expect(profile001!.presence).toBe('present');
    expect(profile001!.resolvedUrl).toMatch(/profile_001\.webp$/);
  });

  it('summarizes present vs missing counts', async () => {
    const service = new AssetCatalogService();
    const summary = await service.summarize();

    expect(summary.total).toBeGreaterThan(0);
    expect(summary.present).toBeGreaterThan(0);
    expect(summary.present + summary.missing + summary.error).toBe(summary.total);
  });
});
