import { faker } from '@faker-js/faker';
import { describe, expect, it, vi } from 'vitest';
import { IFinancialDataClient } from '../datasources/financial-data.client.interface.js';
import { companyStateFactory } from '../domain/entities/__tests__/company-state.factory.js';
import { companyFactory } from '../domain/entities/__tests__/company.factory.js';
import { quoteSummaryFactory } from '../domain/entities/__tests__/quote-summary.factory.js';
import { CompanyStatesRepository } from '../repositories/company-states.repository.js';
import { CompanyStatesService } from './company-states.service.js';

describe('CompanyStatesService', () => {
  const mockedCompanyStatesRepository = vi.mocked({
    create: vi.fn(),
    deleteByCompanyUuid: vi.fn(),
    getLastByCompanyUuids: vi.fn(),
  } as unknown as CompanyStatesRepository);

  const mockedFinancialDataClient = vi.mocked({
    getQuoteSummary: vi.fn(),
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
      const companyUuids = [faker.string.uuid(), faker.string.uuid()];

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
      const companyUuid = faker.string.uuid();

      service.deleteByCompanyUuid(companyUuid);

      expect(
        mockedCompanyStatesRepository.deleteByCompanyUuid,
      ).toHaveBeenCalledWith(companyUuid);
    });
  });
});
