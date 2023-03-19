import { faker } from '@faker-js/faker';
import { sortBy } from 'lodash';
import { AuthService } from '../../common/auth/auth-service';
import { User, UserRole } from '../../common/auth/entities/user.entity';
import { positionFactory } from '../../portfolios/domain/entities/__tests__/position.factory';
import { PositionsRepository } from '../../portfolios/repositories/positions.repository';
import { CompaniesRepository } from '../repositories/companies.repository';
import { CreateCompanyDto } from '../routes/dto/create-company.dto';
import { CompaniesService } from './companies.service';
import { CompanyStatesService } from './company-states.service';
import { companyStateFactory } from './entities/__tests__/company-state.factory';
import { companyFactory } from './entities/__tests__/company.factory';

describe('CompaniesService', () => {
  const mockedCompaniesRepository = jest.mocked({
    create: jest.fn(),
    deleteOne: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySymbol: jest.fn(),
  } as unknown as CompaniesRepository);

  const mockedPositionsRepository = jest.mocked({
    create: jest.fn(),
    findBySymbol: jest.fn(),
    findByCompanyUuid: jest.fn(),
  } as unknown as PositionsRepository);

  const mockedCompanyStateService = jest.mocked({
    createCompanyState: jest.fn(),
    deleteByCompanyUuid: jest.fn(),
    getLastStateByCompanyUuid: jest.fn(),
    getLastStateByCompanyUuids: jest.fn(),
  } as unknown as CompanyStatesService);

  const service = new CompaniesService(
    mockedCompaniesRepository,
    mockedPositionsRepository,
    new AuthService(),
    mockedCompanyStateService,
  );

  const adminUser = <User>{
    id: faker.datatype.uuid(),
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
      const state = companyStateFactory();
      const dto = <CreateCompanyDto>{
        symbol: faker.finance.currencyCode(),
        name: faker.company.name(),
      };
      mockedCompaniesRepository.findBySymbol.mockResolvedValue(null);
      mockedCompaniesRepository.create.mockResolvedValue(company);
      mockedCompanyStateService.createCompanyState.mockResolvedValue(state);

      const actual = await service.create(adminUser, dto);

      expect(actual).toEqual({ ...company, state });
      expect(mockedCompanyStateService.createCompanyState).toBeCalledTimes(1);
      expect(mockedCompanyStateService.createCompanyState).toBeCalledWith(
        company,
      );
    });
  });

  describe('retrieving', () => {
    it('should retrieve all the companies and merge their states', async () => {
      const companies = [companyFactory(), companyFactory()];
      const states = [
        companyStateFactory(
          faker.datatype.uuid(),
          Date.now(),
          faker.datatype.number(),
          faker.datatype.number(),
          faker.finance.currencyCode(),
          companies[1].uuid,
        ),
        companyStateFactory(
          faker.datatype.uuid(),
          Date.now(),
          faker.datatype.number(),
          faker.datatype.number(),
          faker.finance.currencyCode(),
          companies[0].uuid,
        ),
      ];
      mockedCompaniesRepository.findAll.mockResolvedValue(companies);
      mockedCompanyStateService.getLastStateByCompanyUuids.mockResolvedValue(
        states,
      );

      const actual = await service.findAll();

      const expected = sortBy(
        [
          {
            ...companies[0],
            state: states[1],
          },
          {
            ...companies[1],
            state: states[0],
          },
        ],
        'symbol',
      );
      expect(actual).toEqual(expected);
      expect(mockedCompaniesRepository.findAll).toHaveBeenCalledTimes(1);
      expect(
        mockedCompanyStateService.getLastStateByCompanyUuids,
      ).toHaveBeenCalledTimes(1);
    });

    it('should call repository for retrieving a company', async () => {
      const company = companyFactory();
      const state = companyStateFactory();
      mockedCompaniesRepository.findOne.mockResolvedValue(company);
      mockedCompanyStateService.getLastStateByCompanyUuid.mockResolvedValue(
        state,
      );

      const actual = await service.findOne(company.uuid);

      expect(actual).toEqual({ ...company, state });
      expect(mockedCompaniesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(
        mockedCompanyStateService.getLastStateByCompanyUuid,
      ).toHaveBeenCalledTimes(1);
    });

    it('should fail if a company cannot be found by uuid', async () => {
      const companyUuid = faker.datatype.uuid();
      mockedCompaniesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(companyUuid)).rejects.toThrow(
        'Company not found',
      );

      expect(mockedCompaniesRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('deletion', () => {
    it('should fail if the requestor is not an admin', async () => {
      const user = { ...adminUser, role: UserRole.USER };
      const companyUuid = faker.datatype.uuid();

      await expect(service.remove(user, companyUuid)).rejects.toThrow(
        'Access denied',
      );
    });

    it('should fail if a company cannot be found by uuid', async () => {
      const companyUuid = faker.datatype.uuid();
      mockedCompaniesRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(adminUser, companyUuid)).rejects.toThrow(
        'Company not found',
      );

      expect(mockedCompaniesRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should fail if positions associated with the company exist', async () => {
      const company = companyFactory();
      const position = positionFactory();
      mockedCompaniesRepository.findOne.mockResolvedValue(company);
      mockedPositionsRepository.findByCompanyUuid.mockResolvedValue([position]);

      await expect(service.remove(adminUser, company.uuid)).rejects.toThrow(
        `Positions for company ${company.symbol} still exist`,
      );
    });

    it('should delete company states when deleting a company', async () => {
      const company = companyFactory();
      mockedCompaniesRepository.findOne.mockResolvedValue(company);
      mockedPositionsRepository.findByCompanyUuid.mockResolvedValue([]);

      const deleted = await service.remove(adminUser, company.uuid);

      expect(deleted).toEqual(company);
      expect(
        mockedCompanyStateService.deleteByCompanyUuid,
      ).toHaveBeenCalledWith(company.uuid);
      expect(mockedCompaniesRepository.deleteOne).toHaveBeenCalledWith(
        company.uuid,
      );
    });
  });
});
