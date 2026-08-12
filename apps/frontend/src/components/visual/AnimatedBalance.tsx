import { useEffect, useMemo, useRef, useState } from 'react';
import { formatEuro } from '@/utils/formatCash';

let lastSeenBalanceMinor: string | null = null;

export function resetAnimatedBalanceTracking(): void {
  lastSeenBalanceMinor = null;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

type BalanceToken =
  | { kind: 'static'; value: string; key: string }
  | { kind: 'digit'; value: string; key: string; index: number };

function tokenizeFormattedBalance(formatted: string): BalanceToken[] {
  const tokens: BalanceToken[] = [];
  let digitIndex = 0;

  for (let i = 0; i < formatted.length; i += 1) {
    const char = formatted[i]!;
    if (char >= '0' && char <= '9') {
      tokens.push({ kind: 'digit', value: char, key: `d-${digitIndex}`, index: digitIndex });
      digitIndex += 1;
    } else {
      tokens.push({ kind: 'static', value: char, key: `s-${i}-${char}` });
    }
  }

  return tokens;
}

function DigitRoll({
  from,
  to,
  animate,
}: {
  from: string;
  to: string;
  animate: boolean;
}) {
  const [display, setDisplay] = useState(to);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate || from === to) {
      setDisplay(to);
      return;
    }

    const fromDigit = Number.parseInt(from, 10);
    const toDigit = Number.parseInt(to, 10);
    const distance = (toDigit - fromDigit + 10) % 10;
    const steps = distance === 0 ? 10 : distance;
    const durationMs = Math.min(1100, 400 + steps * 120);
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      const step = Math.min(steps, Math.floor(eased * steps));
      const current = (fromDigit + step) % 10;
      setDisplay(String(current));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, [animate, from, to]);

  return <span className="animatedBalanceDigit">{display}</span>;
}

export interface AnimatedBalanceProps {
  amountMinor: string;
  className?: string;
  'aria-label'?: string;
}

export function AnimatedBalance({ amountMinor, className, 'aria-label': ariaLabel }: AnimatedBalanceProps) {
  const reducedMotion = usePrefersReducedMotion();
  const formatted = formatEuro(amountMinor);
  const prevMinorRef = useRef<string | null>(lastSeenBalanceMinor);
  const shouldAnimate =
    prevMinorRef.current != null &&
    prevMinorRef.current !== amountMinor &&
    !reducedMotion;

  const fromFormatted = prevMinorRef.current != null ? formatEuro(prevMinorRef.current) : formatted;
  const toTokens = useMemo(() => tokenizeFormattedBalance(formatted), [formatted]);
  const fromTokens = useMemo(() => tokenizeFormattedBalance(fromFormatted), [fromFormatted]);

  useEffect(() => {
    lastSeenBalanceMinor = amountMinor;
    prevMinorRef.current = amountMinor;
  }, [amountMinor]);

  return (
    <span
      className={`animatedBalance${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel ?? `Saldo: ${formatted}`}
    >
      {toTokens.map((token) => {
        if (token.kind === 'static') {
          return (
            <span key={token.key} className="animatedBalanceStatic" aria-hidden="true">
              {token.value}
            </span>
          );
        }

        const fromDigit = fromTokens.find((entry) => entry.kind === 'digit' && entry.index === token.index);
        const fromValue = fromDigit?.kind === 'digit' ? fromDigit.value : token.value;

        return (
          <span key={token.key} className="animatedBalanceDigitWrap" aria-hidden="true">
            <DigitRoll from={fromValue} to={token.value} animate={shouldAnimate} />
          </span>
        );
      })}
    </span>
  );
}
