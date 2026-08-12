#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateApprovedContent } from './validate.js';

const monorepoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const contentRoot = process.argv[2] ?? resolve(monorepoRoot, 'content');

async function main() {
  console.log(`Validating APPROVATO content packs in: ${contentRoot}`);
  const result = await validateApprovedContent(contentRoot);

  console.log(`Packs: ${result.packCount}`);
  console.log(`YAML files: ${result.yamlFileCount}`);

  if (result.success) {
    console.log('✓ All APPROVATO packs valid');
    process.exit(0);
  }

  console.error('✗ Validation failed:');
  for (const issue of result.issues) {
    console.error(`  [${issue.packId}]${issue.file ? `/${issue.file}` : ''}: ${issue.message}`);
  }
  process.exit(1);
}

main();
