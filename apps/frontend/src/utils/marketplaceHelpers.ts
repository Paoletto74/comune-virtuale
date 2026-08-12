export type ProfileInventoryListingItem = {
  itemId: string;
  category?: string;
  possessionStatus?: 'available' | 'owned' | 'rented';
  subcategory?: string;
  imageKey?: string;
};

export function isConsumableCategory(categoryId?: string): boolean {
  return categoryId === 'consumables';
}

export function isRentedInventoryItem(item: Pick<ProfileInventoryListingItem, 'possessionStatus'>): boolean {
  return item.possessionStatus === 'rented';
}

export function isFoodInventoryItem(item: ProfileInventoryListingItem): boolean {
  if (isConsumableCategory(item.category)) return true;
  if (item.subcategory === 'alimentari' || item.subcategory === 'bevande' || item.subcategory === 'pasti') {
    return true;
  }
  return item.imageKey === 'food' || item.imageKey === 'drink';
}

export function canListInventoryItemForSale(item: ProfileInventoryListingItem): boolean {
  if (isRentedInventoryItem(item)) return false;
  if (isFoodInventoryItem(item)) return false;
  return !isConsumableCategory(item.category);
}

export function canListInventoryItemForRent(item: ProfileInventoryListingItem): boolean {
  if (isRentedInventoryItem(item)) return false;
  if (isFoodInventoryItem(item)) return false;
  if (isConsumableCategory(item.category)) return false;
  return item.category === 'housing';
}

export function inventoryListingBlockReason(item: ProfileInventoryListingItem): string | null {
  if (isRentedInventoryItem(item)) return 'In affitto · non vendibile né affittabile';
  if (isFoodInventoryItem(item)) return 'Consumabile · non vendibile';
  if (isConsumableCategory(item.category)) return 'Consumabile · non vendibile';
  return null;
}

/** @deprecated Use canListInventoryItemForSale instead */
export function isResellableInventoryItem(categoryId?: string): boolean {
  return !isConsumableCategory(categoryId);
}
