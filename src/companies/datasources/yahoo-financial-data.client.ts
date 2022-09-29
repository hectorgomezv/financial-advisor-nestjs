import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { QuoteSummary } from '../domain/entities/quote-summary.entity';
import { FinancialDataClient } from './financial-data.client.interface';

@Injectable()
export class YahooFinancialDataClient implements FinancialDataClient {
  private baseUrl: string;
  private defaultModules: string;
  private providerApiToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = `${this.configService.get<string>(
      'PROVIDER_BASE_URL',
    )}/finance/quoteSummary`;

    this.defaultModules =
      '?modules=summaryDetail,defaultKeyStatistics,fundOwnership,majorDirectHolders';

    this.providerApiToken =
      this.configService.get<string>('PROVIDER_API_TOKEN');
  }

  async getQuoteSummary(symbol: string): Promise<QuoteSummary> {
    const { data } = await this.httpService.axiosRef.get(
      `${this.baseUrl}/${symbol}${this.defaultModules}`,
      { headers: { 'x-api-key': this.providerApiToken } },
    );

    return this.mapQuoteSummaryResponse(data.quoteSummary.result[0]);
  }

  private mapQuoteSummaryResponse(item: any): QuoteSummary {
    return <QuoteSummary>{
      uuid: uuidv4(),
      timestamp: Date.now(),
      price: Number(
        item?.summaryDetail?.ask?.raw ||
          item?.summaryDetail?.bid?.raw ||
          item?.summaryDetail?.open?.raw ||
          item?.summaryDetail?.previousClose?.raw,
      ),
      peg: Number(item?.defaultKeyStatistics?.pegRatio?.raw),
    };
  }
}
