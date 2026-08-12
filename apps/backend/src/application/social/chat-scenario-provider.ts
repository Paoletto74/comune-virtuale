/**
 * Seam for chat content providers. Preset scenarios remain fallback; Social Brain handles free chat.
 */
import type {
  ChatScenarioDefinition,
} from '../../slice/social-chat-scenarios.js';
import {
  getChatScenario,
  listChatScenariosForNpc,
  listSpontaneousScenarios,
} from '../../slice/social-chat-scenarios.js';

export interface ChatScenarioProvider {
  getChatScenario(scenarioId: string): ChatScenarioDefinition | null;
  listChatScenariosForNpc(npcTemplateId: string): ChatScenarioDefinition[];
  listSpontaneousScenarios(): ChatScenarioDefinition[];
}

export const defaultChatScenarioProvider: ChatScenarioProvider = {
  getChatScenario,
  listChatScenariosForNpc,
  listSpontaneousScenarios,
};
