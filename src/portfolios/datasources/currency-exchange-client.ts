import { InternalServerErrorException } from '@nestjs/common';
import * as oxr from 'open-exchange-rates';
import * as money from 'money';
import { CronJob } from 'cron';

const { EXCHANGE_RATES_PROVIDER_APP_ID } = process.env;

const EVERY_THREE_HOURS_CRON_EXP = '0 */3 * * *';

let fx;

export class CurrencyExchangeClient {
  private fx;

  constructor() {
    this.fx = null;
  }

  async getFx() {
    if (!this.fx) {
      this.fx = await this.refreshFx();
      this.initDaemon();
    }

    return this.fx;
  }

  private refreshFx() {
    return new Promise((resolve, reject) => {
      if (!EXCHANGE_RATES_PROVIDER_APP_ID) {
        throw new InternalServerErrorException(
          'No EXCHANGE_RATES_PROVIDER_APP_ID provided',
        );
      }

      oxr.set({ app_id: EXCHANGE_RATES_PROVIDER_APP_ID });

      oxr.latest((err) => {
        if (err) {
          return reject(err);
        }

        money.rates = oxr.rates;
        money.base = oxr.base;

        return resolve(money);
      });
    });
  }

  private initDaemon() {
    const daemon = new CronJob(EVERY_THREE_HOURS_CRON_EXP, async () => {
      fx = await this.refreshFx();
    });

    daemon.start();
  }
}
