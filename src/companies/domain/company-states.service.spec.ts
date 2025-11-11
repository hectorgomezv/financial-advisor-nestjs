import { faker } from '@faker-js/faker';
import { IFinancialDataClient } from '../datasources/financial-data.client.interface';
import { companyStateFactory } from '../domain/entities/__tests__/company-state.factory';
import { companyFactory } from '../domain/entities/__tests__/company.factory';
import { quoteSummaryFactory } from '../domain/entities/__tests__/quote-summary.factory';
import { CompanyStatesPgRepository } from '../repositories/company-states.pg.repository';
import { CompanyStatesService } from './company-states.service';

describe('CompanyStatesService', () => {
  const mockedCompanyStatesRepository = jest.mocked({
    create: jest.fn(),
    deleteByCompanyUuid: jest.fn(),
    getLastByCompanyUuids: jest.fn(),
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
      const companyState = companyStateFactory();
      mockedFinancialDataClient.getQuoteSummary.mockResolvedValue(quoteSummary);
      mockedCompanyStatesRepository.create.mockResolvedValue(companyState);

      const created = await service.createCompanyState(company);

      expect(mockedFinancialDataClient.getQuoteSummary).toHaveBeenCalledWith(
        company.symbol,
      );
      expect(mockedCompanyStatesRepository.create).toHaveBeenCalledTimes(1);
      expect(created).toEqual(companyState);
    });
  });

  describe('retrieving', () => {
    it('should call repository to obtain the last states for an array of company uuids', async () => {
      const companyIds = [faker.number.int(), faker.number.int()];

      await service.getLastByCompanyIds(companyIds);

      expect(
        mockedCompanyStatesRepository.getLastByCompanyIds,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockedCompanyStatesRepository.getLastByCompanyIds,
      ).toHaveBeenCalledWith(companyIds);
    });
  });

  describe('deletion', () => {
    it('should call repository for deletion', async () => {
      const companyId = faker.number.int();

      service.deleteByCompanyId(companyId);

      expect(
        mockedCompanyStatesRepository.deleteByCompanyId,
      ).toHaveBeenCalledWith(companyId);
    });
  });
});
