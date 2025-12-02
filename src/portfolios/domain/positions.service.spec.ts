import { ConflictException, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { User } from '../../common/auth/entities/user.entity';
import { CompaniesRepository } from '../../companies/repositories/companies.repository';
import { CompanyStatesRepository } from '../../companies/repositories/company-states.repository';
import { CurrencyExchangeClient } from '../datasources/currency-exchange.client';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { PositionsRepository } from '../repositories/positions.repository';
import { UpsertPositionDto } from './dto/upsert-position.dto';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioStatesService } from './portfolio-states.service';
import { PositionsService } from './positions.service';
import { Position } from './entities/position.entity';

describe('PositionsService', () => {
  const mPositionsRepository = jest.mocked({} as PositionsRepository);
  const mPortfoliosRepository = jest.mocked({} as PortfoliosRepository);
  const mPortfolioStatesService = jest.mocked({} as PortfolioStatesService);
  const mCompaniesRepository = jest.mocked({} as CompaniesRepository);
  const mCompanyStatesRepository = jest.mocked({} as CompanyStatesRepository);
  const mExchangeClient = jest.mocked({} as CurrencyExchangeClient);

  const service: PositionsService = new PositionsService(
    mPositionsRepository,
    mPortfoliosRepository,
    mPortfolioStatesService,
    mCompaniesRepository,
    mCompanyStatesRepository,
    mExchangeClient,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('should throw not found exception when portfolio does not exist', async () => {
      const user = { id: 1 } as unknown as User;
      const portfolioId = 1;
      const upsertPositionDto = {
        symbol: 'AAPL',
        targetWeight: new Decimal(5),
        shares: new Decimal(10),
      } as UpsertPositionDto;
      mPortfoliosRepository.findById = jest.fn().mockResolvedValue(null);
      mCompaniesRepository.findBySymbol = jest
        .fn()
        .mockResolvedValue({ id: 1, symbol: upsertPositionDto.symbol });

      await expect(
        service.update(user, portfolioId, upsertPositionDto),
      ).rejects.toThrow(
        new NotFoundException('Invalid reference for position'),
      );
    });

    it('should throw not found exception when company does not exist', async () => {
      const user = { id: 1 } as unknown as User;
      const portfolioId = 1;
      const upsertPositionDto = {
        symbol: 'AAPL',
        targetWeight: new Decimal(5),
        shares: new Decimal(10),
      } as UpsertPositionDto;
      mPortfoliosRepository.findById = jest
        .fn()
        .mockResolvedValue({ id: portfolioId, ownerId: user.id } as Portfolio);
      mCompaniesRepository.findBySymbol = jest.fn().mockResolvedValue(null);

      await expect(
        service.update(user, portfolioId, upsertPositionDto),
      ).rejects.toThrow(
        new NotFoundException('Invalid reference for position'),
      );
    });

    it('should throw conflict exception when position does not exist', async () => {
      const user = { id: 1 } as unknown as User;
      const portfolioId = 1;
      const upsertPositionDto = {
        symbol: 'AAPL',
        targetWeight: new Decimal(5),
        shares: new Decimal(10),
      } as UpsertPositionDto;
      mPortfoliosRepository.findById = jest
        .fn()
        .mockResolvedValue({ id: portfolioId, ownerId: user.id } as Portfolio);
      mCompaniesRepository.findBySymbol = jest
        .fn()
        .mockResolvedValue({ id: 1, symbol: upsertPositionDto.symbol });
      mPositionsRepository.findByCompanyIdAndPortfolioId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        service.update(user, portfolioId, upsertPositionDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should update the position but not sharesUpdatedAt', async () => {
      const user = { id: 1 } as unknown as User;
      const portfolioId = 1;
      const upsertPositionDto = {
        symbol: 'AAPL',
        targetWeight: new Decimal(5),
        shares: new Decimal(10),
      } as UpsertPositionDto;
      const originalSharesUpdatedAt = new Date('2024-01-01T00:00:00Z');

      mPortfoliosRepository.findById = jest
        .fn()
        .mockResolvedValue({ id: portfolioId, ownerId: user.id } as Portfolio);
      mCompaniesRepository.findBySymbol = jest
        .fn()
        .mockResolvedValue({ id: 1, symbol: upsertPositionDto.symbol });
      mPositionsRepository.findByCompanyIdAndPortfolioId = jest
        .fn()
        .mockResolvedValue({
          id: 1,
          portfolioId,
          companyId: 1,
          blocked: false,
          shares: new Decimal(10), // existent shares didn't change, so sharesUpdatedAt shouldn't be updated
          sharesUpdatedAt: originalSharesUpdatedAt,
          targetWeight: new Decimal(2),
          value: new Decimal(100),
        } as Position);
      mPositionsRepository.update = jest.fn().mockResolvedValue(undefined);
      mPositionsRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        portfolioId,
        companyId: 1,
        blocked: false,
        shares: new Decimal(10),
        sharesUpdatedAt: new Date(),
        targetWeight: new Decimal(5),
        value: new Decimal(100),
      } as Position);
      mPositionsRepository.findByPortfolioId = jest.fn().mockResolvedValue([]);
      mCompaniesRepository.findById = jest
        .fn()
        .mockResolvedValue({ id: 1, symbol: upsertPositionDto.symbol });
      mExchangeClient.getFx = jest
        .fn()
        .mockResolvedValue(jest.fn().mockResolvedValue(new Decimal(1)));
      mCompanyStatesRepository.getLastByCompanyId = jest
        .fn()
        .mockResolvedValue({ price: new Decimal(15) });
      mPortfolioStatesService.createPortfolioState = jest
        .fn()
        .mockResolvedValue({
          totalValueEUR: new Decimal(1000),
          roicEUR: new Decimal(3),
        });
      mCompaniesRepository.findByIdIn = jest
        .fn()
        .mockResolvedValue([{ id: 1, symbol: upsertPositionDto.symbol }]);

      const actual = await service.update(user, portfolioId, upsertPositionDto);

      expect(actual).toEqual({
        id: 1,
        portfolioId,
        companyId: 1,
        blocked: false,
        shares: new Decimal(10),
        sharesUpdatedAt: expect.any(Date),
        targetWeight: new Decimal(5),
        value: new Decimal(100),
      });
      expect(mPositionsRepository.update).toHaveBeenCalledWith(1, {
        targetWeight: upsertPositionDto.targetWeight,
        shares: upsertPositionDto.shares,
        blocked: false,
        sharesUpdatedAt: originalSharesUpdatedAt, // key check
        value: new Decimal(0),
      });
    });

    it('should update the position but not sharesUpdatedAt', async () => {
      const user = { id: 1 } as unknown as User;
      const portfolioId = 1;
      const upsertPositionDto = {
        symbol: 'AAPL',
        targetWeight: new Decimal(5),
        shares: new Decimal(10),
      } as UpsertPositionDto;
      const originalSharesUpdatedAt = new Date('2024-01-01T00:00:00Z');

      mPortfoliosRepository.findById = jest
        .fn()
        .mockResolvedValue({ id: portfolioId, ownerId: user.id } as Portfolio);
      mCompaniesRepository.findBySymbol = jest
        .fn()
        .mockResolvedValue({ id: 1, symbol: upsertPositionDto.symbol });
      mPositionsRepository.findByCompanyIdAndPortfolioId = jest
        .fn()
        .mockResolvedValue({
          id: 1,
          portfolioId,
          companyId: 1,
          blocked: false,
          shares: new Decimal(11), // existent shares DID change, so sharesUpdatedAt should be updated
          sharesUpdatedAt: originalSharesUpdatedAt,
          targetWeight: new Decimal(2),
          value: new Decimal(100),
        } as Position);
      mPositionsRepository.update = jest.fn().mockResolvedValue(undefined);
      mPositionsRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        portfolioId,
        companyId: 1,
        blocked: false,
        shares: new Decimal(10),
        sharesUpdatedAt: new Date(),
        targetWeight: new Decimal(5),
        value: new Decimal(100),
      } as Position);
      mPositionsRepository.findByPortfolioId = jest.fn().mockResolvedValue([]);
      mCompaniesRepository.findById = jest
        .fn()
        .mockResolvedValue({ id: 1, symbol: upsertPositionDto.symbol });
      mExchangeClient.getFx = jest
        .fn()
        .mockResolvedValue(jest.fn().mockResolvedValue(new Decimal(1)));
      mCompanyStatesRepository.getLastByCompanyId = jest
        .fn()
        .mockResolvedValue({ price: new Decimal(15) });
      mPortfolioStatesService.createPortfolioState = jest
        .fn()
        .mockResolvedValue({
          totalValueEUR: new Decimal(1000),
          roicEUR: new Decimal(3),
        });
      mCompaniesRepository.findByIdIn = jest
        .fn()
        .mockResolvedValue([{ id: 1, symbol: upsertPositionDto.symbol }]);

      const actual = await service.update(user, portfolioId, upsertPositionDto);

      expect(actual).toEqual({
        id: 1,
        portfolioId,
        companyId: 1,
        blocked: false,
        shares: new Decimal(10),
        sharesUpdatedAt: expect.any(Date),
        targetWeight: new Decimal(5),
        value: new Decimal(100),
      });
      const actualDate =
        mPositionsRepository.update.mock.calls[0][1].sharesUpdatedAt.getTime();
      expect(Date.now() - actualDate).toBeLessThanOrEqual(1_000); // less than 1 second difference
    });
  });
});
