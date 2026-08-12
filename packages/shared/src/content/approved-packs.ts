/** Approved APPROVATO pack allowlist — Freeze Report V1 (29 packs) */

export const APPROVED_PACK_IDS = [
  'auth_main_v1',
  'banking_main_v1',
  'business_main_v1',
  'criminal_main_v1',
  'economy_main_v1',
  'event_main_v1',
  'family_main_v1',
  'inventory_main_v1',
  'marketplace_main_v1',
  'mobility_main_v1',
  'notification_main_v1',
  'npc_main_v1',
  'political_main_v1',
  'profile_main_v1',
  'property_main_v1',
  'social_main_v1',
  'task_main_v1',
  'time_main_v1',
  'ui_main_v1',
  'visual_main_v1',
  'work_main_v1',
  'progression_main_v1',
  'progression_balance_v1',
  'contracts_v1',
  'content_system_v1',
  'frontend_ui_v1',
  'sound_design_v1',
  'contextual_visuals_v1',
  'newspaper_v1',
] as const;

export type ApprovedPackId = (typeof APPROVED_PACK_IDS)[number];

export const APPROVED_PACK_COUNT = APPROVED_PACK_IDS.length;

/** Map pack ID → relative path under content/ */
export const APPROVED_PACK_PATHS: Record<ApprovedPackId, string> = {
  auth_main_v1: 'auth/auth_main_v1',
  banking_main_v1: 'banking/banking_main_v1',
  business_main_v1: 'business/business_main_v1',
  criminal_main_v1: 'criminal/criminal_main_v1',
  economy_main_v1: 'economy/economy_main_v1',
  event_main_v1: 'events/event_main_v1',
  family_main_v1: 'family/family_main_v1',
  inventory_main_v1: 'inventory/inventory_main_v1',
  marketplace_main_v1: 'marketplace/marketplace_main_v1',
  mobility_main_v1: 'mobility/mobility_main_v1',
  notification_main_v1: 'notifications/notification_main_v1',
  npc_main_v1: 'npc/npc_main_v1',
  political_main_v1: 'political/political_main_v1',
  profile_main_v1: 'profile/profile_main_v1',
  property_main_v1: 'property/property_main_v1',
  social_main_v1: 'social/social_main_v1',
  task_main_v1: 'tasks/task_main_v1',
  time_main_v1: 'time/time_main_v1',
  ui_main_v1: 'ui/ui_main_v1',
  visual_main_v1: 'visual/visual_main_v1',
  work_main_v1: 'work/work_main_v1',
  progression_main_v1: 'progression/progression_main_v1',
  progression_balance_v1: 'progression/progression_balance_v1',
  contracts_v1: 'contracts/contracts_v1',
  content_system_v1: 'content_system/content_system_v1',
  frontend_ui_v1: 'frontend/frontend_ui_v1',
  sound_design_v1: 'audio/sound_design_v1',
  contextual_visuals_v1: 'visual/contextual_visuals_v1',
  newspaper_v1: 'visual/newspaper_v1',
};

export interface LoadedPackSummary {
  packId: ApprovedPackId;
  path: string;
  catalogId: string;
  version: string;
  yamlFileCount: number;
}

export interface ContentLoadResult {
  packs: LoadedPackSummary[];
  loadedAt: string;
}
