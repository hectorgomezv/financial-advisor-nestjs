import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { IFinancialDataClient } from '../datasources/financial-data.client.interface';
import { CompanyState } from '../domain/entities/company-state.entity';
import { Company } from '../domain/entities/company.entity';
import { QuoteSummary } from '../domain/entities/quote-summary.entity';
import { CompanyStatesRepository } from '../repositories/company-states.repository';
import { CompanyMetrics } from './entities/company-metrics.entity';

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
    private readonly repository: CompanyStatesRepository,
    @Inject(IFinancialDataClient)
    private readonly financialDataClient: IFinancialDataClient,
  ) {}

  async getLastByCompanyId(companyId: number): Promise<CompanyState> {
    const state = await this.repository.getLastByCompanyId(companyId);
    if (state === null) throw new NotFoundException('State not found');
    return state;
  }

  async getLastByCompanyIds(
    companyIds: Array<number>,
  ): Promise<Array<CompanyState>> {
    return this.repository.getLastByCompanyIds(companyIds);
  }

  async createCompanyState(company: Company): Promise<CompanyState> {
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

    return this.repository.create(dto);
  }

  async getMetricsByCompanyId(companyId: number): Promise<CompanyMetrics> {
    const metrics = await this.repository.getMetricsByCompanyId(companyId);
    if (metrics === null) throw new NotFoundException('Company not found');
    return metrics;
  }
}
