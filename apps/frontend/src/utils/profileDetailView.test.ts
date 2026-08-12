import { describe, expect, it } from 'vitest';
import {
  profileDetailFromDirectoryEntry,
  profileDetailFromPublicProfile,
} from '@/utils/profileDetailView';

describe('profileDetailView', () => {
  it('maps municipality directory entries by citizenId', () => {
    const detail = profileDetailFromDirectoryEntry({
      citizenId: 'student_alessio',
      displayName: 'Alessio Romano',
      level: 1,
      sympathy: 42,
      reputation: 18,
    });

    expect(detail.citizenId).toBe('student_alessio');
    expect(detail.displayName).toBe('Alessio Romano');
    expect(detail.citizenProfile.progression.level).toBe(1);
    expect(detail.personalValues.sympathy).toBe(42);
  });

  it('maps public profile responses by citizenId', () => {
    const detail = profileDetailFromPublicProfile({
      citizenId: 'citizen-123',
      displayName: 'Andrea Rinaldi',
      gender: 'male',
      age: 34,
      portraitId: 'profile_018',
      level: 3,
      levelLabel: 'Professionista',
      sympathy: 55,
      reputation: 61,
      correlationId: 'corr',
    });

    expect(detail.citizenId).toBe('citizen-123');
    expect(detail.displayName).toBe('Andrea Rinaldi');
    expect(detail.age).toBe(34);
    expect(detail.portraitId).toBe('profile_018');
    expect(detail.citizenProfile.progression.label).toBe('Professionista');
  });
});
