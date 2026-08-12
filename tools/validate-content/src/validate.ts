import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  APPROVED_PACK_IDS,
  APPROVED_PACK_PATHS,
  APPROVED_PACK_COUNT,
  type ApprovedPackId,
} from '@comune-virtuale/shared';

export interface ValidationIssue {
  packId: string;
  file?: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  packCount: number;
  yamlFileCount: number;
  issues: ValidationIssue[];
}

/** Validate 29 APPROVATO packs using Node/TypeScript YAML parser — read-only */
export async function validateApprovedContent(contentRoot: string): Promise<ValidationResult> {
  const root = resolve(contentRoot);
  const issues: ValidationIssue[] = [];
  let yamlFileCount = 0;

  for (const packId of APPROVED_PACK_IDS) {
    const relativePath = APPROVED_PACK_PATHS[packId as ApprovedPackId];
    const packPath = join(root, relativePath);

    try {
      const files = await readdir(packPath);
      const yamlFiles = files.filter((f) => f.endsWith('.yaml'));
      yamlFileCount += yamlFiles.length;

      const catalogFile = yamlFiles.find((f) => f === 'catalog.yaml');
      if (!catalogFile) {
        issues.push({ packId, message: 'Missing catalog.yaml' });
        continue;
      }

      for (const file of yamlFiles) {
        const filePath = join(packPath, file);
        try {
          const raw = await readFile(filePath, 'utf-8');
          parseYaml(raw);
        } catch (err) {
          issues.push({
            packId,
            file,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }
    } catch (err) {
      issues.push({
        packId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (APPROVED_PACK_IDS.length !== APPROVED_PACK_COUNT) {
    issues.push({
      packId: '_registry',
      message: `Allowlist count mismatch: expected ${APPROVED_PACK_COUNT}`,
    });
  }

  return {
    success: issues.length === 0,
    packCount: APPROVED_PACK_IDS.length,
    yamlFileCount,
    issues,
  };
}
