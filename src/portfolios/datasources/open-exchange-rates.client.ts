import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenExchangeRatesClient {
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

  async getRates(): Promise<Record<string, number>> {
    const { data } = await this.httpService.axiosRef.get(
      `${this.baseUrl}${this.appId}`,
    );

    return data.rates;
  }
}
