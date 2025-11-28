import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { IFinancialDataClient } from '../datasources/financial-data.client.interface';
import { CompanyState } from '../domain/entities/company-state.entity';
import { Company } from '../domain/entities/company.entity';
import { QuoteSummary } from '../domain/entities/quote-summary.entity';
import { CompanyStatesPgRepository } from '../repositories/company-states.pg.repository';
import { CompanyMetricsResult } from './entities/company-metrics-result.entity';
import { CompanyMetrics } from './entities/company-metrics.entity';
import { Maths } from '../../common/domain/entities/maths.entity';

export interface CreateCompanyStateDto {
  companyId: number;
  currency: string;
  enterpriseToEbitda: Decimal;
  enterpriseToRevenue: Decimal;
  forwardPE: Decimal;
  price: Decimal;
  profitMargins: Decimal;
  shortPercentOfFloat: Decimal;
  timestamp: Date;
}

export interface CompanyStateResult {
  companyId: number;
  currency: string;
  enterpriseToEbitda: string;
  enterpriseToRevenue: string;
  forwardPE: string;
  id: number;
  price: string;
  profitMargins: string;
  shortPercentOfFloat: string;
  timestamp: Date;
}

@Injectable()
export class CompanyStatesService {
  constructor(
    private readonly repository: CompanyStatesPgRepository,
    @Inject(IFinancialDataClient)
    private readonly financialDataClient: IFinancialDataClient,
  ) {}

  async getLastByCompanyId(companyId: number): Promise<CompanyStateResult> {
    const state = await this.repository.getLastByCompanyId(companyId);
    if (state === null) throw new NotFoundException('State not found');
    return this.mapToResult(state);
  }

  async getLastByCompanyIds(
    companyIds: Array<number>,
  ): Promise<Array<CompanyStateResult>> {
    const states = await this.repository.getLastByCompanyIds(companyIds);
    return this.mapToResults(states);
  }

  async createCompanyState(company: Company): Promise<CompanyStateResult> {
    const quoteSummary: QuoteSummary =
      await this.financialDataClient.getQuoteSummary(company.symbol);

    const dto: CreateCompanyStateDto = <CreateCompanyStateDto>{
      companyId: company.id,
      currency: quoteSummary.currency,
      enterpriseToEbitda: new Decimal(quoteSummary?.enterpriseToEbitda || 0),
      enterpriseToRevenue: new Decimal(quoteSummary?.enterpriseToRevenue || 0),
      forwardPE: new Decimal(quoteSummary?.forwardPE || 0),
      price: new Decimal(quoteSummary?.price || 0),
      profitMargins: new Decimal(quoteSummary?.profitMargins || 0),
      shortPercentOfFloat: new Decimal(quoteSummary?.shortPercentOfFloat || 0),
      timestamp: new Date(),
    };

    const created = await this.repository.create(dto);
    return this.mapToResult(created);
  }

  async getMetricsByCompanyId(
    companyId: number,
  ): Promise<CompanyMetricsResult> {
    const metrics = await this.repository.getMetricsByCompanyId(companyId);
    if (metrics === null) throw new NotFoundException('Company not found');
    return this.mapMetricsToResult(metrics);
  }

  private mapMetricsToResult(metrics: CompanyMetrics): CompanyMetricsResult {
    return {
      avgEnterpriseToRevenue: Maths.round(metrics.avgEnterpriseToRevenue),
      avgEnterpriseToEbitda: Maths.round(metrics.avgEnterpriseToEbitda),
      avgForwardPE: Maths.round(metrics.avgForwardPE),
      avgProfitMargins: Maths.round(metrics.avgProfitMargins),
    };
  }

  private mapToResults(states: Array<CompanyState>): Array<CompanyStateResult> {
    return states.map((state) => this.mapToResult(state));
  }

  private mapToResult(state: CompanyState): CompanyStateResult {
    return {
      id: state.id,
      companyId: state.companyId,
      currency: state.currency,
      enterpriseToEbitda: Maths.round(state.enterpriseToEbitda),
      enterpriseToRevenue: Maths.round(state.enterpriseToRevenue),
      forwardPE: Maths.round(state.forwardPE),
      price: Maths.round(state.price),
      profitMargins: Maths.round(state.profitMargins),
      shortPercentOfFloat: Maths.round(state.shortPercentOfFloat),
      timestamp: state.timestamp,
    };
  }
}
