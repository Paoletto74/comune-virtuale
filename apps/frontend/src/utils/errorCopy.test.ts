import { describe, expect, it } from 'vitest';
import { resolveErrorMessage } from '@/utils/errorCopy';

describe('errorCopy tone of voice', () => {
  it('uses Comune voice for common errors', () => {
    expect(resolveErrorMessage('error.task.not_completable')).toMatch(/non ancora/i);
    expect(resolveErrorMessage('error.economy.insufficient_cash')).toMatch(/matematica/i);
    expect(resolveErrorMessage('error.game_surface.purchase_blocked')).toMatch(/prestigio/i);
  });
});
