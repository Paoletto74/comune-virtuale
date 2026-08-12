const GENDER_LABELS: Record<string, string> = {
  male: 'Uomo',
  female: 'Donna',
  other: 'Altro',
  prefer_not_to_say: 'Preferisco non dire',
};

export function formatGender(gender: string): string | null {
  return GENDER_LABELS[gender] ?? null;
}
