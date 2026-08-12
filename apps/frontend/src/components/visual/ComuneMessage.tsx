import type { ReactNode } from 'react';

interface ComuneMessageProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'editorial' | 'flash';
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
}

function ComuneSeal() {
  return (
    <svg
      className="comuneSeal"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16 8 L20 14 L16 20 L12 14 Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function ComuneMessage({
  title,
  children,
  footer,
  variant = 'default',
  onDismiss,
  dismissLabel = 'Chiudi',
  className = '',
}: ComuneMessageProps) {
  return (
    <section
      className={`comuneMessage comuneMessage--${variant} ${className}`.trim()}
      aria-label="Comunicazione del Comune Virtuale"
    >
      <div className="comuneMessageHeader">
        <div className="comuneMessageBrand">
          <ComuneSeal />
          <span className="comuneMessageBadge">Comune</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            className="comuneMessageDismiss"
            onClick={onDismiss}
            aria-label={dismissLabel}
          >
            ×
          </button>
        )}
      </div>
      {title && <h2 className="comuneMessageTitle">{title}</h2>}
      <div className="comuneMessageBody">{children}</div>
      {footer && <div className="comuneMessageFooter">{footer}</div>}
    </section>
  );
}
