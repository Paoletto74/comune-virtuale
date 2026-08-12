/** Purchasing power index — 100 = baseline comfortable month. */
export const PURCHASING_POWER_BASELINE_EUR = 2500;

export interface PurchasingPowerResult {
  index: number;
  label: string;
  effectiveMonthlyMinor: bigint;
}

export function computePurchasingPower(input: {
  cashMinor: bigint;
  monthlySalaryMinor: bigint;
  netWorthMinor: bigint;
  priceIndexBps: number;
  inflationRateBps: number;
}): PurchasingPowerResult {
  const priceFactor = 10_000 / Math.max(1, input.priceIndexBps);
  const inflationFactor = 10_000 / Math.max(1, 10_000 + input.inflationRateBps);

  const cash = Number(input.cashMinor);
  const salary = Number(input.monthlySalaryMinor);
  const wealth = Number(input.netWorthMinor);

  const effective =
    (cash * 0.25 + salary + wealth * 0.04) * priceFactor * inflationFactor;
  const baselineMinor = BigInt(PURCHASING_POWER_BASELINE_EUR) * 100n;
  const index = Math.round((effective / Number(baselineMinor)) * 100);

  let label: string;
  if (index >= 130) label = 'Agiato';
  else if (index >= 95) label = 'Tranquillo';
  else if (index >= 65) label = 'In equilibrio';
  else if (index >= 35) label = 'Stretto';
  else label = 'Critico';

  return {
    index: Math.max(0, index),
    label,
    effectiveMonthlyMinor: BigInt(Math.round(effective)),
  };
}
