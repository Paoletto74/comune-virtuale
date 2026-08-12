import { describe, expect, it } from 'vitest';
import {
  SLICE_DEMO_HELP_EFFECTS,
  SLICE_DEMO_IGNORE_EFFECTS,
  SLICE_INITIAL_PERSONAL_VALUES,
  SLICE_DEMO_TASK_OPTION_HELP,
  SLICE_DEMO_TASK_OPTION_IGNORE,
} from '../slice/constants.js';
import {
  applySliceDemoHelpEffects,
  applySliceDemoOptionEffects,
  resolveSliceDemoOptionCashDelta,
  resolveSliceDemoOptionEffects,
} from '../application/effects/effect-registry.js';
import { SLICE_DEMO_HELP_CASH_DELTA_MINOR } from '../slice/economy-constants.js';

describe('slice demo option effects', () => {
  it('applySliceDemoHelpEffects adds +1 sympathy and +1 reputation from baseline', () => {
    const result = applySliceDemoHelpEffects({ ...SLICE_INITIAL_PERSONAL_VALUES });
    expect(result).toEqual({
      sympathy: SLICE_INITIAL_PERSONAL_VALUES.sympathy + SLICE_DEMO_HELP_EFFECTS.sympathy,
      reputation: SLICE_INITIAL_PERSONAL_VALUES.reputation + SLICE_DEMO_HELP_EFFECTS.reputation,
    });
  });

  it('applySliceDemoHelpEffects stacks on existing values', () => {
    const result = applySliceDemoHelpEffects({ sympathy: 3, reputation: 2 });
    expect(result).toEqual({ sympathy: 4, reputation: 3 });
  });

  it('resolveSliceDemoOptionEffects returns zero delta for ignore', () => {
    expect(resolveSliceDemoOptionEffects(SLICE_DEMO_TASK_OPTION_IGNORE)).toEqual({
      ...SLICE_DEMO_IGNORE_EFFECTS,
    });
  });

  it('applySliceDemoOptionEffects leaves values unchanged for ignore', () => {
    const baseline = { sympathy: 0, reputation: 0 };
    expect(applySliceDemoOptionEffects(baseline, SLICE_DEMO_TASK_OPTION_IGNORE)).toEqual(baseline);
    expect(applySliceDemoOptionEffects({ sympathy: 2, reputation: 1 }, SLICE_DEMO_TASK_OPTION_IGNORE)).toEqual({
      sympathy: 2,
      reputation: 1,
    });
  });

  it('applySliceDemoOptionEffects applies help delta', () => {
    expect(applySliceDemoOptionEffects({ ...SLICE_INITIAL_PERSONAL_VALUES }, SLICE_DEMO_TASK_OPTION_HELP)).toEqual({
      sympathy: 1,
      reputation: 1,
    });
  });

  it('resolveSliceDemoOptionCashDelta returns +10 for help and 0 for ignore', () => {
    expect(resolveSliceDemoOptionCashDelta(SLICE_DEMO_TASK_OPTION_HELP)).toBe(
      SLICE_DEMO_HELP_CASH_DELTA_MINOR,
    );
    expect(resolveSliceDemoOptionCashDelta(SLICE_DEMO_TASK_OPTION_IGNORE)).toBe(0n);
  });
});
