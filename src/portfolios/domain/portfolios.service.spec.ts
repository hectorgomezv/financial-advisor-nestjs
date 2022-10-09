import { faker } from '@faker-js/faker';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioDetailDto } from './dto/portfolio-detail.dto';
import { positionDetailDtoFactory } from './dto/test/position-detail-dto.factory';
import { portfolioFactory } from './entities/__tests__/porfolio.factory';
import { portfolioAverageMetricFactory } from './entities/__tests__/portfolio-average-metric.factory';
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
  } as unknown as PortfoliosRepository);

  const portfolioStatesService = jest.mocked({
    getLastByPortfolioUuid: jest.fn(),
    deleteByPortfolioUuid: jest.fn(),
    getSeriesForRange: jest.fn(),
  } as unknown as PortfolioStatesService);

  const positionsService = jest.mocked({
    getPositionDetailsByPortfolioUuid: jest.fn(),
    deleteByPortfolioUuid: jest.fn(),
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
        created: portfolio.created,
        positions,
        state,
      });
    });

    it("should fail if the portfolio don't exist when getting metrics from repository", async () => {
      portfoliosRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.getMetrics(faker.datatype.uuid(), faker.random.word()),
      ).rejects.toThrow('Portfolio not found');
    });

    it('should call repository to get portfolio metrics', async () => {
      const portfolio = portfolioFactory();
      const portfolioAverageMetrics = [
        portfolioAverageMetricFactory(),
        portfolioAverageMetricFactory(),
      ];
      portfoliosRepository.findOne.mockResolvedValueOnce(portfolio);
      portfolioStatesService.getSeriesForRange.mockResolvedValueOnce(
        portfolioAverageMetrics,
      );

      const metrics = await service.getMetrics(
        faker.datatype.uuid(),
        faker.random.word(),
      );

      expect(metrics).toEqual(portfolioAverageMetrics);
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
