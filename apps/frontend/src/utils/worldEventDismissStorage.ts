const STORAGE_KEY = 'cv:world-event-popup-dismissed';

function storageKey(citizenId: string, eventId: string): string {
  return `${citizenId}:${eventId}`;
}

function readStore(): Record<string, true> {
  if (typeof sessionStorage === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, true>;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, true>): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota or privacy mode errors; in-memory state still applies.
  }
}

export function isWorldEventPopupDismissed(citizenId: string, eventId: string): boolean {
  const store = readStore();
  return store[storageKey(citizenId, eventId)] === true;
}

export function markWorldEventPopupDismissed(citizenId: string, eventId: string): void {
  const store = readStore();
  store[storageKey(citizenId, eventId)] = true;
  writeStore(store);
}

export function listDismissedWorldEventIds(citizenId: string): string[] {
  const prefix = `${citizenId}:`;
  return Object.keys(readStore())
    .filter((key) => key.startsWith(prefix))
    .map((key) => key.slice(prefix.length));
}
