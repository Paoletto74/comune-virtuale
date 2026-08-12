import { randomUUID } from 'node:crypto';
import type {
  CitizenNpcRelationshipRepository,
  CitizenRepository,
  TaskRepository,
} from '../../domain/ports/repositories.js';
import type { DrizzleCitizenCareerRepository } from '../../infrastructure/db/repositories/citizen-career-repository.js';
import type { DrizzleSocialGameplayRepository } from '../../infrastructure/db/repositories/social-gameplay-repository.js';
import type { EconomyService } from '../economy/economy-service.js';
import type { CitizenProgressionService } from '../citizen/citizen-progression-service.js';
import type { NpcRelationshipService } from '../npc/npc-relationship-service.js';
import type { SocialGameplayService } from '../social/social-gameplay-service.js';
import type { TaskInstanceMaterializer } from '../task/task-instance-materializer.js';
import { MEGA1_DEMO_TASK_DEFINITION_IDS, MEGA1_NPC_BINDINGS } from '../../slice/mega1-demo-tasks-constants.js';
import { isDialogueDefinition } from '../../slice/dialogue-routing.js';
import {
  computeRelationshipScore,
  resolveRelationshipState,
} from '../../slice/relationship-state-resolver.js';

const PREVIEW_NPC_SPECS = [
  {
    templateId: 'neighbor_marco',
    definitionId: 'DEMO_NPC_MARCO_LEAK',
    bindingKey: 'DEMO_NPC_MARCO_LEAK' as const,
  },
  {
    templateId: 'youth_luca',
    definitionId: 'DEMO_DIALOGUE_LUCA_V1',
    bindingKey: 'DEMO_DIALOGUE_LUCA_V1' as const,
  },
  {
    templateId: 'professional_dr_neri',
    definitionId: 'DEMO_CAREER_TENTATION_MEDICINA',
    bindingKey: 'DEMO_CAREER_TENTATION_MEDICINA' as const,
  },
] as const;

const PREVIEW_GROUP_IDS = [
  'group_quartiere_residenziale',
  'group_calcetto_mercoledi',
  'group_bar_sotto_casa',
] as const;

export class PreviewBootstrapService {
  constructor(
    private readonly citizens: CitizenRepository,
    private readonly economy: EconomyService,
    private readonly progression: CitizenProgressionService,
    private readonly careers: DrizzleCitizenCareerRepository,
    private readonly npcRelationships: NpcRelationshipService,
    private readonly relationships: CitizenNpcRelationshipRepository,
    private readonly tasks: TaskRepository,
    private readonly materializer: TaskInstanceMaterializer,
    private readonly socialGameplay: SocialGameplayService,
    private readonly socialRepo: DrizzleSocialGameplayRepository,
  ) {}

  async bootstrap(citizenId: string): Promise<{ seeded: string[]; alreadyBootstrapped: boolean }> {
    const known = await this.relationships.findKnownByCitizen(citizenId);
    const marcoReady = known.some(
      (entry) => entry.npc.npcTemplateId === 'neighbor_marco' && entry.chatEnabled,
    );
    if (marcoReady) {
      return { seeded: [], alreadyBootstrapped: true };
    }

    const seeded: string[] = [];

    await this.citizens.setPersonalValues(citizenId, {
      sympathy: 25,
      reputation: 20,
      happiness: 18,
      health: 15,
      culture: 12,
      experience: 10,
      stress: 5,
      reliability: 8,
      civicParticipation: 6,
    });
    seeded.push('attributes');

    await this.progression.grantProgression({
      citizenId,
      idempotencyKey: 'preview:bootstrap:xp',
      points: 450,
      sourceType: 'preview_bootstrap',
      sourceRef: 'preview-demo',
      worldTimeMs: Date.now(),
    });
    seeded.push('progression');

    await this.economy.applyCashDelta({
      citizenId,
      deltaMinor: 25_000n,
      transactionType: 'preview_grant',
      transactionClass: 'system',
      reasonCode: 'PREVIEW_BOOTSTRAP',
      sourceActionId: 'preview-bootstrap',
      idempotencyKey: 'preview:bootstrap:cash',
    });
    seeded.push('cash');

    await this.careers.ensureSeeded(citizenId);
    await this.careers.setAffinity(citizenId, 'medicina', 38);
    await this.careers.setAffinity(citizenId, 'criminalita', 10);
    await this.careers.setAffinity(citizenId, 'motorsport', 14);
    await this.careers.updateState({
      citizenId,
      currentCareerId: 'medicina',
      currentGradeIndex: 2,
    });
    seeded.push('career');

    for (const spec of PREVIEW_NPC_SPECS) {
      const binding = MEGA1_NPC_BINDINGS[spec.bindingKey];
    if (!binding) continue;
      const { npc } = await this.npcRelationships.materializePersistentNpc({
        definitionId: spec.definitionId,
        taskInstanceId: `preview-seed:${spec.templateId}`,
        citizenId,
        binding,
      });

      await this.relationships.upsertRelationship({
        citizenId,
        npcId: npc.npcId,
        relationshipLevel: 4,
        interactionCount: 3,
        lastInteractionAt: new Date(),
        lastOutcomeKey: 'preview_seed',
        lastOutcomeSummary: 'Conosciuto in anteprima demo',
        sentiment: 'positive',
        trust: 58,
        affection: 46,
        conflict: 4,
        familiarity: 42,
        contactUnlocked: true,
        chatEnabled: true,
      });

      await this.socialGameplay.applyGroupEffectsFromTask({
        citizenId,
        npcId: npc.npcId,
        explicitGroup: undefined,
      });
    }
    seeded.push('npcs');

    for (const groupId of PREVIEW_GROUP_IDS) {
      const familiarity = 22;
      const relationshipLevel = 2;
      const relationshipScore = computeRelationshipScore({
        trust: 0,
        affection: 0,
        familiarity,
        conflict: 0,
        relationshipLevel,
      });
      const relationshipState = resolveRelationshipState({
        trust: 0,
        affection: 0,
        conflict: 0,
        familiarity,
        relationshipLevel,
        contactUnlocked: familiarity >= 15,
      });
      await this.socialRepo.upsertGroupRelationship({
        citizenId,
        groupId,
        familiarity,
        relationshipLevel,
        relationshipScore,
        relationshipState,
        contactUnlocked: familiarity >= 15,
      });
    }
    seeded.push('groups');

    for (const definitionId of MEGA1_DEMO_TASK_DEFINITION_IDS) {
      const existing = await this.tasks.findByCitizenAndDefinitionId(citizenId, definitionId);
      if (existing && existing.status !== 'completed') {
        continue;
      }

      const taskInstanceId = randomUUID();
      const materialized = await this.materializer.materialize({
        definitionId,
        taskInstanceId,
        citizenId,
      });

      const status = isDialogueDefinition(definitionId) ? 'active' : 'active';

      await this.tasks.createTaskInstanceIdempotent({
        citizenId,
        idempotencyKey: `preview:task:${definitionId}`,
        taskInstanceId,
        definitionId,
        targetNpcId: materialized.targetNpcId ?? null,
        context: materialized.context as Record<string, unknown>,
        status,
      });
    }
    seeded.push('tasks');

    return { seeded, alreadyBootstrapped: false };
  }
}
