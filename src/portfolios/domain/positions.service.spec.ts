import { CompaniesRepository } from '../../companies/repositories/companies.repository';
import { PositionsRepository } from '../repositories/positions.repository';
import { PositionsService } from './positions.service';

describe('PositionsService', () => {
  const positionsRepository = {} as unknown as PositionsRepository;
  const companiesRepository = {} as unknown as CompaniesRepository;

  const mockedPositionsRepository = jest.mocked(positionsRepository);
  const mockedCompaniesRepository = jest.mocked(companiesRepository);

  const service: PositionsService = new PositionsService(
    mockedPositionsRepository,
    mockedCompaniesRepository,
  );

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
