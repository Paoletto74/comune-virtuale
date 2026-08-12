export function FlashBoltIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`flashBoltIcon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 2 L4 14 H11 L10 22 L20 10 H13 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
