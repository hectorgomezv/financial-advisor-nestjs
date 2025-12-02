import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import Decimal from 'decimal.js';
import * as money from 'money';
import { CurrenciesRepository } from '../repositories/currencies.repository';
import { OpenExchangeRatesClient } from './open-exchange-rates.client';

const EVERY_SIX_HOURS_CRON_EXP = '0 */6 * * *';

@Injectable()
export class CurrencyExchangeClient {
  private fx;

  constructor(
    private readonly openExchangeRatesClient: OpenExchangeRatesClient,
    private readonly currenciesRepository: CurrenciesRepository,
  ) {}

  async getFx() {
    if (!this.fx) {
      money.rates = await this.getRatesFromDb();
      money.base = 'USD';
      this.fx = money;
      this.initDaemon();
    }

    return this.fx;
  }

  async getRatesFromDb(): Promise<Record<string, number>> {
    const ratesFromDb = await this.currenciesRepository.getRates();
    if (ratesFromDb.length === 0) {
      return this.refreshFx();
    }
    const rates: Record<string, number> = {};
    for (const { symbol, usdValue } of ratesFromDb) {
      rates[symbol] = usdValue.toNumber();
    }
    return rates;
  }

  async refreshFx(): Promise<Record<string, number>> {
    const rates = await this.openExchangeRatesClient.getRates();
    for (const [symbol, rate] of Object.entries(rates || {})) {
      await this.currenciesRepository.upsertRate(symbol, new Decimal(rate));
    }
    return rates ?? {};
  }

  private initDaemon() {
    if (process.env.NODE_ENV !== 'test') {
      const daemon = new CronJob(EVERY_SIX_HOURS_CRON_EXP, async () => {
        this.fx = await this.refreshFx();
      });

      daemon.start();
    }
  }
}
