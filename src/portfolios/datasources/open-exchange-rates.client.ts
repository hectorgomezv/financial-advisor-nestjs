import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenExchangeRatesClient {
  private readonly logger = new Logger(OpenExchangeRatesClient.name);

  private baseUrl: string;
  private appId: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = 'http://openexchangerates.org/api/latest.json?app_id=';
    this.appId = this.configService.getOrThrow<string>(
      'EXCHANGE_RATES_PROVIDER_APP_ID',
    );
  }

  async getRates(): Promise<Record<string, number> | null> {
    try {
      const { data } = await this.httpService.axiosRef.get(
        `${this.baseUrl}${this.appId}&symbols=EUR,GBP,JPY,CHF,CAD`,
      );
      return data.rates;
    } catch (err) {
      this.logger.fatal('Unable to get exchange rates', err);
      return null;
    }
  }
}
