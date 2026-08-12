import type { AssetAspect } from './asset-types.js';

/** Official MEGA 4/4 aspect formats — one native ratio per asset, no forced crop. */
export const OFFICIAL_ASPECT_RATIOS = ['1:1', '2:1', '3:1', '4:1', '4:5', '9:16'] as const;

/** CSS `aspect-ratio` value for each format. */
export const ASPECT_RATIO_CSS: Record<AssetAspect, string> = {
  '1:1': '1 / 1',
  '2:1': '2 / 1',
  '3:1': '3 / 1',
  '4:1': '4 / 1',
  '4:5': '4 / 5',
  '9:16': '9 / 16',
};

/** Recommended export size @2x mobile — produce natively at this ratio. */
export const ASPECT_RECOMMENDED_PX: Record<AssetAspect, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '2:1': { width: 1200, height: 600 },
  '3:1': { width: 1200, height: 400 },
  '4:1': { width: 1600, height: 400 },
  '4:5': { width: 800, height: 1000 },
  '9:16': { width: 1080, height: 1920 },
};

export function aspectToCssRatio(aspect: AssetAspect): string {
  return ASPECT_RATIO_CSS[aspect];
}

export function isOfficialAspect(value: string): value is AssetAspect {
  return (OFFICIAL_ASPECT_RATIOS as readonly string[]).includes(value);
}
