import { describe, expect, it } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateApprovedContent } from './validate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('validateApprovedContent', () => {
  it('validates all 29 APPROVATO packs', async () => {
    const contentRoot = resolve(__dirname, '../../../content');
    const result = await validateApprovedContent(contentRoot);
    expect(result.packCount).toBe(29);
    expect(result.success).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.yamlFileCount).toBeGreaterThan(800);
  });
});
