import { faker } from '@faker-js/faker';
import { positionFactory } from '../../portfolios/domain/entities/__tests__/position.factory';
import { PositionsRepository } from '../../portfolios/repositories/positions.repository';
import { CompaniesRepository } from '../repositories/companies.repository';
import { CreateCompanyDto } from '../routes/dto/create-company.dto';
import { CompaniesService } from './companies.service';
import { CompanyStatesService } from './company-states.service';
import { companyFactory } from './entities/__tests__/company.factory';

describe('CompaniesService', () => {
  const mockedCompaniesRepository = jest.mocked({
    create: jest.fn(),
    deleteOne: jest.fn(),
    findOne: jest.fn(),
    findBySymbol: jest.fn(),
  } as unknown as CompaniesRepository);

  const mockedPositionsRepository = jest.mocked({
    create: jest.fn(),
    deleteByCompanyUuid: jest.fn(),
    findBySymbol: jest.fn(),
    findByCompanyUuid: jest.fn(),
  } as unknown as PositionsRepository);

  const mockedCompanyStateService = jest.mocked({
    createCompanyState: jest.fn(),
  } as unknown as CompanyStatesService);

  const service = new CompaniesService(
    mockedCompaniesRepository,
    mockedPositionsRepository,
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

    it('should create a CompanyState when creating a company', async () => {
      const company = companyFactory();
      const dto = <CreateCompanyDto>{
        symbol: faker.finance.currencyCode(),
        name: faker.company.name(),
      };
      mockedCompaniesRepository.findBySymbol.mockResolvedValue(null);
      mockedCompaniesRepository.create.mockResolvedValue(company);

      const created = await service.create(dto);

      expect(created).toEqual(company);
      expect(mockedCompanyStateService.createCompanyState).toBeCalledTimes(1);
      expect(mockedCompanyStateService.createCompanyState).toBeCalledWith(
        company,
      );
    });
  });

  describe('deletion', () => {
    it('should fail if positions associated with the company exist', async () => {
      const company = companyFactory();
      const position = positionFactory();
      mockedCompaniesRepository.findOne.mockResolvedValue(company);
      mockedPositionsRepository.findByCompanyUuid.mockResolvedValue([position]);

      await expect(service.remove(company.uuid)).rejects.toThrow(
        `Positions for company ${company.symbol} still exist`,
      );
    });

    it('should delete company states when deleting a company', async () => {
      const company = companyFactory();
      mockedCompaniesRepository.findOne.mockResolvedValue(company);
      mockedPositionsRepository.findByCompanyUuid.mockResolvedValue([]);

      const deleted = await service.remove(company.uuid);

      expect(deleted).toEqual(company);
      expect(
        mockedPositionsRepository.deleteByCompanyUuid,
      ).toHaveBeenCalledWith(company.uuid);
      expect(mockedCompaniesRepository.deleteOne).toHaveBeenCalledWith(
        company.uuid,
      );
    });
  });
});
