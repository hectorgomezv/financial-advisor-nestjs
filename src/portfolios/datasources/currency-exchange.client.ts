import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as oxr from 'open-exchange-rates';
import * as money from 'money';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';

const EVERY_THREE_HOURS_CRON_EXP = '0 */3 * * *';

@Injectable()
export class CurrencyExchangeClient {
  private fx;
  private exchangeRatesProviderAppId: string;

  constructor(private configService: ConfigService) {
    this.exchangeRatesProviderAppId = this.configService.get<string>(
      'EXCHANGE_RATES_PROVIDER_APP_ID',
    );
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
      if (!this.exchangeRatesProviderAppId) {
        throw new InternalServerErrorException(
          'No EXCHANGE_RATES_PROVIDER_APP_ID provided',
        );
      }

      oxr.set({ app_id: this.exchangeRatesProviderAppId });

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
      this.fx = await this.refreshFx();
    });

    daemon.start();
  }
}
