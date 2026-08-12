import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const cssPath = resolve(import.meta.dirname, 'global.css');
const css = readFileSync(cssPath, 'utf8');

describe('mobile responsive CSS', () => {
  it('includes the mobile optimization block and primary breakpoints', () => {
    expect(css).toContain('Mobile responsive optimization (320–430px)');
    expect(css).toMatch(/@media \(max-width: 430px\)/);
    expect(css).toMatch(/@media \(max-width: 390px\)/);
    expect(css).toMatch(/@media \(max-width: 375px\)/);
    expect(css).toMatch(/@media \(max-width: 320px\)/);
  });

  it('prevents horizontal overflow on narrow viewports', () => {
    expect(css).toMatch(/@media \(max-width: 430px\)[\s\S]*?\.app \{[\s\S]*?overflow-x: hidden/);
    expect(css).toMatch(
      /\.gameScrollArea \{[\s\S]*?overflow-x: hidden/,
    );
  });

  it('keeps compact game header with visible saldo and touch-friendly actions', () => {
    expect(css).toMatch(/@media \(max-width: 430px\)[\s\S]*?\.gameHeaderSaldo/);
    expect(css).toMatch(/@media \(max-width: 430px\)[\s\S]*?\.gameHeaderAction[\s\S]*?min-height: 44px/);
    expect(css).toMatch(/@media \(max-width: 430px\)[\s\S]*?\.gameHeaderPhaseLink[\s\S]*?min-height: 44px/);
  });

  it('optimizes bottom navigation for touch and safe area', () => {
    expect(css).toMatch(/@media \(max-width: 430px\)[\s\S]*?\.navBottom--six \.navBottomLink[\s\S]*?min-height: 44px/);
    expect(css).toMatch(/\.navBottom \{[\s\S]*?env\(safe-area-inset-bottom/);
  });

  it('tightens feed cards without removing category icons', () => {
    expect(css).not.toMatch(/\.feedCardMeta \.feedIcon \{\s*display: none/);
    expect(css).toMatch(/@media \(max-width: 480px\)[\s\S]*?\.feedCard \{[\s\S]*?padding: 0\.75rem 0\.875rem/);
    expect(css).toMatch(/@media \(max-width: 430px\)[\s\S]*?\.feedList[\s\S]*?gap: 0\.625rem/);
  });

  it('uses single-column profile stats on mobile', () => {
    expect(css).toMatch(/@media \(max-width: 430px\)[\s\S]*?\.profileStatsGrid[\s\S]*?grid-template-columns: 1fr/);
  });
});
