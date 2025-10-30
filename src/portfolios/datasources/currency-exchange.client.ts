import { Injectable } from '@nestjs/common';
import * as money from 'money';
import { CronJob } from 'cron';
import { OpenExchangeRatesClient } from './open-exchange-rates.client.js';

const EVERY_THREE_HOURS_CRON_EXP = '0 */3 * * *';

@Injectable()
export class CurrencyExchangeClient {
  private fx;

  constructor(
    private readonly openExchangeRatesClient: OpenExchangeRatesClient,
  ) {}

  async getFx() {
    if (!this.fx) {
      this.fx = await this.refreshFx();
      this.initDaemon();
    }

    return this.fx;
  }

  private async refreshFx() {
    const rates = await this.openExchangeRatesClient.getRates();
    return money.fx({ rates, base: 'USD' });
  }

  private initDaemon() {
    if (process.env.NODE_ENV !== 'test') {
      const daemon = new CronJob(EVERY_THREE_HOURS_CRON_EXP, async () => {
        this.fx = await this.refreshFx();
      });

      daemon.start();
    }
  }
}
