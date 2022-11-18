import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { isNumber } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioDetailDto } from './dto/portfolio-detail.dto';
import { UpdatePortfolioCashDto } from './dto/update-portfolio-cash.dto';
import { Portfolio } from './entities/portfolio.entity';
import { timeRangeFromStr } from './entities/time-range.enum';
import { PortfolioStatesService } from './portfolio-states.service';
import { PositionsService } from './positions.service';

@Injectable()
export class PortfoliosService {
  private readonly logger = new Logger(PortfoliosService.name);

  constructor(
    private readonly repository: PortfoliosRepository,
    private readonly portfolioStatesService: PortfolioStatesService,
    private readonly positionService: PositionsService,
  ) {}

  create(createPortfolioDto: CreatePortfolioDto): Promise<Portfolio> {
    return this.repository.create(<Portfolio>{
      uuid: uuidv4(),
      name: createPortfolioDto.name,
      created: Date.now(),
      positions: [],
      seed: createPortfolioDto.seed,
      cash: 0,
      contributions: [],
      state: null,
    });
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(uuid: string): Promise<PortfolioDetailDto> {
    const portfolio = await this.repository.findOne(uuid);

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const positions =
      await this.positionService.getPositionDetailsByPortfolioUuid(uuid);
    const state = await this.portfolioStatesService.getLastByPortfolioUuid(
      uuid,
    );

    return <PortfolioDetailDto>{
      uuid,
      name: portfolio.name,
      created: portfolio.created,
      seed: portfolio.seed,
      cash: portfolio.cash,
      contributions: portfolio.contributions,
      positions,
      state,
    };
  }

  async deleteOne(uuid: string) {
    const portfolio = await this.repository.findOne(uuid);

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    await this.positionService.deleteByPortfolioUuid(uuid);
    await this.portfolioStatesService.deleteByPortfolioUuid(uuid);
    await this.repository.deleteOne(uuid);

    return portfolio;
  }

  async getAverageBalances(uuid: string, range: string) {
    const portfolio = await this.repository.findOne(uuid);

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return this.portfolioStatesService.getAverageBalancesForRange(
      uuid,
      timeRangeFromStr(range),
    );
  }

  async updateCash(
    portfolioUuid: string,
    updatePortfolioCashDto: UpdatePortfolioCashDto,
  ): Promise<Portfolio> {
    const portfolio = await this.repository.findOne(portfolioUuid);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }

    // TODO: implement validation
    const { cash } = updatePortfolioCashDto;
    if (!isNumber(cash)) {
      throw new Error('Invalid cash value');
    }

    const updated = { ...portfolio, cash };
    await this.repository.updateCash(portfolioUuid, cash);
    await this.positionService.updatePortfolioState(updated);
    return updated;
  }

  @Cron('0 0 8 * * *', { timeZone: 'Europe/Madrid' })
  private refreshAllStatesExtra() {
    return this.refreshAllStates();
  }

  @Cron('0 33 9 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMarketOpen() {
    return this.refreshAllStates();
  }

  @Cron('0 31 12 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMidday() {
    return this.refreshAllStates();
  }
  @Cron('0 03 4 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMarketClose() {
    return this.refreshAllStates();
  }

  private async refreshAllStates() {
    try {
      const portfolios = await this.repository.findAll();
      await Promise.all(
        portfolios.map((portfolio) =>
          this.positionService.updatePortfolioState(portfolio),
        ),
      );
    } catch (err) {
      this.logger.error(
        `Error refreshing portfolios state from provider: ${err.message}`,
      );
    }
  }
}
