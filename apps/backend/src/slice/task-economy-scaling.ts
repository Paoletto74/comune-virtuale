/** Scales task cash rewards for new players — gradual economic progression. */

export const TASK_ECONOMY_NEW_PLAYER_LEVEL = 1;
export const TASK_ECONOMY_NEW_PLAYER_POINTS = 80;
export const TASK_ECONOMY_MID_PLAYER_LEVEL = 2;
export const TASK_ECONOMY_MID_PLAYER_POINTS = 180;

/** Max single task reward (minor) for brand-new players (~€3). */
export const TASK_ECONOMY_STARTER_CASH_CAP_MINOR = 3n;

/** Max single task reward for mid-progression players (~€12). */
export const TASK_ECONOMY_MID_CASH_CAP_MINOR = 12n;

/** Hard cap for any task cash reward (~€20). */
export const TASK_ECONOMY_MAX_CASH_REWARD_MINOR = 20n;

export function scaleTaskCashReward(
  deltaMinor: bigint,
  mainLevel: number,
  progressionPoints: number,
): bigint {
  if (deltaMinor <= 0n) return deltaMinor;
  if (deltaMinor <= 50n) return deltaMinor;

  let scaled = deltaMinor;

  if (mainLevel <= TASK_ECONOMY_NEW_PLAYER_LEVEL && progressionPoints < TASK_ECONOMY_NEW_PLAYER_POINTS) {
    scaled = (deltaMinor * 55n) / 100n;
    if (scaled > TASK_ECONOMY_STARTER_CASH_CAP_MINOR) {
      scaled = TASK_ECONOMY_STARTER_CASH_CAP_MINOR;
    }
  } else if (mainLevel <= TASK_ECONOMY_MID_PLAYER_LEVEL && progressionPoints < TASK_ECONOMY_MID_PLAYER_POINTS) {
    scaled = (deltaMinor * 75n) / 100n;
    if (scaled > TASK_ECONOMY_MID_CASH_CAP_MINOR) {
      scaled = TASK_ECONOMY_MID_CASH_CAP_MINOR;
    }
  }

  if (scaled > TASK_ECONOMY_MAX_CASH_REWARD_MINOR) {
    return TASK_ECONOMY_MAX_CASH_REWARD_MINOR;
  }

  return scaled;
}
