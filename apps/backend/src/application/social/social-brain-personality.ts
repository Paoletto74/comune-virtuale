import type { CharacterTraits } from './social-brain-types.js';

const DEFAULT_TRAITS: CharacterTraits = {
  confidence: 50,
  kindness: 50,
  irritability: 30,
  pride: 40,
  sociability: 50,
  impulsiveness: 40,
  humor: 40,
};

/** Derive numeric traits from existing character label + linguistic style. */
export function resolveCharacterTraits(input: {
  character?: string | null;
  linguisticStyle?: string | null;
}): CharacterTraits {
  const character = (input.character ?? '').toLowerCase();
  const style = (input.linguisticStyle ?? '').toLowerCase();
  const traits = { ...DEFAULT_TRAITS };

  if (character.includes('affabile') || character.includes('generoso') || character.includes('espansivo')) {
    traits.kindness += 20;
    traits.sociability += 15;
  }
  if (character.includes('timid') || character.includes('riservat')) {
    traits.confidence -= 20;
    traits.sociability -= 10;
  }
  if (character.includes('irascibile') || character.includes('permalo')) {
    traits.irritability += 25;
    traits.kindness -= 10;
  }
  if (character.includes('cinico') || character.includes('freddo')) {
    traits.kindness -= 15;
    traits.humor += 10;
  }
  if (character.includes('ironico') || character.includes('sarcastic')) {
    traits.humor += 25;
  }
  if (character.includes('ambizioso') || character.includes('orgoglioso')) {
    traits.pride += 25;
    traits.confidence += 10;
  }
  if (character.includes('professional')) {
    traits.confidence += 10;
    traits.impulsiveness -= 15;
  }
  if (style.includes('breve') || style.includes('secco')) {
    traits.sociability -= 5;
  }
  if (style.includes('caldo') || style.includes('cordial')) {
    traits.kindness += 10;
    traits.sociability += 10;
  }

  return clampTraits(traits);
}

function clampTraits(traits: CharacterTraits): CharacterTraits {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return {
    confidence: clamp(traits.confidence),
    kindness: clamp(traits.kindness),
    irritability: clamp(traits.irritability),
    pride: clamp(traits.pride),
    sociability: clamp(traits.sociability),
    impulsiveness: clamp(traits.impulsiveness),
    humor: clamp(traits.humor),
  };
}
