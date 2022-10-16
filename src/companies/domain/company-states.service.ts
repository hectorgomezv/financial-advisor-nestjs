import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IFinancialDataClient } from '../datasources/financial-data.client.interface';
import { CompanyStatesRepository } from '../repositories/company-states.repository';
import { CompanyState } from './entities/company-state.entity';
import { Company } from './entities/company.entity';
import { QuoteSummary } from './entities/quote-summary.entity';

@Injectable()
export class CompanyStatesService {
  constructor(
    private readonly companyStatesRepository: CompanyStatesRepository,
    @Inject(IFinancialDataClient)
    private readonly financialDataClient: IFinancialDataClient,
  ) {}

  async getLastStateByCompanyUuids(
    companyUuids: string[],
  ): Promise<CompanyState[]> {
    return this.companyStatesRepository.getLastByCompanyUuids(companyUuids);
  }

  async createCompanyState(company: Company): Promise<CompanyState> {
    const quoteSummary: QuoteSummary =
      await this.financialDataClient.getQuoteSummary(company.symbol);

    const companyState: CompanyState = <CompanyState>{
      uuid: uuidv4(),
      timestamp: Date.now(),
      price: quoteSummary.price,
      peg: quoteSummary.peg,
      companyUuid: company.uuid,
    };

    return this.companyStatesRepository.create(companyState);
  }

  deleteByCompanyUuid(companyUuid: string): Promise<void> {
    return this.companyStatesRepository.deleteByCompanyUuid(companyUuid);
  }
}
