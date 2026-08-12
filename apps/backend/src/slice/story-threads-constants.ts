import type {
  StoryThreadType,
  StoryThreadWeightEffects,
} from '../application/story/story-thread-types.js';

export interface StoryThreadStageConfig {
  stage: number;
  effects: StoryThreadWeightEffects;
  dormantCooldownGameMs?: number;
  expiryGameMs?: number;
}

export interface StoryThreadTemplate {
  templateId: string;
  type: StoryThreadType;
  priority: number;
  maxDevelopments: number;
  stages: readonly StoryThreadStageConfig[];
  recordLifeUpdateOnStages?: number[];
}

export interface StoryThreadConfig {
  enabled: boolean;
  maxActiveThreads: number;
  maxPendingDevelopments: number;
  maxCombinedTaskMultiplier: number;
  minCombinedTaskMultiplier: number;
  maxCombinedFlashMultiplier: number;
  minCombinedFlashMultiplier: number;
  tightBudgetThresholdMinor: number;
  tightBudgetRecoveryMinor: number;
}

export const DEFAULT_STORY_THREAD_CONFIG: StoryThreadConfig = {
  enabled: true,
  maxActiveThreads: 3,
  maxPendingDevelopments: 2,
  maxCombinedTaskMultiplier: 1.3,
  minCombinedTaskMultiplier: 0.9,
  maxCombinedFlashMultiplier: 1.25,
  minCombinedFlashMultiplier: 0.92,
  tightBudgetThresholdMinor: 5_000,
  tightBudgetRecoveryMinor: 10_000,
};

export const STORY_TEMPLATE_MARCO_FAVOR: StoryThreadTemplate = {
  templateId: 'marco_favor_v1',
  type: 'npc',
  priority: 1.15,
  maxDevelopments: 2,
  recordLifeUpdateOnStages: [2],
  stages: [
    {
      stage: 1,
      effects: {
        taskDefinitionMultipliers: { DEMO_NPC_MARCO_OPPORTUNITY: 1.28 },
        npcTemplateMultipliers: { neighbor_marco: 1.12 },
        taskContextMultipliers: { social: 1.08 },
      },
      expiryGameMs: 12 * 60 * 60 * 1000,
    },
    {
      stage: 2,
      effects: {
        taskContextMultipliers: { social: 1.06 },
        npcTemplateMultipliers: { neighbor_marco: 1.08 },
      },
    },
  ],
};

export const STORY_TEMPLATE_GIULIA_TENSION: StoryThreadTemplate = {
  templateId: 'giulia_tension_v1',
  type: 'npc',
  priority: 1.1,
  maxDevelopments: 2,
  recordLifeUpdateOnStages: [2],
  stages: [
    {
      stage: 1,
      effects: {
        taskDefinitionMultipliers: { DEMO_NPC_GIULIA_WARNING: 1.22 },
        taskContextMultipliers: { social: 1.1, dialogue: 1.06 },
      },
      dormantCooldownGameMs: 8 * 60 * 60 * 1000,
      expiryGameMs: 16 * 60 * 60 * 1000,
    },
    {
      stage: 2,
      effects: {
        taskContextMultipliers: { social: 1.04 },
      },
    },
  ],
};

export const STORY_TEMPLATE_TRANSPORT_DISRUPTION: StoryThreadTemplate = {
  templateId: 'transport_disruption_v1',
  type: 'world_event',
  priority: 1.12,
  maxDevelopments: 2,
  recordLifeUpdateOnStages: [2],
  stages: [
    {
      stage: 1,
      effects: {
        taskContextMultipliers: { social: 1.14, living: 1.1, unexpected: 1.08 },
        npcTemplateMultipliers: { neighbor_marco: 1.1 },
      },
      expiryGameMs: 8 * 60 * 60 * 1000,
    },
    {
      stage: 2,
      effects: {
        taskContextMultipliers: { social: 1.06 },
      },
      dormantCooldownGameMs: 10 * 60 * 60 * 1000,
    },
  ],
};

export const STORY_TEMPLATE_FLASH_DELIVERY: StoryThreadTemplate = {
  templateId: 'flash_delivery_trace_v1',
  type: 'flash',
  priority: 1.08,
  maxDevelopments: 2,
  recordLifeUpdateOnStages: [2],
  stages: [
    {
      stage: 1,
      effects: {
        flashTypeMultipliers: { economic: 1.1 },
      },
      dormantCooldownGameMs: 4 * 60 * 60 * 1000,
    },
    {
      stage: 2,
      effects: {
        flashTemplateMultipliers: { FLASH_ECONOMIC_DELIVERY: 1.18 },
        taskContextMultipliers: { economic: 1.1, work: 1.06 },
      },
      expiryGameMs: 20 * 60 * 60 * 1000,
    },
  ],
};

export const STORY_TEMPLATE_TIGHT_BUDGET: StoryThreadTemplate = {
  templateId: 'tight_budget_v1',
  type: 'economic',
  priority: 1.05,
  maxDevelopments: 1,
  stages: [
    {
      stage: 1,
      effects: {
        taskContextMultipliers: { economic: 1.16, work: 1.1, social: 1.06 },
        flashTypeMultipliers: { economic: 1.12, work: 1.08 },
      },
      expiryGameMs: 24 * 60 * 60 * 1000,
    },
  ],
};

export const STORY_THREAD_TEMPLATES: readonly StoryThreadTemplate[] = [
  STORY_TEMPLATE_MARCO_FAVOR,
  STORY_TEMPLATE_GIULIA_TENSION,
  STORY_TEMPLATE_TRANSPORT_DISRUPTION,
  STORY_TEMPLATE_FLASH_DELIVERY,
  STORY_TEMPLATE_TIGHT_BUDGET,
];

let configOverride: StoryThreadConfig | null = null;

export function getStoryThreadConfig(): StoryThreadConfig {
  return configOverride ?? DEFAULT_STORY_THREAD_CONFIG;
}

export function setStoryThreadConfigForTests(config: StoryThreadConfig | null): void {
  configOverride = config;
}

export function getStoryThreadTemplate(templateId: string): StoryThreadTemplate | undefined {
  return STORY_THREAD_TEMPLATES.find((template) => template.templateId === templateId);
}

export function listStoryThreadTemplates(): readonly StoryThreadTemplate[] {
  return STORY_THREAD_TEMPLATES;
}
