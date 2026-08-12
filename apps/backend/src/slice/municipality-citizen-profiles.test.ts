import { describe, expect, it } from 'vitest';
import { INITIAL_NPC_COUNT, INITIAL_NPC_ROSTER } from './initial-npc-roster.js';
import {
  getMunicipalityCitizenProfiles,
  getMunicipalityCitizensDirectory,
  getMunicipalityPopulationCount,
  getMunicipalityPovertyRankings,
  getMunicipalityReputationRankings,
  getMunicipalitySympathyRankings,
  getMunicipalityWealthRankings,
} from './municipality-citizen-profiles.js';

describe('municipality-citizen-profiles', () => {
  it('uses exactly 30 roster NPCs as municipality population', () => {
    expect(getMunicipalityPopulationCount()).toBe(30);
    expect(getMunicipalityCitizenProfiles().length).toBe(30);
  });

  it('uses realistic unique names from roster — no test placeholders', () => {
    const profiles = getMunicipalityCitizenProfiles();
    const names = profiles.map((profile) => profile.displayName);
    expect(new Set(names).size).toBe(30);
    expect(names).not.toContain('Time Citizen');
    expect(names).not.toContain('Buyer');
    expect(names).not.toContain('Mimmo');
    for (const npc of INITIAL_NPC_ROSTER) {
      expect(names).toContain(npc.displayName);
    }
  });

  it('feeds rankings from roster citizens only', () => {
    const wealth = getMunicipalityWealthRankings(5);
    const poverty = getMunicipalityPovertyRankings(5);
    const sympathy = getMunicipalitySympathyRankings(5);
    const reputation = getMunicipalityReputationRankings(5);

    expect(wealth.length).toBe(5);
    expect(poverty.length).toBe(5);
    expect(sympathy.length).toBe(5);
    expect(reputation.length).toBe(5);

    for (const entry of [...wealth, ...poverty, ...sympathy, ...reputation]) {
      expect(entry.displayName).not.toBe('Time Citizen');
      expect(entry.displayName).not.toBe('Buyer');
      expect(INITIAL_NPC_ROSTER.some((npc) => npc.templateId === entry.citizenId)).toBe(true);
    }
  });

  it('lists directory entries sorted by name', () => {
    const directory = getMunicipalityCitizensDirectory(30);
    expect(directory.length).toBe(INITIAL_NPC_COUNT);
    const sorted = [...directory].sort((a, b) =>
      a.displayName.localeCompare(b.displayName, 'it'),
    );
    expect(directory.map((row) => row.displayName)).toEqual(sorted.map((row) => row.displayName));
  });

  it('applies a small daily wealth shift for dynamic rankings', () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const profilesDayOne = getMunicipalityCitizenProfiles(dayMs * 10);
    const profilesSameDay = getMunicipalityCitizenProfiles(dayMs * 10 + 60_000);
    const profilesNextDay = getMunicipalityCitizenProfiles(dayMs * 11);

    expect(profilesDayOne.map((entry) => entry.wealthMinor)).toEqual(
      profilesSameDay.map((entry) => entry.wealthMinor),
    );

    const changed = profilesDayOne.some(
      (entry, index) => entry.wealthMinor !== profilesNextDay[index]!.wealthMinor,
    );
    expect(changed).toBe(true);
  });
});
