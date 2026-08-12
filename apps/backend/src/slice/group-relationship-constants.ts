/**
 * Configurable group membership and task-driven group relationship effects.
 */

export interface GroupTaskEffect {
  groupId: string;
  familiarity?: number;
  relationshipLevel?: number;
}

/** NPC template → group ids (mirrors social_groups seed). */
export const NPC_TEMPLATE_GROUP_IDS: Readonly<Record<string, readonly string[]>> = {
  youth_luca: ['group_calcetto_mercoledi', 'group_bar_sotto_casa'],
  worker_tommaso: ['group_calcetto_mercoledi'],
  youth_chiara: ['group_calcetto_mercoledi'],
  family_neighbor_dario: ['group_calcetto_mercoledi', 'group_quartiere_residenziale'],
  worker_sara: ['group_bar_sotto_casa'],
  merchant_salvatore: ['group_bar_sotto_casa'],
  neighbor_marco: ['group_quartiere_residenziale'],
  family_neighbor_paola: ['group_quartiere_residenziale'],
  elderly_signora_villa: ['group_quartiere_residenziale'],
  ambiguous_night_renato: ['group_notturni'],
  ambiguous_night_nadia: ['group_notturni'],
  professional_dr_neri: ['group_salute_locale'],
  civic_librarian_orsi: ['group_salute_locale'],
};

export const DEFAULT_NPC_GROUP_FAMILIARITY_ON_TASK = 2;

export function resolveGroupsForNpcTemplate(templateId: string | null | undefined): string[] {
  if (!templateId) return [];
  return [...(NPC_TEMPLATE_GROUP_IDS[templateId] ?? [])];
}

export function mergeGroupTaskEffects(
  explicit: GroupTaskEffect | undefined,
  templateId: string | null | undefined,
): GroupTaskEffect[] {
  const byGroup = new Map<string, GroupTaskEffect>();

  for (const groupId of resolveGroupsForNpcTemplate(templateId)) {
    byGroup.set(groupId, {
      groupId,
      familiarity: DEFAULT_NPC_GROUP_FAMILIARITY_ON_TASK,
    });
  }

  if (explicit?.groupId) {
    const current = byGroup.get(explicit.groupId) ?? { groupId: explicit.groupId };
    byGroup.set(explicit.groupId, {
      groupId: explicit.groupId,
      familiarity: (current.familiarity ?? 0) + (explicit.familiarity ?? 0),
      relationshipLevel: (current.relationshipLevel ?? 0) + (explicit.relationshipLevel ?? 0),
    });
  }

  return [...byGroup.values()];
}
