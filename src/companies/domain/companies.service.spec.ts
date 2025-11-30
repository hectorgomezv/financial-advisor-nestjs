import { faker } from '@faker-js/faker';
import { sortBy } from 'lodash';
import { AuthService } from '../../common/auth/auth-service';
import { User, UserRole } from '../../common/auth/entities/user.entity';
import { PositionsPgRepository } from '../../portfolios/repositories/positions.pg.repository';
import { CompaniesPgRepository } from '../repositories/companies.pg.repository';
import { CreateCompanyDto } from '../routes/dto/create-company.dto';
import { CompaniesService } from './companies.service';
import { CompanyStatesService } from './company-states.service';
import { companyMetricsResultFactory } from './entities/__tests__/company-metrics-result.factory';
import { companyStateResultFactory } from './entities/__tests__/company-state-result.factory';
import { companyFactory } from './entities/__tests__/company.factory';

describe('CompaniesService', () => {
  const mockedCompaniesRepository = jest.mocked({
    create: jest.fn(),
    deleteById: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySymbol: jest.fn(),
  } as unknown as CompaniesPgRepository);

  const mockedPositionsRepository = jest.mocked({
    existByCompanyId: jest.fn(),
  } as unknown as PositionsPgRepository);

  const mockedCompanyStateService = jest.mocked({
    createCompanyState: jest.fn(),
    deleteByCompanyId: jest.fn(),
    getLastByCompanyId: jest.fn(),
    getLastByCompanyIds: jest.fn(),
    getMetricsByCompanyId: jest.fn(),
  } as unknown as CompanyStatesService);

  const service = new CompaniesService(
    mockedCompaniesRepository,
    new AuthService(),
    mockedCompanyStateService,
    mockedPositionsRepository,
  );

  const adminUser = <User>{
    id: faker.string.uuid(),
    email: faker.internet.email(),
    role: UserRole.ADMIN,
  };

  beforeEach(() => jest.resetAllMocks());

  describe('creation', () => {
    it('should fail if the requestor is not an admin', async () => {
      const user = { ...adminUser, role: UserRole.USER };
      const dto = <CreateCompanyDto>{
        symbol: faker.finance.currencyCode(),
        name: faker.company.name(),
      };

      await expect(service.create(user, dto)).rejects.toThrow(`Access denied`);
    });

    it('should fail if the symbol exists', async () => {
      const company = companyFactory();
      const dto = <CreateCompanyDto>{
        symbol: faker.finance.currencyCode(),
        name: faker.company.name(),
      };
      mockedCompaniesRepository.findBySymbol.mockResolvedValue(company);

      await expect(service.create(adminUser, dto)).rejects.toThrow(
        `Company ${company.symbol} already exists`,
      );
    });

    it('should create a CompanyState when creating a company', async () => {
      const company = companyFactory();
      const state = companyStateResultFactory();
      const dto = <CreateCompanyDto>{
        symbol: faker.finance.currencyCode(),
        name: faker.company.name(),
      };
      mockedCompaniesRepository.findBySymbol.mockResolvedValue(null);
      mockedCompaniesRepository.create.mockResolvedValue(company);
      mockedCompanyStateService.createCompanyState.mockResolvedValue(state);

      const actual = await service.create(adminUser, dto);

      expect(actual).toEqual({ ...company, state });
      expect(
        mockedCompanyStateService.createCompanyState,
      ).toHaveBeenCalledTimes(1);
      expect(mockedCompanyStateService.createCompanyState).toBeCalledWith(
        company,
      );
    });
  });

  describe('retrieving', () => {
    it('should retrieve all the companies and merge their states', async () => {
      const companies = [companyFactory(), companyFactory()];
      const states = [
        companyStateResultFactory(
          faker.number.int(),
          Date.now(),
          faker.number.int(),
          faker.number.int(),
          faker.number.int(),
          faker.finance.currencyCode(),
          companies[1].id,
        ),
        companyStateResultFactory(
          faker.number.int(),
          Date.now(),
          faker.number.int(),
          faker.number.int(),
          faker.number.int(),
          faker.finance.currencyCode(),
          companies[0].id,
        ),
      ];
      const metrics = companyMetricsResultFactory();
      mockedCompaniesRepository.findAll.mockResolvedValue(companies);
      mockedCompanyStateService.getLastByCompanyIds.mockResolvedValue(states);
      mockedCompanyStateService.getMetricsByCompanyId.mockResolvedValue(
        metrics,
      );

      const actual = await service.getCompaniesWithMetricsAndState();

      const expected = sortBy(
        [
          {
            ...companies[0],
            state: states[1],
            metrics,
          },
          {
            ...companies[1],
            state: states[0],
            metrics,
          },
        ],
        'symbol',
      );
      expect(actual).toEqual(expected);
      expect(mockedCompaniesRepository.findAll).toHaveBeenCalledTimes(1);
      expect(
        mockedCompanyStateService.getLastByCompanyIds,
      ).toHaveBeenCalledTimes(1);
    });

    it('should call repository for retrieving a company', async () => {
      const company = companyFactory();
      const state = companyStateResultFactory();
      const metrics = companyMetricsResultFactory();
      mockedCompaniesRepository.findById.mockResolvedValue(company);
      mockedCompanyStateService.getLastByCompanyId.mockResolvedValue(state);
      mockedCompanyStateService.getMetricsByCompanyId.mockResolvedValue(
        metrics,
      );

      const actual = await service.findById(company.id);

      expect(actual).toEqual({ ...company, state, metrics });
      expect(mockedCompaniesRepository.findById).toHaveBeenCalledTimes(1);
      expect(
        mockedCompanyStateService.getLastByCompanyId,
      ).toHaveBeenCalledTimes(1);
    });

    it('should fail if a company cannot be found by id', async () => {
      const companyId = faker.number.int();
      mockedCompaniesRepository.findById.mockResolvedValue(null);

      await expect(service.findById(companyId)).rejects.toThrow(
        'Company not found',
      );

      expect(mockedCompaniesRepository.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('deletion', () => {
    it('should fail if the requestor is not an admin', async () => {
      const user = { ...adminUser, role: UserRole.USER };
      const companyId = faker.number.int();

      await expect(service.remove(user, companyId)).rejects.toThrow(
        'Access denied',
      );
    });

    it('should fail if a company cannot be found by id', async () => {
      const companyId = faker.number.int();
      mockedCompaniesRepository.findById.mockResolvedValue(null);

      await expect(service.remove(adminUser, companyId)).rejects.toThrow(
        'Company not found',
      );

      expect(mockedCompaniesRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should fail if positions fot the company exist', async () => {
      const company = companyFactory();
      mockedCompaniesRepository.findById.mockResolvedValue(company);
      mockedPositionsRepository.existByCompanyId.mockResolvedValue(true);

      await expect(service.remove(adminUser, company.id)).rejects.toThrow(
        `Positions exist for the company ${company.name}`,
      );

      expect(mockedCompaniesRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockedPositionsRepository.existByCompanyId).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
