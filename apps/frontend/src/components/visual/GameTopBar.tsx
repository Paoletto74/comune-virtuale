import { DayNightSelector } from '@/components/visual/DayNightSelector';
import { CitizenIllustration } from '@/components/visual/CitizenIllustration';

interface GameTopBarProps {
  gameDate: {
    day: number;
    hour: number;
    minute: number;
    second?: number;
    label?: string;
  };
  citizenId?: string;
  displayName: string;
  level: number;
  cashDisplay: string;
  sympathy: number;
  age?: number;
  occupation?: string;
}

function StatChip({
  icon,
  value,
  label,
}: {
  icon: 'level' | 'cash' | 'sympathy';
  value: string;
  label: string;
}) {
  return (
    <div className={statClassName(icon)} aria-label={`${label}: ${value}`}>
      {icon === 'level' && (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="gameTopBarStatIcon">
          <path d="M8 2 L10 6 L14 6.5 L11 9.5 L11.8 14 L8 12 L4.2 14 L5 9.5 L2 6.5 L6 6 Z" fill="currentColor" />
        </svg>
      )}
      {icon === 'cash' && (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="gameTopBarStatIcon">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25" />
          <path d="M8 5 V11 M6 8 H10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      )}
      {icon === 'sympathy' && (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="gameTopBarStatIcon">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="6" cy="7" r="0.75" fill="currentColor" />
          <circle cx="10" cy="7" r="0.75" fill="currentColor" />
          <path d="M6 10 Q8 12 10 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" />
        </svg>
      )}
      <span className="gameTopBarStatValue">{value}</span>
    </div>
  );
}

function statClassName(icon: 'level' | 'cash' | 'sympathy') {
  return `gameTopBarStat gameTopBarStat--${icon}`;
}

export function GameTopBar({
  gameDate,
  citizenId,
  displayName,
  level,
  cashDisplay,
  sympathy,
  age,
  occupation,
}: GameTopBarProps) {
  return (
    <header className="gameTopBar">
      <div className="gameTopBarInner">
        <div className="gameTopBarBrand">
          <div className="gameTopBarLogo" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#ffb800" strokeWidth="1.5" />
              <path d="M16 8 L20 14 L16 20 L12 14 Z" stroke="#ffb800" strokeWidth="1.25" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="gameTopBarBrandText">
            <h1 className="gameTopBarTitle">Comune Virtuale</h1>
            <p className="gameTopBarTagline">Il Comune osserva. Sempre.</p>
          </div>
        </div>

        <div className="gameTopBarPhase">
          <DayNightSelector gameDate={gameDate} />
        </div>

        <div className="gameTopBarPlayer">
          <div className="gameTopBarAvatar">
            <CitizenIllustration citizenId={citizenId} age={age} occupation={occupation} size="sm" />
          </div>
          <div className="gameTopBarPlayerMeta">
            <span className="gameTopBarPlayerName">{displayName}</span>
            <div className="gameTopBarStats">
              <StatChip icon="level" value={`LVL ${level}`} label="Livello" />
              <StatChip icon="cash" value={cashDisplay} label="Saldo" />
              <StatChip icon="sympathy" value={String(sympathy)} label="Simpatia" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
