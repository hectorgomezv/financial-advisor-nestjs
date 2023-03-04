import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { DataPoint } from '../../common/domain/entities/data-point.entity';
import { Chart, Quote } from '../domain/entities/chart.entity';
import { QuoteSummary } from '../domain/entities/quote-summary.entity';
import { IFinancialDataClient } from './financial-data.client.interface';

@Injectable()
export class YahooFinancialDataClient implements IFinancialDataClient {
  private baseUrl: string;
  private defaultModules: string;
  private providerApiToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('PROVIDER_BASE_URL');
    this.defaultModules = '?modules=summaryDetail,defaultKeyStatistics';
    this.providerApiToken =
      this.configService.get<string>('PROVIDER_API_TOKEN');
  }

  async getChartDataPoints(symbol: string): Promise<DataPoint[]> {
    let response;
    try {
      response = await this.httpService.axiosRef.get(
        `${this.baseUrl}/v8/finance/chart/${symbol}?range=5y&interval=1d`,
        { headers: { 'x-api-key': this.providerApiToken } },
      );
    } catch (err) {
      return this.mapYahooErrorResponse(err);
    }

    const chart: Chart = response.data.chart.result.at(0);
    const quote: Quote = chart.indicators.quote.at(0);
    return quote.close.map(
      (value, n) =>
        new DataPoint(
          response.data.chart.result.at(0).timestamp.at(n) * 1000,
          value,
        ),
    );
  }

  async getQuoteSummary(symbol: string): Promise<QuoteSummary> {
    let response;
    try {
      response = await this.httpService.axiosRef.get(
        `${this.baseUrl}/v11/finance/quoteSummary/${symbol}${this.defaultModules}`,
        { headers: { 'x-api-key': this.providerApiToken } },
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

    return this.mapQuoteSummaryResponse(result);
  }

  private mapQuoteSummaryResponse(item: any): QuoteSummary {
    const peg = Number(item?.defaultKeyStatistics?.pegRatio?.raw);

    return <QuoteSummary>{
      uuid: uuidv4(),
      timestamp: Date.now(),
      price: Number(
        item?.summaryDetail?.ask?.raw ||
          item?.summaryDetail?.bid?.raw ||
          item?.summaryDetail?.open?.raw ||
          item?.summaryDetail?.previousClose?.raw,
      ),
      peg: peg < 500 ? peg : 0,
      enterpriseToEbitda: Number(
        item?.defaultKeyStatistics?.enterpriseToEbitda?.raw,
      ),
      shortPercentOfFloat: Number(
        item?.defaultKeyStatistics?.shortPercentOfFloat?.raw,
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
