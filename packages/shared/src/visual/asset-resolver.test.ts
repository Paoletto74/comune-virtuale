import { describe, expect, it } from 'vitest';
import { ASSET_CATALOG, CHARACTER_LIBRARY_SLOT_COUNT } from './asset-catalog.js';
import {
  allCandidateUrls,
  resolveCharacterPortraitAsset,
  resolveSemanticImageKey,
  resolveAssetKey,
} from './asset-resolver.js';
import { resolveOpeningBackgroundUrl } from './time-phased-asset.js';

describe('asset-resolver', () => {
  it('builds unified character catalog slots', () => {
    const profiles = ASSET_CATALOG.filter((e) => e.assetKey.startsWith('characters:profile_'));
    const npcs = ASSET_CATALOG.filter((e) => e.assetKey.startsWith('characters:npc_'));
    expect(profiles).toHaveLength(CHARACTER_LIBRARY_SLOT_COUNT);
    expect(npcs).toHaveLength(CHARACTER_LIBRARY_SLOT_COUNT);
  });

  it('routes gazzetta hero keys to news category at 3:1', () => {
    const resolved = resolveSemanticImageKey('gazzetta-economy');
    expect(resolved.category).toBe('news');
    expect(resolved.primaryUrl).toBe('/assets/news/gazzetta-economy.webp');
    expect(resolved.aspect).toBe('3:1');
  });

  it('routes section heroes at 3:1', () => {
    const resolved = resolveSemanticImageKey('marketplace-hero');
    expect(resolved.category).toBe('hero');
    expect(resolved.aspect).toBe('3:1');
  });

  it('routes referendum keys at 3:1', () => {
    const resolved = resolveSemanticImageKey('referendum-default');
    expect(resolved.category).toBe('referendum');
    expect(resolved.aspect).toBe('3:1');
  });

  it('resolves character portraits with legacy fallbacks', () => {
    const resolved = resolveCharacterPortraitAsset('profile_001');
    expect(resolved.primaryUrl).toBe('/assets/characters/profile_001.webp');
    expect(resolved.fallbackUrls).toContain('/profiles/profile_001.webp');
  });

  it('finds catalog entry by asset key', () => {
    const resolved = resolveAssetKey('hero:marketplace-hero');
    expect(resolved?.primaryUrl).toBe('/assets/hero/marketplace-hero.webp');
  });

  it('marks ambient heroes as time-phased', () => {
    const resolved = resolveSemanticImageKey('marketplace-hero');
    expect(resolved.timePhased).toBe(true);
  });

  it('does not time-phase character portraits', () => {
    const resolved = resolveCharacterPortraitAsset('profile_001');
    expect(resolved.timePhased).toBe(false);
  });

  it('prefers phase variant URL before base asset', () => {
    const resolved = resolveSemanticImageKey('marketplace-hero');
    const urls = allCandidateUrls(resolved, { timePhase: 'sunset' });
    expect(urls[0]).toBe('/assets/hero/marketplace-hero.sunset.webp');
    expect(urls[1]).toBe('/assets/hero/marketplace-hero.webp');
  });

  it('resolves opening background URLs by visual phase', () => {
    expect(resolveOpeningBackgroundUrl('morning')).toBe('/assets/hero/home-morning.webp');
    expect(resolveOpeningBackgroundUrl('night')).toBe('/assets/hero/home-night.webp');
  });

  it('includes opening backgrounds in catalog at 9:16', () => {
    const resolved = resolveAssetKey('hero:home-sunset');
    expect(resolved?.aspect).toBe('9:16');
    expect(resolved?.primaryUrl).toBe('/assets/hero/home-sunset.webp');
  });
});
