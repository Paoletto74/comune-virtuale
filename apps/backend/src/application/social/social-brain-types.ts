import type { ChatOptionEffect } from '../../slice/social-chat-scenarios.js';

/** Player/citizen message intents — keep set small. */
export type SocialIntent =
  | 'GREETING'
  | 'FAREWELL'
  | 'QUESTION'
  | 'ANSWER'
  | 'REQUEST'
  | 'INVITATION'
  | 'AGREE'
  | 'REFUSE'
  | 'THANK'
  | 'APOLOGIZE'
  | 'COMPLIMENT'
  | 'TEASE'
  | 'INSULT'
  | 'WARN'
  | 'EXPRESS_AFFECTION'
  | 'EXPRESS_ANGER'
  | 'SURPRISE'
  | 'IGNORE'
  | 'UNKNOWN';

export type SocialTone =
  | 'friendly'
  | 'neutral'
  | 'cold'
  | 'angry'
  | 'affectionate'
  | 'ironic'
  | 'playful'
  | 'rude'
  | 'formal'
  | 'shy'
  | 'sarcastic';

export interface CharacterTraits {
  confidence: number;
  kindness: number;
  irritability: number;
  pride: number;
  sociability: number;
  impulsiveness: number;
  humor: number;
}

export interface SocialBrainRelationshipContext {
  trust: number;
  affection: number;
  conflict: number;
  familiarity: number;
  relationshipState: string;
}

export interface SocialBrainMemory {
  lastTopic?: string;
  lastEvent?: string;
  emotionalState?: string;
  lastRelationSummary?: string;
  daysSinceLastInteraction?: number;
  promise?: string;
  conflictNote?: string;
  invitationPending?: string;
  lastCitizenIntent?: SocialIntent;
  lastNpcTone?: SocialTone;
}

export interface SocialBrainInput {
  citizenMessage: string;
  citizenDisplayName?: string;
  npcDisplayName: string;
  npcTemplateId: string | null;
  traits: CharacterTraits;
  relationship: SocialBrainRelationshipContext;
  memory: SocialBrainMemory;
  localHour?: number;
  isOpening?: boolean;
}

export interface SocialBrainEvaluation {
  intent: SocialIntent;
  tone: SocialTone;
  confidence: number;
  relationshipEffects: ChatOptionEffect;
  moodEffect?: string;
  possibleEvent?: string;
  possibleTaskTrigger?: string;
}

export interface SocialBrainOutput {
  response: string;
  evaluation: SocialBrainEvaluation;
  memoryUpdate: Partial<SocialBrainMemory>;
}

export const SOCIAL_BRAIN_FREE_SCENARIO_ID = 'social_brain_free';
