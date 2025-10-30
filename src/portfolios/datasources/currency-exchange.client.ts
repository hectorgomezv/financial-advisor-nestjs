import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import { OpenExchangeRatesClient } from './open-exchange-rates.client.js';

const EVERY_TWELVE_HOURS_CRON_EXP = '0 */12 * * *';

interface Fx {
  convert(amount: number, opts: { from: string; to: string }): number;
}

@Injectable()
export class CurrencyExchangeClient {
  private fx: Fx | null = null;
  private rates: Record<string, number> = {};
  private base = 'USD';

  constructor(
    private readonly openExchangeRatesClient: OpenExchangeRatesClient,
  ) {}

  async getFx(): Promise<Fx> {
    if (!this.fx) {
      await this.refreshFx();
      this.initDaemon();
    }

    return {
      convert: (amount: number, { from, to }: { from: string; to: string }) =>
        this.convert(amount, from, to),
    };
  }

  private async refreshFx(): Promise<void> {
    const rates = await this.openExchangeRatesClient.getRates();
    if (!rates || typeof rates !== 'object') {
      throw new Error('Invalid rates received from OpenExchangeRatesClient');
    }

    this.rates = rates;
  }

  private convert(amount: number, from: string, to: string): number {
    if (from === to) return amount;

    const fromRate = from === this.base ? 1 : this.rates[from];
    const toRate = to === this.base ? 1 : this.rates[to];

    if (!fromRate || !toRate) {
      throw new Error(`Missing exchange rate for ${from} or ${to}`);
    }

    // Convert via USD base
    const amountInBase = amount / fromRate;
    return amountInBase * toRate;
  }

  private initDaemon(): void {
    if (process.env.NODE_ENV !== 'test') {
      const daemon = new CronJob(EVERY_TWELVE_HOURS_CRON_EXP, async () => {
        await this.refreshFx();
      });
      daemon.start();
    }
  }
}
