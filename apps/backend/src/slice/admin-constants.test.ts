import { describe, expect, it } from 'vitest';
import { loadAdminAccountIds, resolveSessionRoles } from './admin-constants.js';

describe('admin-constants', () => {
  it('resolves admin roles from configured account ids', () => {
    const ids = new Set(['google:abc', 'dev-admin']);
    expect(resolveSessionRoles('google:abc', ids)).toEqual(['PLAYER', 'ADMIN']);
    expect(resolveSessionRoles('player-1', ids)).toEqual(['PLAYER']);
  });

  it('loads admin account ids from env-style csv', () => {
    const previous = process.env.ADMIN_ACCOUNT_IDS;
    process.env.ADMIN_ACCOUNT_IDS = ' google:one , dev-two ';
    expect(loadAdminAccountIds()).toEqual(new Set(['google:one', 'dev-two']));
    process.env.ADMIN_ACCOUNT_IDS = previous;
  });
});
