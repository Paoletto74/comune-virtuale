import type { CareerView, GlobalProgressionView } from '@/utils/progressionView';

interface ProgressionCareerBlockProps {
  globalProgression: GlobalProgressionView;
  career: CareerView;
  progressPercent?: number | null;
  compact?: boolean;
}

export function ProgressionCareerBlock({
  globalProgression,
  career,
  progressPercent,
  compact = false,
}: ProgressionCareerBlockProps) {
  const careerLabel = career.currentCareerLabel ?? 'In esplorazione';
  const gradeLabel = career.currentGradeLabel ?? '—';
  const sortedAffinities = [...career.affinities].sort((a, b) => b.affinity - a.affinity);
  const alternativeAffinities = sortedAffinities.filter(
    (entry) => entry.careerId !== career.currentCareerId && entry.affinity > 0,
  );
  const pendingSwitchLabel = career.pendingSwitchCareerLabel;
  const pendingStreak = career.pendingSwitchStreak ?? 0;
  const pendingRequired = career.pendingSwitchRequired ?? career.switchRules.minSignificantActions;

  return (
    <div className={`progressionCareerBlock${compact ? ' progressionCareerBlock--compact' : ''}`}>
      <div className="progressionCareerRow">
        <span className="progressionCareerLabel">Livello globale</span>
        <span className="progressionCareerValue">
          LIVELLO {globalProgression.level} · {globalProgression.globalXp.toLocaleString('it-IT')} XP
        </span>
      </div>
      {progressPercent != null && (
        <div
          className="profileStatBar profileHeroProgressBar"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progressione verso il prossimo livello"
        >
          <div className="profileStatBarFill" style={{ width: `${progressPercent}%` }} />
        </div>
      )}
      <div className="progressionCareerRow">
        <span className="progressionCareerLabel">Carriera</span>
        <span className="progressionCareerValue">{careerLabel}</span>
      </div>
      <div className="progressionCareerRow">
        <span className="progressionCareerLabel">Grado</span>
        <span className="progressionCareerValue">{gradeLabel}</span>
      </div>
      {pendingSwitchLabel && pendingStreak > 0 && pendingStreak < pendingRequired && (
        <div className="progressionCareerRow progressionCareerRow--hint">
          <span className="progressionCareerLabel">Traiettoria in valutazione</span>
          <span className="progressionCareerValue">
            {pendingSwitchLabel} · {pendingStreak}/{pendingRequired} azioni
          </span>
        </div>
      )}
      {alternativeAffinities.length > 0 && (
        <div className="progressionCareerAffinities">
          <span className="progressionCareerLabel">Affinità</span>
          <ul className="progressionCareerAffinityList">
            {alternativeAffinities.map((entry) => (
              <li key={entry.careerId} className="progressionCareerAffinityItem">
                <span>{entry.label}</span>
                <span>{entry.affinity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
