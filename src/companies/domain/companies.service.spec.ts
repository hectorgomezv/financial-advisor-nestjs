import { faker } from '@faker-js/faker';
import { CompaniesRepository } from '../repositories/companies.repository';
import { CreateCompanyDto } from '../routes/dto/create-company.dto';
import { CompaniesService } from './companies.service';
import { CompanyStatesService } from './company-states.service';
import { companyFactory } from './entities/__tests__/company.factory';

describe('CompaniesService', () => {
  const mockedCompaniesRepository = jest.mocked({
    findBySymbol: jest.fn(),
  } as unknown as CompaniesRepository);

  const mockedCompanyStateService = jest.mocked({
    createCompanyState: jest.fn(),
  } as unknown as CompanyStatesService);

  const service = new CompaniesService(
    mockedCompaniesRepository,
    mockedCompanyStateService,
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
