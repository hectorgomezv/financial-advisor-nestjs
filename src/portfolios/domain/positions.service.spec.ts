import { CompaniesRepository } from '../../companies/repositories/companies.repository';
import { CompanyStatesRepository } from '../../companies/repositories/company-states.repository';
import { CurrencyExchangeClient } from '../datasources/currency-exchange.client';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { PositionsRepository } from '../repositories/positions.repository';
import { PortfolioStatesService } from './portfolio-states.service';
import { PositionsService } from './positions.service';

describe('PositionsService', () => {
  const positionsRepository = {} as unknown as PositionsRepository;
  const portfoliosRepository = {} as unknown as PortfoliosRepository;
  const portfolioStatesService = {} as unknown as PortfolioStatesService;
  const companiesRepository = {} as unknown as CompaniesRepository;
  const companyStatesRepository = {} as unknown as CompanyStatesRepository;
  const exchangeClient = {} as unknown as CurrencyExchangeClient;

  const mockedPositionsRepository = jest.mocked(positionsRepository);
  const mockedPortfoliosRepository = jest.mocked(portfoliosRepository);
  const mockedPortfolioStatesService = jest.mocked(portfolioStatesService);
  const mockedCompaniesRepository = jest.mocked(companiesRepository);
  const mockedCompanyStatesRepository = jest.mocked(companyStatesRepository);
  const mockedExchangeClient = jest.mocked(exchangeClient);

  const service: PositionsService = new PositionsService(
    mockedPositionsRepository,
    mockedPortfoliosRepository,
    mockedPortfolioStatesService,
    mockedCompaniesRepository,
    mockedCompanyStatesRepository,
    mockedExchangeClient,
  );

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
