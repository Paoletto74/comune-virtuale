import type { HomeResponse } from '@/api/client';
import type { WorkDashboardState } from '@/utils/homeDashboardSelectors';

export interface HomeDashboardContextInput {
  home: HomeResponse;
  votableReferendaCount: number;
  workState: WorkDashboardState;
  activeWorldEvents: number;
  latestGazzettaTitle?: string;
  spontaneousMessages: number;
}

export function buildHomeDashboardContextLine(input: HomeDashboardContextInput): string {
  const { home, workState } = input;

  if (workState.kind === 'needs_clock_in') {
    return 'Nuovo giorno operativo. Il cartellino attende la tua firma.';
  }

  if (input.activeWorldEvents > 0) {
    return 'Il Comune è in movimento: eventi attivi richiedono attenzione.';
  }

  if (input.votableReferendaCount > 0) {
    const count = input.votableReferendaCount;
    return count === 1
      ? 'Un referendum attende il tuo voto.'
      : `${count} referendum in agenda — la città decide.`;
  }

  if (input.spontaneousMessages > 0) {
    return 'Hai messaggi in arrivo dalle tue conoscenze.';
  }

  const readyTasks = home.activeTasks.filter((task) => task.feedState === 'ready');
  if (readyTasks.length > 0) {
    return readyTasks.length === 1
      ? 'Un incarico è pronto da completare.'
      : `${readyTasks.length} incarichi pronti da completare.`;
  }

  if (input.latestGazzettaTitle) {
    return `Nelle ultime ore: ${input.latestGazzettaTitle}`;
  }

  const day = home.gameDate?.day ?? home.gameTime.worldTimeMs;
  return `${home.displayName}, giorno ${day} — il Comune osserva e registra.`;
}
