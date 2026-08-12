import { describe, expect, it } from 'vitest';
import { isAdminFromRoles } from '@/utils/adminHelpers';

describe('adminHelpers', () => {
  it('detects admin role', () => {
    expect(isAdminFromRoles(['PLAYER', 'ADMIN'])).toBe(true);
    expect(isAdminFromRoles(['PLAYER'])).toBe(false);
    expect(isAdminFromRoles(undefined)).toBe(false);
  });
});
