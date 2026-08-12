import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, api, type CompleteTaskResponse } from '@/api/client';
import { randomUUID } from '@/api/uuid';
import { TaskIllustration } from '@/components/visual/TaskIllustration';
import { useHome } from '@/hooks/useSession';
import { resolveErrorMessage } from '@/utils/errorCopy';
import { formatEuro } from '@/utils/formatCash';
import {
  buildFeedGameplayHints,
  feedCardClassName,
  isRiskyOption,
  resolveFeedTaskTheme,
  type FeedTask,
} from '@/utils/feedTaskTheme';
import { feedCategoryToIllustrationKind } from '@/utils/taskIllustrationKind';
import {
  buildTaskOutcome,
  type TaskOutcomeDisplay,
} from '@/utils/taskOutcomeCopy';

const MAX_CONCURRENT_STANDARD = 3;
const EMPTY_FEED_TASKS: FeedTask[] = [];

function isDialogueTask(taskKind?: string): boolean {
  return taskKind === 'dialogue_step' || taskKind === 'dialogue_terminal';
}

function isStandardTask(task: FeedTask): boolean {
  return task.taskKind === 'standard' || !task.taskKind;
}

function isTaskDue(task: FeedTask): boolean {
  if (!task.readyAt) return false;
  const readyMs = Date.parse(task.readyAt);
  return Number.isFinite(readyMs) && Date.now() >= readyMs;
}

function shouldAutoFinalizeTask(task: FeedTask): boolean {
  return (
    isStandardTask(task) &&
    !!task.pendingOptionId &&
    (task.feedState === 'in_progress' || task.feedState === 'ready') &&
    isTaskDue(task)
  );
}

function formatRemaining(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function useTaskTimer(readyAt?: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!readyAt) return;
    const readyMs = Date.parse(readyAt);
    if (!Number.isFinite(readyMs) || Date.now() >= readyMs) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [readyAt]);

  const readyMs = readyAt ? Date.parse(readyAt) : 0;
  const remainingMs =
    !readyAt || !Number.isFinite(readyMs) || now >= readyMs ? 0 : Math.max(0, readyMs - now);

  return { now, remainingMs };
}

import {
  formatStatEffectLabel,
  PERSONAL_VALUE_KEYS,
  PERSONAL_VALUE_LABELS,
  type PersonalValueKey,
  type StatEffectsPreview,
} from '@/utils/personalValues';

function TaskOptionAttributePreview({
  options,
}: {
  options: FeedTask['options'];
}) {
  const previews = options
    .map((option) => ({ option, preview: option.attributePreview }))
    .filter((entry) => entry.preview != null);

  if (previews.length === 0) return null;

  return (
    <ul className="taskAttributePreview" aria-label="Attributi">
      <li className="taskAttributePreviewHeading">Attributi</li>
      {previews.map(({ option, preview }) => {
        const keys = new Set([
          ...Object.keys(preview!.required ?? {}),
          ...Object.keys(preview!.costs ?? {}),
          ...Object.keys(preview!.preview ?? {}),
        ]);

        return (
          <li key={option.optionId} className="taskAttributePreviewGroup">
            <span className="taskAttributePreviewOption">{option.label}</span>
            {[...keys].map((key) => {
              const label = PERSONAL_VALUE_LABELS[key as PersonalValueKey] ?? key;
              const required = preview!.required?.[key];
              const cost = preview!.costs?.[key];
              const before = preview!.preview?.[key]?.before;
              const after = preview!.preview?.[key]?.after;
              const insufficient =
                (required != null && before != null && before < required) ||
                (cost != null && before != null && before < cost);

              return (
                <div key={key} className="taskAttributePreviewRow">
                  <span className="taskAttributePreviewKey">{label}</span>
                  {required != null && (
                    <span
                      className={`taskAttributePreviewRequired${insufficient ? ' taskAttributePreviewRequired--fail' : ''}`}
                    >
                      Richiesto: {required}
                    </span>
                  )}
                  {cost != null && (
                    <span
                      className={`taskAttributePreviewCost${insufficient ? ' taskAttributePreviewRequired--fail' : ''}`}
                    >
                      Consumo: {cost}
                    </span>
                  )}
                  {before != null && (
                    <span className="taskAttributePreviewAvailable">Disponibile: {before}</span>
                  )}
                  {after != null && (
                    <span className="taskAttributePreviewAfter">Dopo il task: {after}</span>
                  )}
                </div>
              );
            })}
          </li>
        );
      })}
    </ul>
  );
}

function TaskOptionStatPreview({
  options,
}: {
  options: FeedTask['options'];
}) {
  const previews = options
    .map((option) => ({ option, effects: option.statEffects as StatEffectsPreview | undefined }))
    .filter((entry) => entry.effects != null);

  if (previews.length === 0) return null;

  return (
    <ul className="taskStatEffects" aria-label="Effetti previsti">
      <li className="taskStatEffectsHeading">Effetti</li>
      {previews.map(({ option, effects }) => (
        <li key={option.optionId} className="taskStatEffectGroup">
          <span className="taskStatEffectOption">{option.label}:</span>
          {PERSONAL_VALUE_KEYS.map((key) => {
            const value = effects![key as PersonalValueKey];
            if (value == null || value === 0) return null;
            return (
              <span
                key={key}
                className={`taskStatEffect ${value >= 0 ? 'taskStatEffect--pos' : 'taskStatEffect--neg'}`}
              >
                {formatStatEffectLabel(key, value)}
              </span>
            );
          })}
          {effects!.cashMinor != null && Number(effects!.cashMinor) !== 0 && (
            <span className={`taskStatEffect ${Number(effects!.cashMinor) >= 0 ? 'taskStatEffect--pos' : 'taskStatEffect--neg'}`}>
              {Number(effects!.cashMinor) >= 0 ? '+' : ''}
              {formatEuro(effects!.cashMinor)} Denaro
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function feedStatusLabel(task: FeedTask): string {
  if (task.feedState === 'available') return 'Disponibile';
  if (task.feedState === 'interactive') return 'In situazione';
  if (task.feedState === 'in_progress') return 'In attesa';
  return 'Conversazione';
}

function feedStatusClass(task: FeedTask): string {
  if (task.feedState === 'in_progress') return 'feedStatus feedStatus--waiting';
  if (task.feedState === 'interactive') return 'feedStatus feedStatus--interactive';
  if (task.feedState === 'available') return 'feedStatus feedStatus--available';
  return 'feedStatus feedStatus--dialogue';
}

function countsAsRunningStandard(task: FeedTask): boolean {
  return (
    isStandardTask(task) &&
    (task.feedState === 'interactive' || task.feedState === 'in_progress')
  );
}

function TaskFeedCard({
  task,
  runningStandardCount,
  onStart,
  onChoose,
  starting,
  acting,
  finalizing,
  inlineOutcome,
}: {
  task: FeedTask;
  runningStandardCount: number;
  onStart: (taskInstanceId: string) => void;
  onChoose: (taskInstanceId: string, optionId: string) => void;
  starting: string | null;
  acting: string | null;
  finalizing: string | null;
  inlineOutcome?: TaskOutcomeDisplay | null;
}) {
  const theme = resolveFeedTaskTheme(task);
  const gameplayHints = buildFeedGameplayHints(task);
  const isStandard = isStandardTask(task);
  const isDialogue = isDialogueTask(task.taskKind);
  const { remainingMs } = useTaskTimer(isStandard ? task.readyAt : undefined);
  const slotsFull = runningStandardCount >= MAX_CONCURRENT_STANDARD;
  const canStart = isStandard && task.feedState === 'available' && !slotsFull;
  const isFinalizing = finalizing === task.taskInstanceId;

  return (
    <article
      className={`${feedCardClassName(theme, task.feedState)}${isDialogue ? ' dialogueCard' : ''}${inlineOutcome ? ' feedCard--completed' : ''}`}
      aria-label={task.title}
    >
      <div className="feedCardTop">
        <div className="feedCardMeta">
          <TaskIllustration
            kind={feedCategoryToIllustrationKind(theme.category)}
            size="sm"
          />
          <span className="feedCategory">{theme.categoryLabel}</span>
        </div>
        <span className={feedStatusClass(task)}>{feedStatusLabel(task)}</span>
      </div>

      <h2 className="feedCardTitle">{task.title}</h2>
      {task.npc?.recognitionLine && (
        <p className="feedNpcRecognition">{task.npc.recognitionLine}</p>
      )}
      <p className="feedCardDescription">{task.description}</p>
      {task.npc?.memoryLine && <p className="feedNpcMemory">{task.npc.memoryLine}</p>}

      {task.npc?.consequenceLine && <p className="feedNpcConsequence">{task.npc.consequenceLine}</p>}

      {task.npc?.toneLine && <p className="feedNpcTone">{task.npc.toneLine}</p>}

      {gameplayHints.length > 0 && (
        <ul className="feedHintList" aria-label="Indizi di gameplay">
          {gameplayHints.map((hint) => (
            <li key={hint.key} className={`feedHint feedHint--${hint.key}`}>
              {hint.label}
            </li>
          ))}
        </ul>
      )}

      <div className="feedCardFooter">
        {inlineOutcome && (
          <div className="feedCompletionMessage" aria-live="polite">
            <strong>Task completato.</strong>
            <p className="feedCompletionEffects">{inlineOutcome.summary}</p>
          </div>
        )}

        {!inlineOutcome && isStandard && task.feedState === 'in_progress' && (
          <>
            <div className="feedCardStatusRow">
              <span className="feedCardStatusLabel">
                {isFinalizing ? 'Completamento in corso…' : 'Attesa dopo la scelta'}
              </span>
              {!isFinalizing && <span className="feedTimer">{formatRemaining(remainingMs)}</span>}
            </div>
            {task.pendingOptionLabel && (
              <p className="feedPendingChoice">Hai scelto: {task.pendingOptionLabel}</p>
            )}
          </>
        )}

        {!inlineOutcome && isStandard && task.feedState === 'available' && (
          <>
            {task.productRequirement && !task.productRequirement.satisfied && (
              <p className="feedProductRequirement" aria-live="polite">
                Richiede: {task.productRequirement.label}
                <span className="feedProductRequirementStatus">
                  {' '}
                  · {task.productRequirement.detail}
                </span>
              </p>
            )}
            <div className="feedActions">
              <button
                type="button"
                className="feedButton feedButtonPrimary"
                disabled={
                  !canStart ||
                  starting === task.taskInstanceId ||
                  (task.productRequirement != null && !task.productRequirement.satisfied)
                }
                onClick={() => onStart(task.taskInstanceId)}
              >
                {starting === task.taskInstanceId
                  ? '…'
                  : slotsFull
                    ? 'Slot occupati (max 3)'
                    : task.productRequirement && !task.productRequirement.satisfied
                      ? 'Requisito mancante'
                      : 'Avvia'}
              </button>
            </div>
          </>
        )}

        {!inlineOutcome && isStandard && task.feedState === 'interactive' && (
          <>
            <TaskOptionAttributePreview options={task.options} />
            <TaskOptionStatPreview options={task.options} />
            <div className="feedOptionList">
            {task.options.map((opt) => (
              <button
                key={opt.optionId}
                type="button"
                className={`feedButton feedButtonOption${
                  isRiskyOption(opt.optionId) ? ' feedButtonOption--risk' : ''
                }`}
                disabled={acting === task.taskInstanceId}
                onClick={() => onChoose(task.taskInstanceId, opt.optionId)}
              >
                {acting === task.taskInstanceId ? '…' : opt.label}
              </button>
            ))}
            </div>
          </>
        )}

        {!inlineOutcome && isDialogue && (
          <div className="feedOptionList">
            {task.options.map((opt) => (
              <button
                key={opt.optionId}
                type="button"
                className={`feedButton feedButtonOption${
                  opt.presentationHint === 'dialogue_line' ? ' feedButtonOption--dialogue' : ''
                }`}
                disabled={acting === task.taskInstanceId}
                onClick={() => onChoose(task.taskInstanceId, opt.optionId)}
              >
                {acting === task.taskInstanceId ? '…' : opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function TaskFeedPanel() {
  const { data: home, isLoading, error, refetch } = useHome(true);
  const [inlineOutcomes, setInlineOutcomes] = useState<Record<string, TaskOutcomeDisplay>>({});
  const [slotOrder, setSlotOrder] = useState<string[]>([]);
  const [starting, setStarting] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [timerTick, setTimerTick] = useState(() => Date.now());
  const [dismissedTaskIds, setDismissedTaskIds] = useState<Set<string>>(() => new Set());
  const finalizedRef = useRef(new Set<string>());

  const feedTasks = home?.activeTasks ?? EMPTY_FEED_TASKS;
  const runningStandardCount = feedTasks.filter(countsAsRunningStandard).length;

  useEffect(() => {
    const currentIds = feedTasks.map((task) => task.taskInstanceId);
    setSlotOrder((prev) => {
      const preserved = prev.filter((id) => currentIds.includes(id) || inlineOutcomes[id]);
      const appended = currentIds.filter((id) => !preserved.includes(id));
      return [...preserved, ...appended].slice(0, 7);
    });
  }, [feedTasks, inlineOutcomes]);

  useEffect(() => {
    const activeIds = new Set(feedTasks.map((task) => task.taskInstanceId));
    setDismissedTaskIds((prev) => {
      const next = new Set([...prev].filter((id) => activeIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [feedTasks]);

  const orderedTasks = useMemo(() => {
    const byId = new Map(feedTasks.map((task) => [task.taskInstanceId, task]));
    return slotOrder
      .map((id) => byId.get(id))
      .filter(
        (task): task is FeedTask =>
          task != null && !dismissedTaskIds.has(task.taskInstanceId),
      );
  }, [feedTasks, slotOrder, dismissedTaskIds]);

  const showCompletion = useCallback((taskInstanceId: string, outcome: TaskOutcomeDisplay) => {
    setInlineOutcomes((current) => ({ ...current, [taskInstanceId]: outcome }));
    window.setTimeout(() => {
      setInlineOutcomes((current) => {
        const next = { ...current };
        delete next[taskInstanceId];
        return next;
      });
    }, 4000);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setTimerTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const autoFinalizeTask = useCallback(
    async (task: FeedTask) => {
      if (!task.pendingOptionId || finalizedRef.current.has(task.taskInstanceId)) {
        return;
      }

      setDismissedTaskIds((prev) => new Set(prev).add(task.taskInstanceId));
      finalizedRef.current.add(task.taskInstanceId);
      setFinalizing(task.taskInstanceId);
      setActionError(null);

      try {
        const result: CompleteTaskResponse = await api.completeTask(
          task.taskInstanceId,
          task.pendingOptionId,
          `auto-finalize-${task.taskInstanceId}`,
        );

        if (!result.taskWaiting && result.status === 'completed') {
          showCompletion(task.taskInstanceId, buildTaskOutcome(result));
        }

        await refetch();
      } catch (err) {
        if (err instanceof ApiError && err.messageKey === 'error.task.already_completed') {
          await refetch();
          return;
        }
        finalizedRef.current.delete(task.taskInstanceId);
        setDismissedTaskIds((prev) => {
          const next = new Set(prev);
          next.delete(task.taskInstanceId);
          return next;
        });
        setActionError(
          err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Errore completamento task',
        );
      } finally {
        setFinalizing(null);
      }
    },
    [refetch, showCompletion],
  );

  useEffect(() => {
    void timerTick;

    for (const task of feedTasks) {
      if (!shouldAutoFinalizeTask(task)) continue;
      if (finalizedRef.current.has(task.taskInstanceId)) continue;
      void autoFinalizeTask(task);
    }
  }, [feedTasks, timerTick, autoFinalizeTask]);

  async function handleStartTask(taskInstanceId: string) {
    setStarting(taskInstanceId);
    setActionError(null);
    try {
      await api.startTask(taskInstanceId, randomUUID());
      await refetch();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Errore avvio attività',
      );
    } finally {
      setStarting(null);
    }
  }

  async function handleChooseOption(taskInstanceId: string, optionId: string) {
    setActing(taskInstanceId);
    setActionError(null);
    try {
      const result: CompleteTaskResponse = await api.completeTask(
        taskInstanceId,
        optionId,
        randomUUID(),
      );

      if (result.dialogueContinued) {
        /* dialogue continues in place */
      } else if (result.taskWaiting) {
        if (result.readyAt && isTaskDue({ readyAt: result.readyAt } as FeedTask)) {
          const task = feedTasks.find((entry) => entry.taskInstanceId === taskInstanceId);
          if (task) {
            void autoFinalizeTask({ ...task, readyAt: result.readyAt, pendingOptionId: optionId });
          }
        }
      } else {
        showCompletion(taskInstanceId, buildTaskOutcome(result));
      }

      await refetch();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Errore scelta attività',
      );
    } finally {
      setActing(null);
    }
  }

  if (isLoading) {
    return <p className="loading">Caricamento attività…</p>;
  }

  if (error || !home) {
    return <p className="error">Impossibile caricare le attività.</p>;
  }

  return (
    <>
      <section className="feedSection" aria-label="Feed attività">
        <h2 className="feedSectionTitle">I tuoi incarichi</h2>

        {orderedTasks.length === 0 ? (
          <p className="emptyState">Nessuna attività in corso.</p>
        ) : (
          <div className="feedList taskFeedList">
            {orderedTasks.map((task) => (
              <TaskFeedCard
                key={task.taskInstanceId}
                task={task}
                runningStandardCount={runningStandardCount}
                onStart={handleStartTask}
                onChoose={handleChooseOption}
                starting={starting}
                acting={acting}
                finalizing={finalizing}
                inlineOutcome={inlineOutcomes[task.taskInstanceId] ?? null}
              />
            ))}
          </div>
        )}
      </section>

      {actionError && <p className="error">{actionError}</p>}
    </>
  );
}
