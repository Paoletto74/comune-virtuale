import { describe, expect, it } from 'vitest';
import {
  canListInventoryItemForRent,
  canListInventoryItemForSale,
  inventoryListingBlockReason,
} from './marketplaceHelpers';

describe('marketplaceHelpers inventory listing rules', () => {
  it('blocks food and consumables from sale and rent', () => {
    const food = { itemId: 'cv_cons_001', category: 'consumables', subcategory: 'alimentari', imageKey: 'food' };
    expect(canListInventoryItemForSale(food)).toBe(false);
    expect(canListInventoryItemForRent(food)).toBe(false);
    expect(inventoryListingBlockReason(food)).toBe('Consumabile · non vendibile');
  });

  it('blocks rented items from sale and rent', () => {
    const rentedHousing = {
      itemId: 'cv_house_001',
      category: 'housing',
      possessionStatus: 'rented' as const,
    };
    expect(canListInventoryItemForSale(rentedHousing)).toBe(false);
    expect(canListInventoryItemForRent(rentedHousing)).toBe(false);
    expect(inventoryListingBlockReason(rentedHousing)).toBe('In affitto · non vendibile né affittabile');
  });

  it('allows owned housing for sale and rent', () => {
    const ownedHousing = {
      itemId: 'cv_house_001',
      category: 'housing',
      possessionStatus: 'owned' as const,
    };
    expect(canListInventoryItemForSale(ownedHousing)).toBe(true);
    expect(canListInventoryItemForRent(ownedHousing)).toBe(true);
    expect(inventoryListingBlockReason(ownedHousing)).toBeNull();
  });

  it('allows owned durable goods for sale only', () => {
    const ownedLuxury = {
      itemId: 'cv_lux_001',
      category: 'luxury',
      possessionStatus: 'owned' as const,
    };
    expect(canListInventoryItemForSale(ownedLuxury)).toBe(true);
    expect(canListInventoryItemForRent(ownedLuxury)).toBe(false);
    expect(inventoryListingBlockReason(ownedLuxury)).toBeNull();
  });
});
