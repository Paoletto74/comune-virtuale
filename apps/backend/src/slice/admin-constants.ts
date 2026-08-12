import type { Role } from '@comune-virtuale/shared';

/** Comma-separated account IDs (e.g. google:{sub} or dev IDs) with admin privileges. */
export function loadAdminAccountIds(): Set<string> {
  const raw = process.env.ADMIN_ACCOUNT_IDS ?? '';
  return new Set(
    raw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

export function resolveSessionRoles(accountId: string, adminAccountIds: Set<string>): Role[] {
  if (adminAccountIds.has(accountId)) {
    return ['PLAYER', 'ADMIN'];
  }
  return ['PLAYER'];
}

export function isAdminRole(roles: readonly string[]): boolean {
  return roles.includes('ADMIN');
}
