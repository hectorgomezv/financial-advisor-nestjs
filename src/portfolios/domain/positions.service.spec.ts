import { CompaniesPgRepository } from '../../companies/repositories/companies.pg.repository';
import { CompanyStatesPgRepository } from '../../companies/repositories/company-states.pg.repository';
import { CurrencyExchangeClient } from '../datasources/currency-exchange.client';
import { PortfoliosPgRepository } from '../repositories/portfolios.pg.repository';
import { PositionsPgRepository } from '../repositories/positions.pg.repository';
import { PortfolioStatesService } from './portfolio-states.service';
import { PositionsService } from './positions.service';

describe('PositionsService', () => {
  const positionsRepository = {} as unknown as PositionsPgRepository;
  const portfoliosRepository = {} as unknown as PortfoliosPgRepository;
  const portfolioStatesService = {} as unknown as PortfolioStatesService;
  const companiesRepository = {} as unknown as CompaniesPgRepository;
  const companyStatesRepository = {} as unknown as CompanyStatesPgRepository;
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
