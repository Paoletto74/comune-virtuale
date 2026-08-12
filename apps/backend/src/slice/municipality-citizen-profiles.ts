/**
 * Profili economici e sociali dei cittadini del Comune Virtuale.
 * Fonte ufficiale runtime per popolazione, elenco cittadini e classifiche.
 * Sostituisce le query legacy su `citizens` (COUNT(*), ranking su account test).
 * Basato su INITIAL_NPC_ROSTER (30 NPC effettivi).
 */
import {
  INITIAL_NPC_COUNT,
  INITIAL_NPC_ROSTER,
  type InitialNpcDefinition,
} from './initial-npc-roster.js';
import type { CitizenDirectoryRecord, CitizenRankingRecord } from '../domain/ports/repositories.js';

export interface MunicipalityCitizenProfile {
  citizenId: string;
  templateId: string;
  displayName: string;
  level: number;
  sympathy: number;
  reputation: number;
  wealthMinor: number;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function seededOffset(templateId: string, salt: string, spread: number): number {
  const hash = Math.abs(hashString(`${templateId}:${salt}`));
  return hash % (spread * 2 + 1) - spread;
}

function occupationWealthBase(occupation: string | undefined, category: string): number {
  const role = (occupation ?? category).toLowerCase();

  if (role.includes('avvocato') || role.includes('medico')) return 42_000;
  if (role.includes('politico') || role.includes('consigliere')) return 28_000;
  if (role.includes('giornalista')) return 22_000;
  if (role.includes('commerciante') || role.includes('mercante') || role.includes('droghiera')) {
    return 18_000;
  }
  if (role.includes('falegname') || role.includes('sarta') || role.includes('artigian')) {
    return 12_000;
  }
  if (role.includes('guardia') || role.includes('tecnico')) return 9_500;
  if (role.includes('impiegata') || role.includes('bibliotecario')) return 8_000;
  if (role.includes('barista') || role.includes('operaio') || role.includes('autista')) return 6_500;
  if (role.includes('fattorino') || role.includes('studente') || role.includes('taxi')) return 3_200;
  if (role.includes('pensionato') || category === 'elderly') return 4_800;
  if (role.includes('casalinga')) return 5_500;
  if (category === 'stranger') return 2_800;

  return 7_000;
}

function resolveLevel(npc: InitialNpcDefinition): number {
  const occupation = npc.occupation?.toLowerCase() ?? '';
  if (occupation.includes('avvocato') || occupation.includes('politico') || occupation.includes('medico')) {
    return 4;
  }
  if (
    occupation.includes('giornalista') ||
    occupation.includes('commerciante') ||
    occupation.includes('artigian') ||
    occupation.includes('falegname')
  ) {
    return 3;
  }
  if (npc.ageYears >= 65) return 2;
  if (npc.ageYears <= 22) return 1;
  return 2;
}

function resolveSympathy(npc: InitialNpcDefinition): number {
  const base =
    npc.category === 'neighbor' || npc.category === 'family'
      ? 62
      : npc.category === 'supplier'
        ? 55
        : npc.category === 'colleague'
          ? 58
          : 48;
  return Math.min(95, Math.max(18, base + seededOffset(npc.templateId, 'sympathy', 12)));
}

function resolveReputation(npc: InitialNpcDefinition): number {
  const occupation = npc.occupation?.toLowerCase() ?? '';
  let base = 50;
  if (occupation.includes('medico') || occupation.includes('bibliotecario')) base = 72;
  else if (occupation.includes('politico') || occupation.includes('giornalista')) base = 68;
  else if (occupation.includes('avvocato')) base = 65;
  else if (occupation.includes('guardia') || occupation.includes('operaio')) base = 54;
  else if (npc.category === 'stranger') base = 38;
  return Math.min(92, Math.max(15, base + seededOffset(npc.templateId, 'reputation', 10)));
}

export function resolveMunicipalityCitizenProfile(
  npc: InitialNpcDefinition,
  gameTimeMs = 0,
): MunicipalityCitizenProfile {
  const baseWealth = occupationWealthBase(npc.occupation, npc.category);
  const wealthSpread = seededOffset(npc.templateId, 'wealth', 2_500);
  const dayBucket = Math.floor(gameTimeMs / (24 * 60 * 60 * 1000));
  const dailyShift = seededOffset(npc.templateId, `wealth-day:${dayBucket}`, 350);

  return {
    citizenId: npc.templateId,
    templateId: npc.templateId,
    displayName: npc.displayName,
    level: resolveLevel(npc),
    sympathy: resolveSympathy(npc),
    reputation: resolveReputation(npc),
    wealthMinor: Math.max(180, baseWealth + wealthSpread + dailyShift),
  };
}

export function getMunicipalityPopulationCount(): number {
  return INITIAL_NPC_COUNT;
}

export function getMunicipalityCitizenProfiles(gameTimeMs = 0): MunicipalityCitizenProfile[] {
  return INITIAL_NPC_ROSTER.map((npc) => resolveMunicipalityCitizenProfile(npc, gameTimeMs));
}

function toDirectoryRecord(profile: MunicipalityCitizenProfile): CitizenDirectoryRecord {
  return {
    citizenId: profile.citizenId,
    displayName: profile.displayName,
    level: profile.level,
    sympathy: profile.sympathy,
    reputation: profile.reputation,
  };
}

function toRankingRecord(
  profile: MunicipalityCitizenProfile,
  value: number,
): CitizenRankingRecord {
  return {
    citizenId: profile.citizenId,
    displayName: profile.displayName,
    value,
  };
}

export function getMunicipalityCitizensDirectory(
  limit: number,
  gameTimeMs = 0,
): CitizenDirectoryRecord[] {
  return getMunicipalityCitizenProfiles(gameTimeMs)
    .map(toDirectoryRecord)
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'it'))
    .slice(0, limit);
}

export function getMunicipalityWealthRankings(
  limit: number,
  gameTimeMs = 0,
): CitizenRankingRecord[] {
  return getMunicipalityCitizenProfiles(gameTimeMs)
    .sort((a, b) => b.wealthMinor - a.wealthMinor)
    .slice(0, limit)
    .map((profile) => toRankingRecord(profile, profile.wealthMinor));
}

export function getMunicipalityPovertyRankings(
  limit: number,
  gameTimeMs = 0,
): CitizenRankingRecord[] {
  return getMunicipalityCitizenProfiles(gameTimeMs)
    .sort((a, b) => a.wealthMinor - b.wealthMinor)
    .slice(0, limit)
    .map((profile) => toRankingRecord(profile, profile.wealthMinor));
}

export function getMunicipalitySympathyRankings(
  limit: number,
  gameTimeMs = 0,
): CitizenRankingRecord[] {
  return getMunicipalityCitizenProfiles(gameTimeMs)
    .sort((a, b) => b.sympathy - a.sympathy)
    .slice(0, limit)
    .map((profile) => toRankingRecord(profile, profile.sympathy));
}

export function getMunicipalityReputationRankings(
  limit: number,
  gameTimeMs = 0,
): CitizenRankingRecord[] {
  return getMunicipalityCitizenProfiles(gameTimeMs)
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, limit)
    .map((profile) => toRankingRecord(profile, profile.reputation));
}
