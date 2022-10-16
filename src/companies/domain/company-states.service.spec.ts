import { faker } from '@faker-js/faker';
import { IFinancialDataClient } from '../datasources/financial-data.client.interface';
import { CompanyStatesRepository } from '../repositories/company-states.repository';
import { CompanyStatesService } from './company-states.service';
import { companyStateFactory } from './entities/__tests__/company-state.factory';
import { companyFactory } from './entities/__tests__/company.factory';
import { quoteSummaryFactory } from './entities/__tests__/quote-summary.factory';

describe('CompanyStatesService', () => {
  const mockedCompanyStatesRepository = jest.mocked({
    create: jest.fn(),
    deleteByCompanyUuid: jest.fn(),
    getLastByCompanyUuids: jest.fn(),
  } as unknown as CompanyStatesRepository);

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
      const companyUuids = [faker.datatype.uuid(), faker.datatype.uuid()];

      await service.getLastStateByCompanyUuids(companyUuids);

      expect(
        mockedCompanyStatesRepository.getLastByCompanyUuids,
      ).toBeCalledTimes(1);
      expect(
        mockedCompanyStatesRepository.getLastByCompanyUuids,
      ).toHaveBeenCalledWith(companyUuids);
    });
  });

  describe('deletion', () => {
    it('should call repository for deletion', async () => {
      const companyUuid = faker.datatype.uuid();

      service.deleteByCompanyUuid(companyUuid);

      expect(
        mockedCompanyStatesRepository.deleteByCompanyUuid,
      ).toHaveBeenCalledWith(companyUuid);
    });
  });
});
