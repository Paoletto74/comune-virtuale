import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AvatarPicker } from '@/components/visual/AvatarPicker';
import { ApiError, api } from '@/api/client';
import { resolveErrorMessage } from '@/utils/errorCopy';
import { randomUUID } from '@/api/uuid';
import { portraitIdFromSlot } from '@/utils/citizenPortrait';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Uomo' },
  { value: 'female', label: 'Donna' },
  { value: 'other', label: 'Altro' },
  { value: 'prefer_not_to_say', label: 'Preferisco non dire' },
];

const PERSONALITY_POOL = 90;
const STAT_MIN = 10;
const STAT_MAX = 50;

type StatKey = 'sympathy' | 'reputation' | 'happiness';

const STAT_LABELS: Record<StatKey, string> = {
  sympathy: 'Simpatia',
  reputation: 'Reputazione',
  happiness: 'Felicità',
};

function redistributePersonality(
  current: Record<StatKey, number>,
  changed: StatKey,
  nextValue: number,
): Record<StatKey, number> {
  const clamped = Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(nextValue)));
  const others = (Object.keys(current) as StatKey[]).filter((key) => key !== changed);
  let remaining = PERSONALITY_POOL - clamped;

  const next = { ...current, [changed]: clamped };
  const otherSum = others.reduce((sum, key) => sum + current[key], 0);

  if (otherSum <= 0) {
    const split = Math.floor(remaining / others.length);
    others.forEach((key, index) => {
      next[key] = index === others.length - 1 ? remaining : split;
      remaining -= next[key];
    });
    return next;
  }

  others.forEach((key, index) => {
    if (index === others.length - 1) {
      next[key] = Math.max(STAT_MIN, Math.min(STAT_MAX, remaining));
    } else {
      const share = Math.round((current[key] / otherSum) * (PERSONALITY_POOL - clamped));
      next[key] = Math.max(STAT_MIN, Math.min(STAT_MAX, share));
      remaining -= next[key];
    }
  });

  const total = next.sympathy + next.reputation + next.happiness;
  if (total !== PERSONALITY_POOL) {
    const adjustKey = others[others.length - 1]!;
    next[adjustKey] = Math.max(STAT_MIN, next[adjustKey] + (PERSONALITY_POOL - total));
  }

  return next;
}

export function CreateCitizenPage() {
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [age, setAge] = useState(25);
  const [personality, setPersonality] = useState<Record<StatKey, number>>({
    sympathy: 30,
    reputation: 30,
    happiness: 30,
  });
  const [portraitId, setPortraitId] = useState(portraitIdFromSlot(1));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.createCitizen(
        { displayName: displayName.trim(), gender, age, personality, portraitId },
        randomUUID(),
      );
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await queryClient.invalidateQueries({ queryKey: ['home'] });
      navigate('/home');
    } catch (err) {
      setError(
        err instanceof ApiError ? resolveErrorMessage(err.messageKey) : 'Errore creazione cittadino',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2 className="cardTitle">Creazione del cittadino</h2>
      <p className="muted">
        Costruisci punti di forza e debolezze. Il Comune userà tutto contro di te. Con affetto.
      </p>
      <form onSubmit={handleSubmit} className="form">
        <label className="label" htmlFor="displayName">
          Nome
        </label>
        <input
          id="displayName"
          className="input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          minLength={2}
          maxLength={64}
        />

        <label className="label" htmlFor="gender">
          Genere
        </label>
        <select
          id="gender"
          className="input"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label className="label" htmlFor="age">
          Età
        </label>
        <input
          id="age"
          className="input"
          type="number"
          min={18}
          max={120}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          required
        />

        <AvatarPicker
          selectedPortraitId={portraitId}
          onSelect={setPortraitId}
          title="Scegli il tuo profilo"
          description="Seleziona l'avatar che ti rappresenterà nel Comune."
        />

        <h3 className="cardTitle">Personalità</h3>
        <p className="personalityPoolHint">
          Distribuisci {PERSONALITY_POOL} punti. Aumentarne uno ne toglie agli altri.
        </p>
        <div className="personalityAllocator">
          {(Object.keys(personality) as StatKey[]).map((key) => (
            <div key={key} className="personalityStatRow">
              <div className="personalityStatHeader">
                <span>{STAT_LABELS[key]}</span>
                <span>{personality[key]}</span>
              </div>
              <input
                type="range"
                min={STAT_MIN}
                max={STAT_MAX}
                value={personality[key]}
                onChange={(e) =>
                  setPersonality((current) =>
                    redistributePersonality(current, key, Number(e.target.value)),
                  )
                }
                aria-label={STAT_LABELS[key]}
              />
            </div>
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="buttonPrimary" disabled={loading}>
          {loading ? 'Creazione…' : 'Entra nel Comune'}
        </button>
      </form>
    </section>
  );
}
