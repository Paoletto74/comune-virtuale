import type { ReactNode } from 'react';

export interface SectionSwitchOption<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface SectionSwitchProps<T extends string> {
  options: SectionSwitchOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function SectionSwitch<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SectionSwitchProps<T>) {
  return (
    <div className="sectionSwitch" role="tablist" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            id={`section-tab-${option.id}`}
            aria-selected={selected}
            aria-controls={`section-panel-${option.id}`}
            className={`sectionSwitchTab${selected ? ' sectionSwitchTab--active' : ''}`}
            onClick={() => onChange(option.id)}
          >
            {option.icon ? <span className="sectionSwitchIcon">{option.icon}</span> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SectionPanel({
  id,
  labelledBy,
  children,
}: {
  id: string;
  labelledBy: string;
  children: ReactNode;
}) {
  return (
    <div
      className="sectionPanel"
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
    >
      {children}
    </div>
  );
}
