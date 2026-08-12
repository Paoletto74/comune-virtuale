import {
  PERSONAL_VALUE_KEYS,
  PERSONAL_VALUE_LABELS,
  personalValuesFromPartial,
  type PersonalValueKey,
} from '@/utils/personalValues';
import {
  personalValueFillPercent,
  PERSONAL_VALUE_MAX,
  PERSONAL_VALUE_MIN,
} from '@/utils/personalValueRange';

interface ProfilePersonalValuesAsideProps {
  personalValues: Partial<Record<PersonalValueKey, number>> | undefined;
}

export function ProfilePersonalValuesAside({ personalValues }: ProfilePersonalValuesAsideProps) {
  const values = personalValuesFromPartial(personalValues);

  return (
    <div className="profileHeroValues" aria-label="Livelli personali">
      {PERSONAL_VALUE_KEYS.map((key) => {
        const value = values[key];
        return (
          <div key={key} className="profileHeroValueRow">
            <div className="profileHeroValueHeader">
              <span className="profileHeroValueLabel">{PERSONAL_VALUE_LABELS[key]}</span>
              <span className="profileHeroValueAmount">{value}</span>
            </div>
            <div
              className="profileHeroValueBar"
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={PERSONAL_VALUE_MIN}
              aria-valuemax={PERSONAL_VALUE_MAX}
              aria-label={PERSONAL_VALUE_LABELS[key]}
            >
              <div
                className="profileHeroValueBarFill"
                style={{ width: `${personalValueFillPercent(value)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
