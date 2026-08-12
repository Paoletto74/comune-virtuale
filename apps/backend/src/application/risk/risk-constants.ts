export function riskOutcomeIdempotencyKey(taskInstanceId: string, optionId: string): string {
  return `risk-outcome:${taskInstanceId}:${optionId}`;
}

export function riskOutcomeSourceActionId(taskInstanceId: string, optionId: string): string {
  return `task:${taskInstanceId}:complete:${optionId}:risk`;
}
