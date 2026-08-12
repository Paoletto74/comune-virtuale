export interface RecurringFlowDto {
  flowId: string;
  label: string;
  direction: 'income' | 'expense';
  amountMinorPerMonth: string;
  source: string;
}

const BASE_LIVING_COST_MINOR = 45_000n;

export function buildCitizenRecurringFlows(input: {
  monthlySalaryMinor: bigint;
  rentalIncomeMinor: bigint;
  rentalExpenseMinor: bigint;
  hasEmployment: boolean;
}): RecurringFlowDto[] {
  const flows: RecurringFlowDto[] = [];

  if (input.hasEmployment && input.monthlySalaryMinor > 0n) {
    flows.push({
      flowId: 'salary',
      label: 'Stipendio mensile',
      direction: 'income',
      amountMinorPerMonth: input.monthlySalaryMinor.toString(),
      source: 'employment',
    });
  }

  if (input.rentalIncomeMinor > 0n) {
    flows.push({
      flowId: 'rental_income',
      label: 'Affitti incassati',
      direction: 'income',
      amountMinorPerMonth: input.rentalIncomeMinor.toString(),
      source: 'rentals_owned',
    });
  }

  if (input.rentalExpenseMinor > 0n) {
    flows.push({
      flowId: 'rental_expense',
      label: 'Affitto in corso',
      direction: 'expense',
      amountMinorPerMonth: input.rentalExpenseMinor.toString(),
      source: 'rentals_tenant',
    });
  }

  flows.push({
    flowId: 'living_costs',
    label: 'Spese correnti (vita, utenze, trasporti)',
    direction: 'expense',
    amountMinorPerMonth: BASE_LIVING_COST_MINOR.toString(),
    source: 'world_baseline',
  });

  return flows;
}

export function netRecurringFlowMinor(flows: readonly RecurringFlowDto[]): bigint {
  return flows.reduce((sum, flow) => {
    const amount = BigInt(flow.amountMinorPerMonth);
    return flow.direction === 'income' ? sum + amount : sum - amount;
  }, 0n);
}
