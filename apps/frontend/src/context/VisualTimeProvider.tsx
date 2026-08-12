import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  resolveVisualTimePhase,
  visualTimePhaseLabel,
  type VisualTimePhase,
} from '@comune-virtuale/shared';

export interface VisualTimeContextValue {
  phase: VisualTimePhase;
  label: string;
  now: Date;
}

const VisualTimeContext = createContext<VisualTimeContextValue | null>(null);

export function VisualTimeProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  const phase = useMemo(() => resolveVisualTimePhase(now), [now]);

  useEffect(() => {
    const sync = () => setNow(new Date());
    sync();
    const intervalId = window.setInterval(sync, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.visualTimePhase = phase;
  }, [phase]);

  const value = useMemo(
    () => ({
      phase,
      label: visualTimePhaseLabel(phase),
      now,
    }),
    [phase, now],
  );

  return <VisualTimeContext.Provider value={value}>{children}</VisualTimeContext.Provider>;
}

export function useVisualTimePhase(): VisualTimeContextValue {
  const context = useContext(VisualTimeContext);
  if (context) return context;

  const now = new Date();
  return {
    phase: resolveVisualTimePhase(now),
    label: visualTimePhaseLabel(resolveVisualTimePhase(now)),
    now,
  };
}
