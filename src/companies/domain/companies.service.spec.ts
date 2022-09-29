import { faker } from '@faker-js/faker';
import { FinancialDataClient } from '../datasources/financial-data.client.interface';
import { CompaniesRepository } from '../repositories/companies.repository';
import { CompanyStatesRepository } from '../repositories/company-states.repository';
import { CreateCompanyDto } from '../routes/dto/create-company.dto';
import { CompaniesService } from './companies.service';
import { companyFactory } from './entities/__tests__/company.factory';

describe('CompaniesService', () => {
  const mockedCompaniesRepository = jest.mocked({
    findBySymbol: jest.fn(),
  } as unknown as CompaniesRepository);

  const mockedCompanyStatesRepository = jest.mocked({
    create: jest.fn(),
  } as unknown as CompanyStatesRepository);

  const mockedFinancialDataClient = jest.mocked({
    getQuoteSummary: jest.fn(),
  } as unknown as FinancialDataClient);

  const service: CompaniesService = new CompaniesService(
    mockedCompaniesRepository,
    mockedCompanyStatesRepository,
    mockedFinancialDataClient,
  );

  describe('creation', () => {
    it('should fail if the symbol exists', async () => {
      const company = companyFactory();
      const dto = <CreateCompanyDto>{
        symbol: faker.finance.currencyCode(),
        name: faker.company.name(),
      };
      mockedCompaniesRepository.findBySymbol.mockResolvedValue(company);

      await expect(service.create(dto)).rejects.toThrow(
        `Company ${company.symbol} already exists`,
      );
    });
  });
});
