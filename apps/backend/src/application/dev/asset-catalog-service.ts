import {
  ASSET_CATALOG,
  ASSET_CATEGORY_DIRS,
  allCandidateUrls,
  phaseVariantUrl,
  resolveCatalogEntry,
  VISUAL_TIME_PHASES,
  type AssetPresence,
  type AssetStatusRow,
  type VisualTimePhase,
} from '@comune-virtuale/shared';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const monorepoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const frontendPublicRoot = resolve(monorepoRoot, 'apps/frontend/public');

async function fileExists(absolutePath: string): Promise<boolean> {
  try {
    await access(absolutePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export class AssetCatalogService {
  constructor(private readonly publicRoot: string = frontendPublicRoot) {}

  private async resolveUrl(url: string): Promise<boolean> {
    const abs = join(this.publicRoot, url.replace(/^\//, ''));
    return fileExists(abs);
  }

  private async scanPhaseVariants(
    resolved: ReturnType<typeof resolveCatalogEntry>,
  ): Promise<AssetStatusRow['phaseVariants']> {
    const variants: NonNullable<AssetStatusRow['phaseVariants']> = {};

    for (const phase of VISUAL_TIME_PHASES) {
      const url = phaseVariantUrl(resolved.category, resolved.filename, phase);
      const present = await this.resolveUrl(url);
      variants[phase] = present ? { presence: 'present', url } : { presence: 'missing' };
    }

    return variants;
  }

  async scanCatalog(): Promise<AssetStatusRow[]> {
    const rows: AssetStatusRow[] = [];

    for (const entry of ASSET_CATALOG) {
      const resolved = resolveCatalogEntry(entry);
      const candidates = allCandidateUrls(resolved);
      let presence: AssetPresence = 'missing';
      let resolvedUrl: string | undefined;
      let phaseVariants: AssetStatusRow['phaseVariants'];

      if (resolved.timePhased) {
        phaseVariants = await this.scanPhaseVariants(resolved);
        for (const phase of VISUAL_TIME_PHASES) {
          const variant = phaseVariants[phase as VisualTimePhase];
          if (variant?.presence === 'present' && variant.url) {
            presence = 'present';
            resolvedUrl = variant.url;
            break;
          }
        }
      }

      if (presence !== 'present') {
        for (const url of candidates) {
          if (await this.resolveUrl(url)) {
            presence = 'present';
            resolvedUrl = url;
            break;
          }
        }
      }

      rows.push({
        ...entry,
        resolved,
        presence,
        resolvedUrl,
        phaseVariants,
      });
    }

    return rows;
  }

  async summarize(): Promise<{
    total: number;
    present: number;
    missing: number;
    error: number;
    categories: Record<string, { present: number; missing: number }>;
  }> {
    const rows = await this.scanCatalog();
    const categories: Record<string, { present: number; missing: number }> = {};

    for (const row of rows) {
      const bucket = categories[row.category] ?? { present: 0, missing: 0 };
      if (row.presence === 'present') bucket.present += 1;
      else bucket.missing += 1;
      categories[row.category] = bucket;
    }

    return {
      total: rows.length,
      present: rows.filter((r) => r.presence === 'present').length,
      missing: rows.filter((r) => r.presence === 'missing').length,
      error: rows.filter((r) => r.presence === 'error').length,
      categories,
    };
  }

  listCategoryDirs(): Record<string, string> {
    return ASSET_CATEGORY_DIRS;
  }
}
