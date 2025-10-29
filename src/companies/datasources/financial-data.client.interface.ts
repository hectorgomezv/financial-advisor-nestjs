import { DataPoint } from '../../common/domain/entities/data-point.entity.js';
import { QuoteSummary } from '../domain/entities/quote-summary.entity.js';

export const IFinancialDataClient = Symbol('IFinancialDataClient');

export interface IFinancialDataClient {
  getQuoteSummary(symbol: string): Promise<QuoteSummary>;
  getChartDataPoints(symbol: string): Promise<DataPoint[]>;
}
