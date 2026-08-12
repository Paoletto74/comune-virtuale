/** Official game logo — static, independent from time-phased opening backgrounds. */
export const OPENING_LOGO_URL = '/assets/logo/comune-virtuale-logo.png';

interface LoginOpeningLogoProps {
  className?: string;
}

export function LoginOpeningLogo({ className = 'loginEntranceLogo' }: LoginOpeningLogoProps) {
  return (
    <img
      src={OPENING_LOGO_URL}
      alt="Comune Virtuale"
      className={className}
      decoding="async"
    />
  );
}
