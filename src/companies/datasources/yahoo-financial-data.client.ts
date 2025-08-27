import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { sample } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { DataPoint } from '../../common/domain/entities/data-point.entity';
import { Chart, Quote } from '../domain/entities/chart.entity';
import { QuoteSummary } from '../domain/entities/quote-summary.entity';
import { IFinancialDataClient } from './financial-data.client.interface';

@Injectable()
export class YahooFinancialDataClient implements IFinancialDataClient {
  private baseUrl: string;
  private providerApiTokens: string[];

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('PROVIDER_BASE_URL');
    this.providerApiTokens = [
      this.configService.get<string>('PROVIDER_API_TOKEN'),
    ];
    const altToken = this.configService.get<string>('PROVIDER_API_TOKEN_ALT');
    if (altToken) this.providerApiTokens.push(altToken);
  }

  async getChartDataPoints(symbol: string): Promise<DataPoint[]> {
    let response;
    try {
      response = await this.httpService.axiosRef.get(
        `${this.baseUrl}/v8/finance/chart/${symbol}?range=5y&interval=1d`,
        { headers: { 'x-api-key': sample(this.providerApiTokens) } },
      );
    } catch (err) {
      return this.mapYahooErrorResponse(err);
    }

    const chart: Chart = response.data.chart.result[0];
    const quote: Quote = chart.indicators.quote[0];
    return quote.close.map(
      (value, n) =>
        new DataPoint(
          new Date(response.data.chart.result[0].timestamp[n] * 1000),
          value,
        ),
    );
  }

  async getQuoteSummary(symbol: string): Promise<QuoteSummary> {
    let response;
    try {
      response = await this.httpService.axiosRef.get(
        `${this.baseUrl}/v11/finance/quoteSummary/${symbol}?modules=summaryDetail,defaultKeyStatistics,price`,
        { headers: { 'x-api-key': sample(this.providerApiTokens) } },
      );
    } catch (err) {
      return this.mapYahooErrorResponse(err);
    }
    const result = response?.data?.quoteSummary?.result?.[0];
    if (!result) {
      throw new NotFoundException(
        `Financial data client cannot find company ${symbol}`,
      );
    }
    return this._mapResponse(result);
  }

  private _mapResponse({
    summaryDetail,
    defaultKeyStatistics,
    price,
  }): QuoteSummary {
    const peg = Number(defaultKeyStatistics?.pegRatio?.raw);

    return <QuoteSummary>{
      uuid: uuidv4(),
      timestamp: Date.now(),
      price: price.regularMarketPrice.raw,
      currency: summaryDetail?.currency,
      peg: peg < 500 ? peg : 0,
      enterpriseToRevenue: Number(
        defaultKeyStatistics?.enterpriseToRevenue?.raw,
      ),
      enterpriseToEbitda: Number(defaultKeyStatistics?.enterpriseToEbitda?.raw),
      shortPercentOfFloat: Number(
        defaultKeyStatistics?.shortPercentOfFloat?.raw,
      ),
    };
  }

  private mapYahooErrorResponse(err: AxiosError): never {
    if (err?.response?.status === HttpStatus.TOO_MANY_REQUESTS) {
      throw new HttpException(
        'Financial data provider limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    throw new HttpException(
      'Financial data provider error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
