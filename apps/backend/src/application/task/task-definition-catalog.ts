export type PresentationHint = 'action' | 'dialogue_line' | 'accept' | 'reject' | 'decision';

export type TaskKind = 'standard' | 'dialogue_step' | 'dialogue_terminal';

export interface TaskOptionDefinition {
  optionId: string;
  label: string;
  presentationHint?: PresentationHint;
}

export interface TaskDefinition {
  definitionId: string;
  title: string;
  description: string;
  options: readonly TaskOptionDefinition[];
  taskKind?: TaskKind;
}

function optionIds(definition: TaskDefinition): readonly string[] {
  return definition.options.map((option) => option.optionId);
}

export class TaskDefinitionCatalog {
  private readonly definitions = new Map<string, TaskDefinition>();

  register(definition: TaskDefinition): void {
    this.definitions.set(definition.definitionId, definition);
  }

  get(definitionId: string): TaskDefinition | null {
    return this.definitions.get(definitionId) ?? null;
  }

  isSupported(definitionId: string): boolean {
    return this.definitions.has(definitionId);
  }

  isAllowedOption(definitionId: string, optionId: string): boolean {
    const definition = this.definitions.get(definitionId);
    if (!definition) return false;
    return optionIds(definition).includes(optionId);
  }

  getOption(definitionId: string, optionId: string): TaskOptionDefinition | null {
    const definition = this.definitions.get(definitionId);
    if (!definition) return null;
    return definition.options.find((option) => option.optionId === optionId) ?? null;
  }
}

export const defaultTaskDefinitionCatalog = new TaskDefinitionCatalog();
