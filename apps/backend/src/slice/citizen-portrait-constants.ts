export const CITIZEN_PORTRAIT_SLOT_COUNT = 50;

const PORTRAIT_ID_PATTERN = /^profile_\d{3}$/;

export function isValidCitizenPortraitId(portraitId: string): boolean {
  if (!PORTRAIT_ID_PATTERN.test(portraitId)) {
    return false;
  }

  const slot = Number.parseInt(portraitId.slice('profile_'.length), 10);
  return Number.isInteger(slot) && slot >= 1 && slot <= CITIZEN_PORTRAIT_SLOT_COUNT;
}
