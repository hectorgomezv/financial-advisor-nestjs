import { CompaniesRepository } from '../repositories/companies.repository';
import { CompaniesService } from './companies.service';

describe('CompaniesService', () => {
  const companiesRepository = {} as unknown as CompaniesRepository;
  const mockedCompaniesRepository = jest.mocked(companiesRepository);
  const service: CompaniesService = new CompaniesService(
    mockedCompaniesRepository,
  );

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
