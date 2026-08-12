import type { ReactNode } from 'react';
import { useHome } from '@/hooks/useSession';
import { useWorkJobs } from '@/hooks/useGameApi';
import { FlashAnticipationBar } from '@/components/FlashOpportunityPanel';
import { GAME_SURFACE_WORK_SHIFT_DURATION_MS } from '@/utils/workShiftConstants';

function countRunningStandardTasks(
  tasks: Array<{ taskKind?: string; feedState?: string }> | undefined,
): number {
  if (!tasks) return 0;
  return tasks.filter(
    (task) =>
      (task.taskKind === 'standard' || !task.taskKind) &&
      (task.feedState === 'interactive' || task.feedState === 'in_progress'),
  ).length;
}

function BottomGameBarRow({
  label,
  children,
  modifier,
}: {
  label: string;
  children: ReactNode;
  modifier?: 'task' | 'flash' | 'shift';
}) {
  return (
    <div
      className={`bottomGameBarRow${modifier ? ` bottomGameBarRow--${modifier}` : ''}`}
      aria-label={label}
    >
      <span className="bottomGameBarLabel">{label}</span>
      <div className="bottomGameBarTrack">{children}</div>
    </div>
  );
}

export function HomeProgressBars() {
  const { data: home } = useHome(true);
  const { data: work } = useWorkJobs();

  const activeShift = work?.offers.find((offer) => offer.engagementStatus === 'shift_active');
  const flashAnticipation = home?.flash?.anticipation;
  const showFlash = flashAnticipation?.active;
  const showShift = Boolean(activeShift);
  const runningTasks = countRunningStandardTasks(home?.activeTasks);
  const showTaskBar = runningTasks > 0;
  const taskProgress = runningTasks / 3;

  if (!showFlash && !showShift && !showTaskBar) return null;

  const shiftTotalMs = GAME_SURFACE_WORK_SHIFT_DURATION_MS;
  const shiftRemainingMs = activeShift?.remainingShiftMs ?? 0;
  const shiftElapsedMs = Math.max(0, shiftTotalMs - shiftRemainingMs);
  const shiftProgress = shiftTotalMs > 0 ? shiftElapsedMs / shiftTotalMs : 0;

  return (
    <div className="bottomGameBars" aria-label="Indicatori attività, turno e opportunità">
      {showTaskBar && (
        <BottomGameBarRow label="Task" modifier="task">
          <div className="taskProgressTrack" aria-hidden="true">
            <div
              className="taskProgressFill"
              style={{ transform: `scaleX(${taskProgress})` }}
            />
          </div>
        </BottomGameBarRow>
      )}
      {showFlash && flashAnticipation && (
        <BottomGameBarRow label="Occasione" modifier="flash">
          <FlashAnticipationBar anticipation={flashAnticipation} trackOnly />
        </BottomGameBarRow>
      )}
      {showShift && (
        <BottomGameBarRow label="Turno" modifier="shift">
          <div className="shiftProgressTrack shiftProgressTrack--work" aria-hidden="true">
            <div
              className="shiftProgressFill shiftProgressFill--work"
              style={{ transform: `scaleX(${shiftProgress})` }}
            />
          </div>
        </BottomGameBarRow>
      )}
    </div>
  );
}
