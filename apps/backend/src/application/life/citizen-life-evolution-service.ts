import { randomUUID } from 'node:crypto';
import type {
  CitizenLifeEvolutionRepository,
  CitizenTemporalEventRepository,
} from '../../domain/ports/repositories.js';

export class CitizenLifeEvolutionService {
  constructor(
    private readonly lifeState: CitizenLifeEvolutionRepository,
    private readonly events: CitizenTemporalEventRepository,
  ) {}

  async recordCitizenCreated(input: {
    citizenId: string;
    worldTimeMs: number;
    displayName: string;
  }): Promise<void> {
    await this.lifeState.ensureState(input.citizenId);
    await this.events.recordEvent({
      eventId: randomUUID(),
      citizenId: input.citizenId,
      eventType: 'milestone',
      idempotencyKey: `milestone:citizen_created:${input.citizenId}`,
      worldTimeMs: input.worldTimeMs,
      title: 'Arrivo in città',
      body: `${input.displayName} è entrato nel registro del Comune Virtuale.`,
      payload: { milestone: 'citizen_created' },
    });
  }

  async recordEmploymentChange(input: {
    citizenId: string;
    worldTimeMs: number;
    employmentState: string;
    occupationLabel?: string;
  }): Promise<void> {
    const idempotencyKey = `life_update:employment:${input.citizenId}:${input.employmentState}:${input.worldTimeMs}`;
    const result = await this.events.recordEvent({
      eventId: randomUUID(),
      citizenId: input.citizenId,
      eventType: 'life_update',
      idempotencyKey,
      worldTimeMs: input.worldTimeMs,
      title: 'Aggiornamento lavorativo',
      body: input.occupationLabel
        ? `Situazione lavorativa registrata: ${input.occupationLabel}.`
        : `Stato occupazionale aggiornato: ${input.employmentState}.`,
      payload: {
        employmentState: input.employmentState,
        occupationLabel: input.occupationLabel,
      },
    });

    if (result.created) {
      await this.lifeState.setEmploymentState(input.citizenId, input.employmentState);
    }
  }

  async recordJobApplicationNotice(input: {
    citizenId: string;
    applicationId: string;
    jobTitle: string;
    accepted: boolean;
    worldTimeMs: number;
  }): Promise<void> {
    const title = input.accepted ? 'Congratulazioni!' : 'Esito candidatura';
    const body = input.accepted
      ? `La tua candidatura per ${input.jobTitle} è stata accettata.`
      : `La tua candidatura per ${input.jobTitle} non è stata accettata.`;

    await this.events.recordEvent({
      eventId: randomUUID(),
      citizenId: input.citizenId,
      eventType: 'job_application',
      idempotencyKey: `job-application-notice:${input.applicationId}`,
      worldTimeMs: input.worldTimeMs,
      title,
      body,
      payload: {
        applicationId: input.applicationId,
        jobTitle: input.jobTitle,
        decision: input.accepted ? 'accepted' : 'rejected',
      },
    });
  }

  async recordPayrollNotice(input: {
    citizenId: string;
    offerId: string;
    jobTitle: string;
    amountMinor: bigint;
    shiftEndsAtGameMs: number;
    worldTimeMs: number;
  }): Promise<{ created: boolean }> {
    const euros = Number(input.amountMinor);
    const result = await this.events.recordEvent({
      eventId: randomUUID(),
      citizenId: input.citizenId,
      eventType: 'job_payroll',
      idempotencyKey: `job-payroll-notice:${input.citizenId}:${input.offerId}:${input.shiftEndsAtGameMs}`,
      worldTimeMs: input.worldTimeMs,
      title: 'Stipendio turno',
      body: `Hai ricevuto € ${euros.toLocaleString('it-IT')} per il turno da ${input.jobTitle}.`,
      payload: {
        offerId: input.offerId,
        jobTitle: input.jobTitle,
        amountMinor: input.amountMinor.toString(),
      },
    });
    return { created: result.created };
  }

  async recordMarketplacePurchaseNotice(input: {
    citizenId: string;
    itemId: string;
    itemName: string;
    priceMinor: bigint;
    worldTimeMs: number;
    idempotencyKey: string;
  }): Promise<{ created: boolean }> {
    const euros = Number(input.priceMinor);
    const isMajorPurchase = input.priceMinor >= 200n;
    const result = await this.events.recordEvent({
      eventId: randomUUID(),
      citizenId: input.citizenId,
      eventType: 'marketplace_purchase',
      idempotencyKey: `marketplace-purchase-notice:${input.idempotencyKey}`,
      worldTimeMs: input.worldTimeMs,
      title: 'Acquisto effettuato',
      body: `Hai acquistato ${input.itemName} per € ${euros.toLocaleString('it-IT')}.`,
      payload: {
        itemId: input.itemId,
        itemName: input.itemName,
        priceMinor: input.priceMinor.toString(),
        audience: isMajorPurchase ? 'public' : 'personal',
      },
    });
    return { created: result.created };
  }

  async recordMarketplaceSaleNotice(input: {
    citizenId: string;
    itemId: string;
    itemName: string;
    priceMinor: bigint;
    buyerLabel: string;
    worldTimeMs: number;
    idempotencyKey: string;
  }): Promise<{ created: boolean }> {
    const euros = Number(input.priceMinor);
    const result = await this.events.recordEvent({
      eventId: randomUUID(),
      citizenId: input.citizenId,
      eventType: 'marketplace_sale',
      idempotencyKey: `marketplace-sale-notice:${input.idempotencyKey}`,
      worldTimeMs: input.worldTimeMs,
      title: 'Oggetto venduto',
      body: `Hai venduto ${input.itemName} a ${input.buyerLabel} per € ${euros.toLocaleString('it-IT')}.`,
      payload: {
        itemId: input.itemId,
        itemName: input.itemName,
        priceMinor: input.priceMinor.toString(),
        buyerLabel: input.buyerLabel,
        audience: 'personal',
      },
    });
    return { created: result.created };
  }

  async recordMarketplaceRentNotice(input: {
    citizenId: string;
    itemId: string;
    tenantLabel: string;
    amountMinor: bigint;
    worldTimeMs: number;
    idempotencyKey: string;
  }): Promise<{ created: boolean }> {
    const euros = Number(input.amountMinor);
    const result = await this.events.recordEvent({
      eventId: randomUUID(),
      citizenId: input.citizenId,
      eventType: 'marketplace_rent',
      idempotencyKey: `marketplace-rent-notice:${input.idempotencyKey}`,
      worldTimeMs: input.worldTimeMs,
      title: 'Immobile affittato',
      body: `${input.tenantLabel} ha preso in affitto il tuo immobile. Canone: € ${euros.toLocaleString('it-IT')}/mese.`,
      payload: {
        itemId: input.itemId,
        tenantLabel: input.tenantLabel,
        amountMinor: input.amountMinor.toString(),
        audience: 'personal',
      },
    });
    return { created: result.created };
  }
}
