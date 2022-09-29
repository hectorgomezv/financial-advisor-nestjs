import { QuoteSummary } from '../domain/entities/quote-summary.entity';

export interface FinancialDataClient {
  getQuoteSummary(symbol: string): Promise<QuoteSummary>;
}
