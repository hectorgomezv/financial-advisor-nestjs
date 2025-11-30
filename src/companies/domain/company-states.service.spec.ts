import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';
import { IFinancialDataClient } from '../datasources/financial-data.client.interface';
import { companyStateFactory } from '../domain/entities/__tests__/company-state.factory';
import { companyFactory } from '../domain/entities/__tests__/company.factory';
import { quoteSummaryFactory } from '../domain/entities/__tests__/quote-summary.factory';
import { CompanyStatesPgRepository } from '../repositories/company-states.pg.repository';
import { CompanyStatesService } from './company-states.service';

describe('CompanyStatesService', () => {
  const mockedCompanyStatesRepository = jest.mocked({
    create: jest.fn(),
    deleteByCompanyId: jest.fn(),
    getLastByCompanyIds: jest.fn(),
  } as unknown as CompanyStatesPgRepository);

  const mockedFinancialDataClient = jest.mocked({
    getQuoteSummary: jest.fn(),
  } as unknown as IFinancialDataClient);

  const service = new CompanyStatesService(
    mockedCompanyStatesRepository,
    mockedFinancialDataClient,
  );

  describe('creation', () => {
    it('should call financial data client and repository to persist state', async () => {
      const company = companyFactory();
      const quoteSummary = quoteSummaryFactory();
      const timestamp = new Date();
      const companyState = companyStateFactory(
        1,
        timestamp,
        new Decimal(12.34),
        new Decimal(56.78),
        new Decimal(9.01),
        'EUR',
        2,
        new Decimal(5.67),
        new Decimal(0.12),
        new Decimal(3.45),
      );
      mockedFinancialDataClient.getQuoteSummary.mockResolvedValue(quoteSummary);
      mockedCompanyStatesRepository.create.mockResolvedValue(companyState);

      const created = await service.createCompanyState(company);

      expect(mockedFinancialDataClient.getQuoteSummary).toHaveBeenCalledWith(
        company.symbol,
      );
      expect(mockedCompanyStatesRepository.create).toHaveBeenCalledTimes(1);
      expect(created).toEqual({
        id: 1,
        timestamp: new Date(timestamp),
        companyId: 2,
        currency: 'EUR',
        enterpriseToEbitda: '0.12',
        enterpriseToRevenue: '5.67',
        forwardPE: '56.78',
        price: '12.34',
        profitMargins: '9.01',
        shortPercentOfFloat: '3.45',
      });
    });
  });

  describe('retrieving', () => {
    it('should call repository to obtain the last states for an array of company uuids', async () => {
      const companyIds = [faker.number.int(), faker.number.int()];
      mockedCompanyStatesRepository.getLastByCompanyIds.mockResolvedValue([]);

      await service.getLastByCompanyIds(companyIds);

      expect(
        mockedCompanyStatesRepository.getLastByCompanyIds,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedCompanyStatesRepository.getLastByCompanyIds,
      ).toHaveBeenCalledWith(companyIds);
    });
  });
});
