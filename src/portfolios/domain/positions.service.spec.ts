import { describe, expect, it, vi } from 'vitest';
import { CompaniesRepository } from '../../companies/repositories/companies.repository.js';
import { CompanyStatesRepository } from '../../companies/repositories/company-states.repository.js';
import { CurrencyExchangeClient } from '../datasources/currency-exchange.client.js';
import { PortfoliosRepository } from '../repositories/portfolios.repository.js';
import { PositionsRepository } from '../repositories/positions.repository.js';
import { PortfolioStatesService } from './portfolio-states.service.js';
import { PositionsService } from './positions.service.js';

describe('PositionsService', () => {
  const positionsRepository = {} as unknown as PositionsRepository;
  const portfoliosRepository = {} as unknown as PortfoliosRepository;
  const portfolioStatesService = {} as unknown as PortfolioStatesService;
  const companiesRepository = {} as unknown as CompaniesRepository;
  const companyStatesRepository = {} as unknown as CompanyStatesRepository;
  const exchangeClient = {} as unknown as CurrencyExchangeClient;

  const mockedPositionsRepository = vi.mocked(positionsRepository);
  const mockedPortfoliosRepository = vi.mocked(portfoliosRepository);
  const mockedPortfolioStatesService = vi.mocked(portfolioStatesService);
  const mockedCompaniesRepository = vi.mocked(companiesRepository);
  const mockedCompanyStatesRepository = vi.mocked(companyStatesRepository);
  const mockedExchangeClient = vi.mocked(exchangeClient);

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
