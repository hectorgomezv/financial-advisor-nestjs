import { faker } from '@faker-js/faker';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioDetailDto } from './dto/portfolio-detail.dto';
import { addPortfolioContributionDtoFactory } from './dto/test/add-portfolio-contribution.dto.factory';
import { positionDetailDtoFactory } from './dto/test/position-detail-dto.factory';
import { updatePortfolioCashDtoFactory } from './dto/test/update-portfolio-cash.dto.factory';
import { portfolioFactory } from './entities/__tests__/porfolio.factory';
import { portfolioAverageBalanceFactory } from './entities/__tests__/portfolio-average-metric.factory';
import { portfolioStateFactory } from './entities/__tests__/portfolio-state.factory';
import { PortfolioStatesService } from './portfolio-states.service';
import { PortfoliosService } from './portfolios.service';
import { PositionsService } from './positions.service';

describe('PortfoliosService', () => {
  const portfoliosRepository = jest.mocked({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
    updateCash: jest.fn(),
    addContribution: jest.fn(),
  } as unknown as PortfoliosRepository);

  const portfolioStatesService = jest.mocked({
    getLastByPortfolioUuid: jest.fn(),
    deleteByPortfolioUuid: jest.fn(),
    getAverageBalancesForRange: jest.fn(),
  } as unknown as PortfolioStatesService);

  const positionsService = jest.mocked({
    getPositionDetailsByPortfolioUuid: jest.fn(),
    deleteByPortfolioUuid: jest.fn(),
    updatePortfolioState: jest.fn(),
  } as unknown as PositionsService);

  const service: PortfoliosService = new PortfoliosService(
    portfoliosRepository,
    portfolioStatesService,
    positionsService,
  );

  describe('creation', () => {
    it('should call repository for creation with the right values', async () => {
      const portfolio = portfolioFactory();
      const dto = <CreatePortfolioDto>{
        name: faker.random.words(),
        seed: Number(faker.finance.amount()),
      };
      portfoliosRepository.create.mockResolvedValueOnce(portfolio);

      const created = await service.create(dto);

      expect(created).toBe(portfolio);
      expect(portfoliosRepository.create).toHaveBeenCalledTimes(1);
      expect(portfoliosRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: dto.name, positions: [], state: null }),
      );
    });
  });

  describe('retrieving', () => {
    it('should call repository for retrieving all the portfolios', async () => {
      const portfolios = [portfolioFactory(), portfolioFactory()];
      portfoliosRepository.findAll.mockResolvedValueOnce(portfolios);

      const retrieved = await service.findAll();

      expect(retrieved).toBe(portfolios);
      expect(portfoliosRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should fail if the portfolio don't exist", async () => {
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(faker.datatype.uuid())).rejects.toThrow(
        'Portfolio not found',
      );
    });

    it('should call repository for retrieving one portfolio with its positions', async () => {
      const portfolio = portfolioFactory();
      const positions = [
        positionDetailDtoFactory(),
        positionDetailDtoFactory(),
      ];
      const state = portfolioStateFactory();
      portfoliosRepository.findOne.mockResolvedValueOnce(portfolio);
      positionsService.getPositionDetailsByPortfolioUuid.mockResolvedValueOnce(
        positions,
      );
      portfolioStatesService.getLastByPortfolioUuid.mockResolvedValueOnce(
        state,
      );

      const retrieved = await service.findOne(portfolio.uuid);

      expect(retrieved).toEqual(<PortfolioDetailDto>{
        uuid: portfolio.uuid,
        name: portfolio.name,
        seed: portfolio.seed,
        cash: portfolio.cash,
        created: portfolio.created,
        contributions: portfolio.contributions,
        positions,
        state,
      });
    });

    it("should fail if the portfolio don't exist when getting metrics from repository", async () => {
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.getAverageBalances(faker.datatype.uuid(), faker.random.word()),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repository to get portfolio metrics', async () => {
      const portfolio = portfolioFactory();
      const portfolioAverageBalances = [
        portfolioAverageBalanceFactory(),
        portfolioAverageBalanceFactory(),
      ];
      portfoliosRepository.findOne.mockResolvedValueOnce(portfolio);
      portfolioStatesService.getAverageBalancesForRange.mockResolvedValueOnce(
        portfolioAverageBalances,
      );

      const metrics = await service.getAverageBalances(
        faker.datatype.uuid(),
        faker.random.word(),
      );

      expect(metrics).toEqual(portfolioAverageBalances);
    });
  });

  describe('update', () => {
    it('should fail if the portfolio does not exist when updating cash', async () => {
      const dto = updatePortfolioCashDtoFactory();
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.updateCash(faker.datatype.uuid(), dto),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repo to update cash', async () => {
      const uuid = faker.datatype.uuid();
      const dto = updatePortfolioCashDtoFactory();
      const portfolio = portfolioFactory();
      portfoliosRepository.findOne.mockResolvedValueOnce(portfolio);

      const actual = await service.updateCash(uuid, dto);

      expect(actual).toEqual({ ...portfolio, cash: dto.cash });
      expect(portfoliosRepository.updateCash).toHaveBeenCalledWith(
        uuid,
        dto.cash,
      );
      expect(positionsService.updatePortfolioState).toBeCalledWith({
        ...portfolio,
        cash: dto.cash,
      });
    });

    it('should fail if the portfolio does not exist when adding a contribution', async () => {
      const dto = addPortfolioContributionDtoFactory();
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.addContribution(faker.datatype.uuid(), dto),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repo to add a contribution', async () => {
      const uuid = faker.datatype.uuid();
      const dto = addPortfolioContributionDtoFactory();
      const portfolio = portfolioFactory();
      const expected = {
        ...portfolio,
        contributions: [
          expect.objectContaining({
            uuid: expect.any(String),
            timestamp: dto.timestamp,
            amountEUR: dto.amountEUR,
          }),
        ],
      };
      portfoliosRepository.findOne.mockResolvedValueOnce(portfolio);
      portfoliosRepository.addContribution.mockResolvedValueOnce(expected);

      const actual = await service.addContribution(uuid, dto);

      expect(actual).toEqual(expected);
      expect(portfoliosRepository.addContribution).toHaveBeenCalledWith(uuid, {
        uuid: expect.any(String),
        timestamp: dto.timestamp,
        amountEUR: dto.amountEUR,
      });
      expect(positionsService.updatePortfolioState).toBeCalledWith(expected);
    });
  });

  describe('deletion', () => {
    it("should fail if the portfolio don't exist", async () => {
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.deleteOne(faker.datatype.uuid())).rejects.toThrow(
        'Portfolio not found',
      );
    });

    it('should delete the portfolio and its positions and states', async () => {
      const portfolio = portfolioFactory();
      portfoliosRepository.findOne.mockResolvedValueOnce(portfolio);

      await service.deleteOne(portfolio.uuid);

      expect(positionsService.deleteByPortfolioUuid).toHaveBeenCalledTimes(1);
      expect(
        portfolioStatesService.deleteByPortfolioUuid,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
