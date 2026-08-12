export function isAdminFromRoles(roles: readonly string[] | undefined): boolean {
  return roles?.includes('ADMIN') ?? false;
}

export function isRealPlayerCitizenId(citizenId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(citizenId);
}

export function npcPoolPortraitPath(portraitId: string): string {
  return `/npc-portraits/${portraitId}.webp`;
}

export const NPC_PORTRAIT_POOL_SIZE = 50;

export function listNpcPoolPortraitIds(): string[] {
  return Array.from({ length: NPC_PORTRAIT_POOL_SIZE }, (_, index) =>
    `npc_${String(index + 1).padStart(3, '0')}`,
  );
}
