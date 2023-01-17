import { DataPoint } from '../../common/domain/entities/data-point.entity';
import { QuoteSummary } from '../domain/entities/quote-summary.entity';

export const IFinancialDataClient = Symbol('IFinancialDataClient');

export interface IFinancialDataClient {
  getQuoteSummary(symbol: string): Promise<QuoteSummary>;
  getChartDataPoints(symbol: string): Promise<DataPoint[]>;
}
