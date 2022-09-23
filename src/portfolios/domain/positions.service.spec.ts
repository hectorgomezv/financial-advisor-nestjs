import { CompaniesRepository } from '../../companies/repositories/companies.repository';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { PositionsRepository } from '../repositories/positions.repository';
import { PositionsService } from './positions.service';

describe('PositionsService', () => {
  const positionsRepository = {} as unknown as PositionsRepository;
  const portfoliosRepository = {} as unknown as PortfoliosRepository;
  const companiesRepository = {} as unknown as CompaniesRepository;

  const mockedPositionsRepository = jest.mocked(positionsRepository);
  const mockedPortfoliosRepository = jest.mocked(portfoliosRepository);
  const mockedCompaniesRepository = jest.mocked(companiesRepository);

  const service: PositionsService = new PositionsService(
    mockedPositionsRepository,
    mockedPortfoliosRepository,
    mockedCompaniesRepository,
  );

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
