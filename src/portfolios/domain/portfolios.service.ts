import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioDetailDto } from './dto/portfolio-detail.dto';
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

  @Cron('0 21 9 * * *', { timeZone: 'Europe/Madrid' })
  private refreshAllStatesTemp() {
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
        portfolios.map(async ({ uuid }) => {
          const positions = await this.positionService.getByPortfolioUuid(uuid);
          return this.portfolioStatesService.createPortfolioState(
            uuid,
            positions,
          );
        }),
      );
    } catch (err) {
      this.logger.error(
        `Error refreshing portfolios state from provider: ${err.message}`,
      );
    }
  }
}
