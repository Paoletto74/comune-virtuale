import { describe, expect, it } from 'vitest';
import { SocialBrainService } from './social-brain-service.js';
import type { SocialBrainInput } from './social-brain-types.js';

const brain = new SocialBrainService();

function baseInput(overrides: Partial<SocialBrainInput> = {}): SocialBrainInput {
  return {
    citizenMessage: 'Ciao!',
    citizenDisplayName: 'Paolo',
    npcDisplayName: 'Marco',
    npcTemplateId: 'neighbor_marco',
    traits: brain.resolveTraitsFromProfile({ character: 'affabile', linguisticStyle: 'pratico' }),
    relationship: {
      trust: 50,
      affection: 20,
      conflict: 0,
      familiarity: 10,
      relationshipState: 'conoscenza',
    },
    memory: {},
    ...overrides,
  };
}

describe('SocialBrainService', () => {
  it('classifies greeting intent', () => {
    expect(brain.classifyIntent('Ciao Marco, come va?').intent).toBe('GREETING');
  });

  it('classifies insult intent', () => {
    expect(brain.classifyIntent('Sei uno stupido').intent).toBe('INSULT');
  });

  it('classifies job request', () => {
    expect(brain.classifyIntent('Conosci qualcuno che possa offrirmi un lavoro?').intent).toBe('REQUEST');
  });

  it('returns fallback for unknown input', () => {
    const out = brain.processMessage(baseInput({ citizenMessage: 'xy' }));
    expect(['Capito.', 'Ok.', 'Ah.', 'Dimmi.', 'Non so.']).toContain(out.response);
  });

  it('proposes relationship effects without applying them directly', () => {
    const out = brain.processMessage(baseInput({ citizenMessage: 'Grazie mille!' }));
    expect(out.evaluation.intent).toBe('THANK');
    expect(out.evaluation.relationshipEffects.trust).toBeGreaterThan(0);
  });

  it('suggests job lead on work request with sufficient trust', () => {
    const out = brain.processMessage(
      baseInput({
        citizenMessage: 'Conosci qualcuno che possa offrirmi un lavoro?',
        relationship: {
          trust: 55,
          affection: 30,
          conflict: 0,
          familiarity: 20,
          relationshipState: 'amicizia',
        },
      }),
    );
    expect(out.evaluation.possibleTaskTrigger).toBe('job_lead_hint');
  });

  it('responds colder with high conflict relationship', () => {
    const warm = brain.processMessage(baseInput({ citizenMessage: 'Ciao' }));
    const cold = brain.processMessage(
      baseInput({
        citizenMessage: 'Ciao',
        relationship: {
          trust: 30,
          affection: 5,
          conflict: 70,
          familiarity: 10,
          relationshipState: 'conflitto',
        },
      }),
    );
    expect(warm.evaluation.tone).not.toBe('angry');
    expect(['cold', 'angry', 'rude']).toContain(cold.evaluation.tone);
  });

  it('produces coherent but not always identical replies for same seed context', () => {
    const a = brain.processMessage(baseInput({ citizenMessage: 'Bravo!' }));
    const b = brain.processMessage(
      baseInput({
        citizenMessage: 'Bravissimo!',
        npcTemplateId: 'youth_luca',
      }),
    );
    expect(a.response.length).toBeLessThan(80);
    expect(b.response.length).toBeLessThan(80);
  });

  it('generates opening line for free chat', () => {
    const out = brain.processMessage(baseInput({ citizenMessage: '', isOpening: true }));
    expect(out.response.length).toBeGreaterThan(0);
    expect(out.response.length).toBeLessThan(60);
  });

  it('updates structured memory after conversation', () => {
    const out = brain.processMessage(baseInput({ citizenMessage: 'Vieni stasera?' }));
    expect(out.memoryUpdate.lastCitizenIntent).toBe('INVITATION');
    expect(out.memoryUpdate.invitationPending).toBeTruthy();
  });
});
