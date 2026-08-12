import { describe, expect, it } from 'vitest';
import { resolveCitizenArchetype } from '@/utils/citizenArchetype';

describe('resolveCitizenArchetype', () => {
  it('maps occupation keywords to archetypes', () => {
    expect(resolveCitizenArchetype({ occupation: 'Studente universitario' })).toBe('student');
    expect(resolveCitizenArchetype({ occupation: 'Insegnante di scuola' })).toBe('teacher');
    expect(resolveCitizenArchetype({ occupation: 'Commerciante ambulante' })).toBe('merchant');
    expect(resolveCitizenArchetype({ occupation: 'Tecnico manutentore' })).toBe('technician');
    expect(resolveCitizenArchetype({ occupation: 'Disoccupato' })).toBe('unemployed');
    expect(resolveCitizenArchetype({ occupation: 'Pensionato' })).toBe('retiree');
    expect(resolveCitizenArchetype({ occupation: 'Manager aziendale' })).toBe('professional');
    expect(resolveCitizenArchetype({ occupation: 'Operaio di fabbrica' })).toBe('worker');
  });

  it('falls back to age band and age', () => {
    expect(resolveCitizenArchetype({ age: 70, ageBand: 'Adulto' })).toBe('retiree');
    expect(resolveCitizenArchetype({ age: 19 })).toBe('student');
  });

  it('returns generic when no match', () => {
    expect(resolveCitizenArchetype({ occupation: 'Sconosciuto' })).toBe('generic');
  });
});
