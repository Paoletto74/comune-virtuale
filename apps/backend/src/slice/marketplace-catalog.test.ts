import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  MARKETPLACE_CATALOG_POOL,
  MARKETPLACE_CATALOG_PRODUCT_COUNT,
  MARKETPLACE_CATEGORY_ORDER,
} from './marketplace-catalog-constants.js';

const REAL_BRAND_PATTERNS =
  /\b(ferrari|lamborghini|porsche|bmw|mercedes|audi|volkswagen|fiat|alfa romeo|maserati|bugatti|rolls.?royce|bentley|aston martin|tesla|toyota|honda|nissan|lexus|gucci|prada|armani|versace|rolex|omega|cartier|hermes|chanel|louis vuitton|apple|samsung|iphone|ipad|macbook|coca.?cola|pepsi|nestl[eé]|barilla|ferrero|heineken|peroni)\b/i;

describe('marketplace master catalog', () => {
  it('contains exactly 500 products', () => {
    expect(MARKETPLACE_CATALOG_PRODUCT_COUNT).toBe(500);
    expect(MARKETPLACE_CATALOG_POOL.length).toBe(500);
  });

  it('has 125 products per category', () => {
    for (const categoryId of MARKETPLACE_CATEGORY_ORDER) {
      const count = MARKETPLACE_CATALOG_POOL.filter((item) => item.categoryId === categoryId).length;
      expect(count).toBe(125);
    }
  });

  it('has unique ids, names and slugs', () => {
    const ids = MARKETPLACE_CATALOG_POOL.map((item) => item.itemId);
    const names = MARKETPLACE_CATALOG_POOL.map((item) => item.name);
    const slugs = MARKETPLACE_CATALOG_POOL.map((item) => item.slug);
    expect(new Set(ids).size).toBe(500);
    expect(new Set(names).size).toBe(500);
    expect(new Set(slugs).size).toBe(500);
  });

  it('fills all required fields without placeholders', () => {
    for (const item of MARKETPLACE_CATALOG_POOL) {
      expect(item.itemId.length).toBeGreaterThan(0);
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(10);
      expect(item.subcategory.length).toBeGreaterThan(0);
      expect(item.economicTier.length).toBeGreaterThan(0);
      expect(item.slug.length).toBeGreaterThan(0);
      expect(item.imagePath.startsWith('/products/')).toBe(true);
      expect(item.priceMinor).toBeGreaterThan(0n);
      expect(item.name).not.toMatch(/product\s+\d+|item\s+\d+|vehicle\s+[a-z]$/i);
      expect(item.description.toLowerCase()).not.toContain('todo');
      expect(item.description.toLowerCase()).not.toContain('placeholder');
    }
  });

  it('contains no real brand references', () => {
    for (const item of MARKETPLACE_CATALOG_POOL) {
      const blob = `${item.name} ${item.description}`;
      expect(blob).not.toMatch(REAL_BRAND_PATTERNS);
    }
  });

  it('matches JSON source catalog', () => {
    const jsonPath = resolve(import.meta.dirname, '../../../../content/marketplace/marketplace_main_v1/products.catalog.json');
    const parsed = JSON.parse(readFileSync(jsonPath, 'utf8')) as { productCount: number; products: unknown[] };
    expect(parsed.productCount).toBe(500);
    expect(parsed.products.length).toBe(500);
  });
});
