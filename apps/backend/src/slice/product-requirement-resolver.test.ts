import { describe, expect, it } from 'vitest';
import {
  evaluateProductRequirement,
  evaluatePurchaseRequirement,
  findConsumableInventoryMatch,
} from './product-requirement-resolver.js';
import { getTaskProductRequirement } from './task-product-requirements-constants.js';

describe('product-requirement-resolver', () => {
  it('allows task without requirement', () => {
    expect(getTaskProductRequirement('DEMO_V2_WEIRD_FLYER')).toBeNull();
  });

  it('blocks task when vehicle requirement missing', () => {
    const spec = getTaskProductRequirement('DEMO_V2_PARKING_TICKET')!.requirement;
    const result = evaluateProductRequirement(spec, []);
    expect(result.satisfied).toBe(false);
    expect(result.label).toBe('Veicolo');
  });

  it('allows task when compatible category owned', () => {
    const spec = getTaskProductRequirement('DEMO_V2_PARKING_TICKET')!.requirement;
    const result = evaluateProductRequirement(spec, [
      { itemId: 'cv_veic_001', inventoryId: 'inv-1' },
    ]);
    expect(result.satisfied).toBe(true);
  });

  it('allows anyOf when one premium vehicle owned', () => {
    const spec = getTaskProductRequirement('DEMO_V2_WORK_CLIENT_ANGER')!.requirement;
    const result = evaluateProductRequirement(spec, [
      { itemId: 'cv_veic_100', inventoryId: 'inv-1' },
    ]);
    expect(result.satisfied).toBe(true);
  });

  it('rejects incompatible category for housing task', () => {
    const spec = getTaskProductRequirement('DEMO_V2_FAMILY_UNEXPECTED_VISIT')!.requirement;
    const result = evaluateProductRequirement(spec, [
      { itemId: 'cv_veic_001', inventoryId: 'inv-1' },
    ]);
    expect(result.satisfied).toBe(false);
  });

  it('allows free purchase for economico tier', () => {
    expect(
      evaluatePurchaseRequirement({ economicTier: 'ECONOMICO' }, 1).blocked,
    ).toBe(false);
  });

  it('blocks premium purchase when prestige too low', () => {
    const result = evaluatePurchaseRequirement({ economicTier: 'PREMIUM' }, 1);
    expect(result.blocked).toBe(true);
    expect(result.minMainLevel).toBe(3);
  });

  it('allows premium purchase when prestige sufficient', () => {
    expect(
      evaluatePurchaseRequirement({ economicTier: 'PREMIUM' }, 3).blocked,
    ).toBe(false);
  });

  it('finds consumable food in inventory', () => {
    const row = findConsumableInventoryMatch([
      { itemId: 'cv_cons_001', inventoryId: 'inv-1' },
    ]);
    expect(row?.itemId).toBe('cv_cons_001');
  });
});
