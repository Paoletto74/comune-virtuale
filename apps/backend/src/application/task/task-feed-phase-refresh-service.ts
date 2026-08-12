import { deriveGameDate, resolveDayNightPhase, type DayNightPhase } from '@comune-virtuale/shared';
import type { CitizenRepository, TaskRepository } from '../../domain/ports/repositories.js';
import type { WorldClockService } from '../../domain/time/world-clock-service.js';
import { isTaskCompatibleWithDayPhase } from './task-phase-metadata.js';
import type { TaskSelectionService } from './task-selection-service.js';

export class TaskFeedPhaseRefreshService {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly citizens: CitizenRepository,
    private readonly taskSelection: TaskSelectionService,
    private readonly worldClock: WorldClockService,
  ) {}

  async refreshIfPhaseChanged(
    citizenId: string,
    correlationId?: string,
  ): Promise<boolean> {
    const gameTime = await this.worldClock.now();
    const gameDate = deriveGameDate(Number(gameTime.worldTimeMs));
    const currentPhase = resolveDayNightPhase(gameDate);
    const lastPhase = await this.citizens.getLastTaskDayPhase(citizenId);

    if (lastPhase === currentPhase) {
      return false;
    }

    if (lastPhase === null) {
      await this.citizens.setLastTaskDayPhase(citizenId, currentPhase);
      return false;
    }

    await this.cancelIncompatiblePendingTasks(citizenId, currentPhase);
    await this.taskSelection.fillFeed({
      trigger: 'phase_changed',
      citizenId,
      dayPhase: currentPhase,
      previousDayPhase: lastPhase,
      correlationId,
    });
    await this.citizens.setLastTaskDayPhase(citizenId, currentPhase);
    return true;
  }

  private async cancelIncompatiblePendingTasks(
    citizenId: string,
    currentPhase: DayNightPhase,
  ): Promise<void> {
    const active = await this.tasks.findActiveByCitizenId(citizenId);
    const incompatiblePendingIds = active
      .filter(
        (instance) =>
          instance.status === 'pending' &&
          !isTaskCompatibleWithDayPhase(instance.definitionId, currentPhase),
      )
      .map((instance) => instance.taskInstanceId);

    if (incompatiblePendingIds.length === 0) {
      return;
    }

    await this.tasks.cancelPendingTasks(citizenId, incompatiblePendingIds);
  }
}
