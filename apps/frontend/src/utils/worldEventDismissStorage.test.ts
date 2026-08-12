import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  isWorldEventPopupDismissed,
  listDismissedWorldEventIds,
  markWorldEventPopupDismissed,
} from '@/utils/worldEventDismissStorage';

describe('worldEventDismissStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('tracks dismiss per citizenId and eventId', () => {
    markWorldEventPopupDismissed('citizen-1', 'event-a');
    expect(isWorldEventPopupDismissed('citizen-1', 'event-a')).toBe(true);
    expect(isWorldEventPopupDismissed('citizen-1', 'event-b')).toBe(false);
    expect(isWorldEventPopupDismissed('citizen-2', 'event-a')).toBe(false);
  });

  it('lists dismissed event ids for a citizen', () => {
    markWorldEventPopupDismissed('citizen-1', 'event-a');
    markWorldEventPopupDismissed('citizen-1', 'event-b');
    markWorldEventPopupDismissed('citizen-2', 'event-c');

    expect(listDismissedWorldEventIds('citizen-1').sort()).toEqual(['event-a', 'event-b']);
  });
});
