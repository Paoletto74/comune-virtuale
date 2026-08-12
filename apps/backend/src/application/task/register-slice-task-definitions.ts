import {
  DEMO_BOSS_LATE_END_NEGATIVE,
  DEMO_BOSS_LATE_END_NEUTRAL,
  DEMO_BOSS_LATE_END_POSITIVE,
  DEMO_BOSS_LATE_S2A,
  DEMO_BOSS_LATE_S2B,
  DEMO_BOSS_LATE_S2C,
  DEMO_BOSS_LATE_S3_MERGE,
  BOSS_DIALOGUE_NODES,
  isBossDialogueTerminal,
} from '../../slice/boss-dialogue-constants.js';
import { DEMO_BOSS_GREETING_DEFINITION_ID } from '../../slice/boss-constants.js';
import {
  SLICE_DEMO_TASK_ALLOWED_OPTIONS,
  SLICE_DEMO_TASK_CONTENT,
  SLICE_DEMO_TASK_DEFINITION_ID,
  SLICE_DEMO_TASK_OPTION_HELP,
  SLICE_DEMO_TASK_OPTION_IGNORE,
} from '../../slice/constants.js';
import {
  DEMO_FOUND_WALLET_CONTENT,
  DEMO_FOUND_WALLET_DEFINITION_ID,
  DEMO_FOUND_WALLET_OPTIONS,
  DEMO_NEIGHBOR_FAVOR_CONTENT,
  DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
  DEMO_NEIGHBOR_FAVOR_OPTIONS,
  DEMO_SUITCASE_OFFER_CONTENT,
  DEMO_SUITCASE_OFFER_DEFINITION_ID,
  DEMO_SUITCASE_OFFER_OPTIONS,
} from '../../slice/c3-pilot-tasks-constants.js';
import {
  DEMO_ACQUAINTANCE_FAVOR_CONTENT,
  DEMO_ACQUAINTANCE_FAVOR_DEFINITION_ID,
  DEMO_ACQUAINTANCE_FAVOR_OPTIONS,
  DEMO_CHARITY_COLLECTOR_CONTENT,
  DEMO_CHARITY_COLLECTOR_DEFINITION_ID,
  DEMO_CHARITY_COLLECTOR_OPTIONS,
  DEMO_FAMILY_CHECKIN_CONTENT,
  DEMO_FAMILY_CHECKIN_DEFINITION_ID,
  DEMO_FAMILY_CHECKIN_OPTIONS,
  DEMO_SHADY_OFFER_CONTENT,
  DEMO_SHADY_OFFER_DEFINITION_ID,
  DEMO_SHADY_OFFER_OPTIONS,
  DEMO_WORK_COLLEAGUE_COVER_CONTENT,
  DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID,
  DEMO_WORK_COLLEAGUE_COVER_OPTIONS,
  DEMO_WORK_SUPPLIER_DELAY_CONTENT,
  DEMO_WORK_SUPPLIER_DELAY_DEFINITION_ID,
  DEMO_WORK_SUPPLIER_DELAY_OPTIONS,
} from '../../slice/variety-content-constants.js';
import { VARIETY_V2_STANDARD_TASKS } from '../../slice/variety-content-v2-constants.js';
import { NPC_CONSEQUENCE_TASKS } from '../../slice/npc-relationship-consequences-constants.js';
import {
  isVarietyDialogueTerminal,
  VARIETY_DIALOGUE_NODES,
} from '../../slice/variety-dialogue-constants.js';
import { VARIETY_V3_STANDARD_TASKS } from '../../slice/variety-content-v3-constants.js';
import {
  isVarietyV2DialogueTerminal,
  VARIETY_V2_DIALOGUE_NODES,
} from '../../slice/variety-dialogue-v2-constants.js';
import {
  isVarietyV3DialogueTerminal,
  VARIETY_V3_DIALOGUE_NODES,
} from '../../slice/variety-dialogue-v3-constants.js';
import {
  DEMO_CAREER_TENTATION_MEDICINA_CONTENT,
  DEMO_CAREER_TENTATION_MEDICINA_DEFINITION_ID,
  DEMO_NPC_MARCO_LEAK_CONTENT,
  DEMO_NPC_MARCO_LEAK_DEFINITION_ID,
  isMega1DialogueTerminal,
  MEGA1_DIALOGUE_NODES,
} from '../../slice/mega1-demo-tasks-constants.js';
import { ANTI_STALL_STANDARD_TASKS } from '../../slice/anti-stall-tasks-constants.js';
import type { TaskDefinitionCatalog, TaskKind } from './task-definition-catalog.js';
import { defaultTaskDefinitionCatalog } from './task-definition-catalog.js';

registerSliceTaskDefinitions(defaultTaskDefinitionCatalog);

function registerElderlyDefinition(catalog: TaskDefinitionCatalog): void {
  catalog.register({
    definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
    title: SLICE_DEMO_TASK_CONTENT.title,
    description: SLICE_DEMO_TASK_CONTENT.description,
    taskKind: 'standard',
    options: SLICE_DEMO_TASK_ALLOWED_OPTIONS.map((optionId) => ({
      optionId,
      label: optionLabelForElderly(optionId),
      presentationHint: 'action' as const,
    })),
  });
}

function registerBossDialogueDefinitions(catalog: TaskDefinitionCatalog): void {
  for (const [definitionId, node] of Object.entries(BOSS_DIALOGUE_NODES)) {
    const taskKind: TaskKind = isBossDialogueTerminal(definitionId)
      ? 'dialogue_terminal'
      : 'dialogue_step';
    catalog.register({
      definitionId,
      title: node.title,
      description: node.description,
      taskKind,
      options: node.options.map((option) => ({
        optionId: option.optionId,
        label: option.label,
        presentationHint: 'dialogue_line' as const,
      })),
    });
  }
}

function registerC3PilotDefinitions(catalog: TaskDefinitionCatalog): void {
  catalog.register({
    definitionId: DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
    title: DEMO_NEIGHBOR_FAVOR_CONTENT.title,
    description: DEMO_NEIGHBOR_FAVOR_CONTENT.description,
    taskKind: 'standard',
    options: DEMO_NEIGHBOR_FAVOR_OPTIONS.map((optionId) => ({
      optionId,
      label: DEMO_NEIGHBOR_FAVOR_CONTENT.optionLabels[optionId],
    })),
  });

  catalog.register({
    definitionId: DEMO_SUITCASE_OFFER_DEFINITION_ID,
    title: DEMO_SUITCASE_OFFER_CONTENT.title,
    description: DEMO_SUITCASE_OFFER_CONTENT.description,
    taskKind: 'standard',
    options: DEMO_SUITCASE_OFFER_OPTIONS.map((optionId) => ({
      optionId,
      label: DEMO_SUITCASE_OFFER_CONTENT.optionLabels[optionId],
    })),
  });

  catalog.register({
    definitionId: DEMO_FOUND_WALLET_DEFINITION_ID,
    title: DEMO_FOUND_WALLET_CONTENT.title,
    description: DEMO_FOUND_WALLET_CONTENT.description,
    taskKind: 'standard',
    options: DEMO_FOUND_WALLET_OPTIONS.map((optionId) => ({
      optionId,
      label: DEMO_FOUND_WALLET_CONTENT.optionLabels[optionId],
    })),
  });
}

function registerVarietyStandardDefinitions(catalog: TaskDefinitionCatalog): void {
  type VarietyTask = {
    id: string;
    title: string;
    description: string;
    optionLabels: Record<string, string>;
    options: readonly string[];
  };

  const standardTasks: VarietyTask[] = [
    {
      id: DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID,
      title: DEMO_WORK_COLLEAGUE_COVER_CONTENT.title,
      description: DEMO_WORK_COLLEAGUE_COVER_CONTENT.description,
      optionLabels: DEMO_WORK_COLLEAGUE_COVER_CONTENT.optionLabels,
      options: DEMO_WORK_COLLEAGUE_COVER_OPTIONS,
    },
    {
      id: DEMO_WORK_SUPPLIER_DELAY_DEFINITION_ID,
      title: DEMO_WORK_SUPPLIER_DELAY_CONTENT.title,
      description: DEMO_WORK_SUPPLIER_DELAY_CONTENT.description,
      optionLabels: DEMO_WORK_SUPPLIER_DELAY_CONTENT.optionLabels,
      options: DEMO_WORK_SUPPLIER_DELAY_OPTIONS,
    },
    {
      id: DEMO_FAMILY_CHECKIN_DEFINITION_ID,
      title: DEMO_FAMILY_CHECKIN_CONTENT.title,
      description: DEMO_FAMILY_CHECKIN_CONTENT.description,
      optionLabels: DEMO_FAMILY_CHECKIN_CONTENT.optionLabels,
      options: DEMO_FAMILY_CHECKIN_OPTIONS,
    },
    {
      id: DEMO_ACQUAINTANCE_FAVOR_DEFINITION_ID,
      title: DEMO_ACQUAINTANCE_FAVOR_CONTENT.title,
      description: DEMO_ACQUAINTANCE_FAVOR_CONTENT.description,
      optionLabels: DEMO_ACQUAINTANCE_FAVOR_CONTENT.optionLabels,
      options: DEMO_ACQUAINTANCE_FAVOR_OPTIONS,
    },
    {
      id: DEMO_SHADY_OFFER_DEFINITION_ID,
      title: DEMO_SHADY_OFFER_CONTENT.title,
      description: DEMO_SHADY_OFFER_CONTENT.description,
      optionLabels: DEMO_SHADY_OFFER_CONTENT.optionLabels,
      options: DEMO_SHADY_OFFER_OPTIONS,
    },
    {
      id: DEMO_CHARITY_COLLECTOR_DEFINITION_ID,
      title: DEMO_CHARITY_COLLECTOR_CONTENT.title,
      description: DEMO_CHARITY_COLLECTOR_CONTENT.description,
      optionLabels: DEMO_CHARITY_COLLECTOR_CONTENT.optionLabels,
      options: DEMO_CHARITY_COLLECTOR_OPTIONS,
    },
  ];

  for (const task of standardTasks) {
    catalog.register({
      definitionId: task.id,
      title: task.title,
      description: task.description,
      taskKind: 'standard',
      options: task.options.map((optionId) => ({
        optionId,
        label: task.optionLabels[optionId]!,
      })),
    });
  }
}

function registerVarietyDialogueDefinitions(catalog: TaskDefinitionCatalog): void {
  for (const [definitionId, node] of Object.entries(VARIETY_DIALOGUE_NODES)) {
    const taskKind: TaskKind = isVarietyDialogueTerminal(definitionId)
      ? 'dialogue_terminal'
      : 'dialogue_step';
    catalog.register({
      definitionId,
      title: node.title,
      description: node.description,
      taskKind,
      options: node.options.map((option) => ({
        optionId: option.optionId,
        label: option.label,
        presentationHint: 'dialogue_line' as const,
      })),
    });
  }
}

function registerNpcConsequenceDefinitions(catalog: TaskDefinitionCatalog): void {
  for (const task of NPC_CONSEQUENCE_TASKS) {
    catalog.register({
      definitionId: task.definitionId,
      title: task.title,
      description: task.description,
      taskKind: 'standard',
      options: task.options.map((option) => ({
        optionId: option.optionId,
        label: option.label,
      })),
    });
  }
}

function registerVarietyV2StandardDefinitions(catalog: TaskDefinitionCatalog): void {
  for (const task of VARIETY_V2_STANDARD_TASKS) {
    catalog.register({
      definitionId: task.definitionId,
      title: task.title,
      description: task.description,
      taskKind: 'standard',
      options: task.options.map((option) => ({
        optionId: option.optionId,
        label: option.label,
      })),
    });
  }
}

function registerVarietyV2DialogueDefinitions(catalog: TaskDefinitionCatalog): void {
  for (const [definitionId, node] of Object.entries(VARIETY_V2_DIALOGUE_NODES)) {
    const taskKind: TaskKind = isVarietyV2DialogueTerminal(definitionId)
      ? 'dialogue_terminal'
      : 'dialogue_step';
    catalog.register({
      definitionId,
      title: node.title,
      description: node.description,
      taskKind,
      options: node.options.map((option) => ({
        optionId: option.optionId,
        label: option.label,
        presentationHint: 'dialogue_line' as const,
      })),
    });
  }
}

function registerVarietyV3StandardDefinitions(catalog: TaskDefinitionCatalog): void {
  for (const task of VARIETY_V3_STANDARD_TASKS) {
    catalog.register({
      definitionId: task.definitionId,
      title: task.title,
      description: task.description,
      taskKind: 'standard',
      options: task.options.map((option) => ({
        optionId: option.optionId,
        label: option.label,
      })),
    });
  }
}

function registerVarietyV3DialogueDefinitions(catalog: TaskDefinitionCatalog): void {
  for (const [definitionId, node] of Object.entries(VARIETY_V3_DIALOGUE_NODES)) {
    const taskKind: TaskKind = isVarietyV3DialogueTerminal(definitionId)
      ? 'dialogue_terminal'
      : 'dialogue_step';
    catalog.register({
      definitionId,
      title: node.title,
      description: node.description,
      taskKind,
      options: node.options.map((option) => ({
        optionId: option.optionId,
        label: option.label,
        presentationHint: 'dialogue_line' as const,
      })),
    });
  }
}

function registerMega1DemoDefinitions(catalog: TaskDefinitionCatalog): void {
  catalog.register({
    definitionId: DEMO_NPC_MARCO_LEAK_DEFINITION_ID,
    title: DEMO_NPC_MARCO_LEAK_CONTENT.title,
    description: DEMO_NPC_MARCO_LEAK_CONTENT.description,
    taskKind: 'standard',
    options: [
      { optionId: 'help', label: DEMO_NPC_MARCO_LEAK_CONTENT.helpLabel, presentationHint: 'action' },
      { optionId: 'delegate', label: DEMO_NPC_MARCO_LEAK_CONTENT.delegateLabel, presentationHint: 'action' },
    ],
  });

  catalog.register({
    definitionId: DEMO_CAREER_TENTATION_MEDICINA_DEFINITION_ID,
    title: DEMO_CAREER_TENTATION_MEDICINA_CONTENT.title,
    description: DEMO_CAREER_TENTATION_MEDICINA_CONTENT.description,
    taskKind: 'standard',
    options: [
      { optionId: 'accept_shadow', label: DEMO_CAREER_TENTATION_MEDICINA_CONTENT.acceptLabel, presentationHint: 'action' },
      { optionId: 'decline', label: DEMO_CAREER_TENTATION_MEDICINA_CONTENT.declineLabel, presentationHint: 'action' },
    ],
  });

  for (const [definitionId, node] of Object.entries(MEGA1_DIALOGUE_NODES)) {
    const taskKind: TaskKind = isMega1DialogueTerminal(definitionId)
      ? 'dialogue_terminal'
      : 'dialogue_step';
    catalog.register({
      definitionId,
      title: 'Conversazione con Luca',
      description: node.npcLine,
      taskKind,
      options: node.options.map((option) => ({
        optionId: option.optionId,
        label: option.label,
        presentationHint: 'dialogue_line' as const,
      })),
    });
  }
}

function registerAntiStallDefinitions(catalog: TaskDefinitionCatalog): void {
  for (const task of ANTI_STALL_STANDARD_TASKS) {
    catalog.register({
      definitionId: task.definitionId,
      title: task.title,
      description: task.description,
      taskKind: 'standard',
      options: task.options.map((option) => ({
        optionId: option.optionId,
        label: option.label,
      })),
    });
  }
}

function optionLabelForElderly(optionId: (typeof SLICE_DEMO_TASK_ALLOWED_OPTIONS)[number]): string {
  if (optionId === SLICE_DEMO_TASK_OPTION_HELP) {
    return SLICE_DEMO_TASK_CONTENT.helpLabel;
  }
  if (optionId === SLICE_DEMO_TASK_OPTION_IGNORE) {
    return SLICE_DEMO_TASK_CONTENT.ignoreLabel;
  }
  return SLICE_DEMO_TASK_CONTENT.stealWalletLabel;
}

export function registerSliceTaskDefinitions(
  catalog: TaskDefinitionCatalog = defaultTaskDefinitionCatalog,
): void {
  registerElderlyDefinition(catalog);
  registerBossDialogueDefinitions(catalog);
  registerC3PilotDefinitions(catalog);
  registerVarietyStandardDefinitions(catalog);
  registerVarietyDialogueDefinitions(catalog);
  registerVarietyV2StandardDefinitions(catalog);
  registerNpcConsequenceDefinitions(catalog);
  registerVarietyV2DialogueDefinitions(catalog);
  registerVarietyV3StandardDefinitions(catalog);
  registerVarietyV3DialogueDefinitions(catalog);
  registerMega1DemoDefinitions(catalog);
  registerAntiStallDefinitions(catalog);
}

export {
  DEMO_BOSS_GREETING_DEFINITION_ID,
  DEMO_BOSS_LATE_S2A,
  DEMO_BOSS_LATE_S2B,
  DEMO_BOSS_LATE_S2C,
  DEMO_BOSS_LATE_S3_MERGE,
  DEMO_BOSS_LATE_END_POSITIVE,
  DEMO_BOSS_LATE_END_NEUTRAL,
  DEMO_BOSS_LATE_END_NEGATIVE,
};
