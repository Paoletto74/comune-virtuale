import type { CitizenRepository } from '../../domain/ports/repositories.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';
import { isValidCitizenPortraitId } from '../../slice/citizen-portrait-constants.js';
import { resolveMainLevelId } from '../../slice/citizen-progression-constants.js';
import { INITIAL_NPC_ROSTER } from '../../slice/initial-npc-roster.js';
import {
  isValidNpcPoolPortraitId,
  listNpcPoolPortraitIds,
  npcPoolPortraitImagePath,
} from '../../slice/npc-portrait-pool-constants.js';
import { resolveNpcPortraitImagePath } from '../../slice/npc-profile-portraits.js';
import type { DrizzleNpcPortraitAssignmentRepository } from '../../infrastructure/db/repositories/npc-portrait-assignment-repository.js';
import {
  PERSONAL_VALUE_CLAMP_MAX,
  PERSONAL_VALUE_CLAMP_MIN,
} from '../../slice/constants.js';

export interface AdminNpcEntry {
  templateId: string;
  displayName: string;
  occupation?: string;
  portraitId: string | null;
  portraitImagePath: string | null;
}

export interface AdminCitizenEditable {
  citizenId: string;
  displayName: string;
  gender: string;
  age: number;
  portraitId: string | null;
  mainLevel: number;
  sympathy: number;
  reputation: number;
  happiness: number;
}

export class AdminContextService {
  constructor(
    private readonly citizens: CitizenRepository,
    private readonly npcPortraits: DrizzleNpcPortraitAssignmentRepository,
  ) {}

  async listNpcPortraitPool(): Promise<{ portraitIds: string[] }> {
    return { portraitIds: listNpcPoolPortraitIds() };
  }

  async listNpcs(): Promise<{ npcs: AdminNpcEntry[] }> {
    const assignments = await this.npcPortraits.listAll();
    const assignmentByTemplate = new Map(assignments.map((row) => [row.templateId, row.portraitId]));

    return {
      npcs: INITIAL_NPC_ROSTER.map((npc) => {
        const portraitId = assignmentByTemplate.get(npc.templateId) ?? null;
        return {
          templateId: npc.templateId,
          displayName: npc.displayName,
          occupation: npc.occupation,
          portraitId,
          portraitImagePath: portraitId ? npcPoolPortraitImagePath(portraitId) : null,
        };
      }),
    };
  }

  async setNpcPortrait(input: {
    templateId: string;
    portraitId: string;
    updatedByAccountId: string;
  }): Promise<AdminNpcEntry> {
    if (!INITIAL_NPC_ROSTER.some((npc) => npc.templateId === input.templateId)) {
      throw new AppError('NOT_FOUND', 'NPC_TEMPLATE_NOT_FOUND', 'error.admin.npc_not_found');
    }
    if (!isValidNpcPoolPortraitId(input.portraitId)) {
      throw new AppError('VALIDATION', 'INVALID_NPC_PORTRAIT_ID', 'error.validation.npc_portrait_id');
    }

    const saved = await this.npcPortraits.upsert(input);
    const npc = INITIAL_NPC_ROSTER.find((entry) => entry.templateId === saved.templateId)!;
    return {
      templateId: saved.templateId,
      displayName: npc.displayName,
      occupation: npc.occupation,
      portraitId: saved.portraitId,
      portraitImagePath: npcPoolPortraitImagePath(saved.portraitId),
    };
  }

  async getNpcPortraitAssignmentsMap(): Promise<Map<string, string>> {
    const rows = await this.npcPortraits.listAll();
    return new Map(rows.map((row) => [row.templateId, row.portraitId]));
  }

  resolveNpcPortraitImagePath(templateId: string, assignedPortraitId?: string | null): string {
    return resolveNpcPortraitImagePath(templateId, assignedPortraitId);
  }

  async listPlayerCitizens(): Promise<{ citizens: AdminCitizenEditable[] }> {
    const rows = await this.citizens.listAll();
    const citizens = await Promise.all(
      rows.map(async (citizen) => this.buildEditableCitizen(citizen.citizenId)),
    );
    return { citizens };
  }

  async getEditableCitizen(citizenId: string): Promise<AdminCitizenEditable> {
    const citizen = await this.citizens.findById(citizenId);
    if (!citizen) {
      throw new AppError('NOT_FOUND', 'CITIZEN_NOT_FOUND', 'error.citizen.not_found');
    }
    return this.buildEditableCitizen(citizenId);
  }

  async patchCitizen(input: {
    citizenId: string;
    patch: {
      displayName?: string;
      portraitId?: string;
      mainLevel?: number;
      sympathy?: number;
      reputation?: number;
      happiness?: number;
    };
  }): Promise<AdminCitizenEditable> {
    const citizen = await this.citizens.findById(input.citizenId);
    if (!citizen) {
      throw new AppError('NOT_FOUND', 'CITIZEN_NOT_FOUND', 'error.citizen.not_found');
    }

    if (input.patch.displayName !== undefined) {
      const name = input.patch.displayName.trim();
      if (name.length < 2 || name.length > 64) {
        throw new AppError('VALIDATION', 'INVALID_DISPLAY_NAME', 'error.validation.display_name');
      }
      await this.citizens.updateDisplayName(input.citizenId, name);
    }

    if (input.patch.portraitId !== undefined) {
      if (!isValidCitizenPortraitId(input.patch.portraitId)) {
        throw new AppError('VALIDATION', 'INVALID_PORTRAIT_ID', 'error.validation.portrait_id');
      }
      await this.citizens.updatePortraitId(input.citizenId, input.patch.portraitId);
    }

    if (input.patch.mainLevel !== undefined) {
      if (!Number.isInteger(input.patch.mainLevel) || input.patch.mainLevel < 1 || input.patch.mainLevel > 20) {
        throw new AppError('VALIDATION', 'INVALID_MAIN_LEVEL', 'error.validation.main_level');
      }
      await this.citizens.updateMainLevel(
        input.citizenId,
        input.patch.mainLevel,
        resolveMainLevelId(input.patch.mainLevel),
      );
    }

    const personalPatch: Record<string, number> = {};
    for (const key of ['sympathy', 'reputation', 'happiness'] as const) {
      const value = input.patch[key];
      if (value !== undefined) {
        if (!Number.isInteger(value) || value < PERSONAL_VALUE_CLAMP_MIN || value > PERSONAL_VALUE_CLAMP_MAX) {
          throw new AppError('VALIDATION', 'INVALID_PERSONAL_VALUE', 'error.validation.personal_value');
        }
        personalPatch[key] = value;
      }
    }
    if (Object.keys(personalPatch).length > 0) {
      await this.citizens.setPersonalValues(input.citizenId, personalPatch);
    }

    return this.buildEditableCitizen(input.citizenId);
  }

  private async buildEditableCitizen(citizenId: string): Promise<AdminCitizenEditable> {
    const citizen = await this.citizens.findById(citizenId);
    if (!citizen) {
      throw new AppError('NOT_FOUND', 'CITIZEN_NOT_FOUND', 'error.citizen.not_found');
    }
    const progression = await this.citizens.getProgression(citizenId);
    const personalValues = await this.citizens.getPersonalValues(citizenId);
    return {
      citizenId: citizen.citizenId,
      displayName: citizen.displayName,
      gender: citizen.gender,
      age: citizen.age,
      portraitId: citizen.portraitId,
      mainLevel: progression?.mainLevel ?? 1,
      sympathy: personalValues.sympathy ?? 0,
      reputation: personalValues.reputation ?? 0,
      happiness: personalValues.happiness ?? 0,
    };
  }
}
