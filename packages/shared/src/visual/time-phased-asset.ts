import { ASSET_CATEGORY_DIRS } from './asset-catalog.js';
import type { AssetCategory } from './asset-types.js';
import type { VisualTimePhase } from './visual-time-phase.js';
import { VISUAL_TIME_PHASES } from './visual-time-phase.js';

function stripExtension(filename: string): string {
  return filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
}

/** Phase variant filename: `marketplace-hero.sunset.webp` */
export function phaseVariantFilename(baseFilename: string, phase: VisualTimePhase): string {
  const base = stripExtension(baseFilename);
  return `${base}.${phase}.webp`;
}

export function phaseVariantUrl(
  category: AssetCategory,
  baseFilename: string,
  phase: VisualTimePhase,
): string {
  return `${ASSET_CATEGORY_DIRS[category]}/${phaseVariantFilename(baseFilename, phase)}`;
}

export function allPhaseVariantUrls(
  category: AssetCategory,
  baseFilename: string,
): string[] {
  return VISUAL_TIME_PHASES.map((phase) => phaseVariantUrl(category, baseFilename, phase));
}

/** Opening/login full-screen backgrounds — `home-{phase}.webp` at 9:16. */
export function openingBackgroundFilename(phase: VisualTimePhase): string {
  return `home-${phase}.webp`;
}

export function resolveOpeningBackgroundUrl(phase: VisualTimePhase): string {
  return `${ASSET_CATEGORY_DIRS.hero}/${openingBackgroundFilename(phase)}`;
}
