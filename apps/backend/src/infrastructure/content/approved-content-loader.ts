import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  APPROVED_PACK_IDS,
  APPROVED_PACK_PATHS,
  type ApprovedPackId,
  type ContentLoadResult,
  type LoadedPackSummary,
} from '@comune-virtuale/shared';

interface CatalogYaml {
  catalogId?: string;
  version?: string;
}

/** Read-only loader for 29 APPROVATO packs — excludes PROPOSTA extension packs */
export class ApprovedContentLoader {
  constructor(private readonly contentRoot: string) {}

  async load(): Promise<ContentLoadResult> {
    const root = resolve(this.contentRoot);
    const packs: LoadedPackSummary[] = [];

    for (const packId of APPROVED_PACK_IDS) {
      const relativePath = APPROVED_PACK_PATHS[packId as ApprovedPackId];
      const packPath = join(root, relativePath);
      const catalogPath = join(packPath, 'catalog.yaml');

      let catalogRaw: string;
      try {
        catalogRaw = await readFile(catalogPath, 'utf-8');
      } catch {
        throw new Error(`APPROVED pack missing catalog: ${packId} at ${catalogPath}`);
      }

      const catalog = parseYaml(catalogRaw) as CatalogYaml;
      const files = await readdir(packPath);
      const yamlFileCount = files.filter((f) => f.endsWith('.yaml')).length;

      packs.push({
        packId: packId as ApprovedPackId,
        path: relativePath,
        catalogId: catalog.catalogId ?? packId,
        version: catalog.version ?? 'unknown',
        yamlFileCount,
      });
    }

    return {
      packs,
      loadedAt: new Date().toISOString(),
    };
  }
}
