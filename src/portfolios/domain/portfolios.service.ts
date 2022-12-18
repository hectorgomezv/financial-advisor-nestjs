import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { isValid } from 'date-fns';
import { isNumber } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../../common/auth/auth-service';
import { User } from '../../common/auth/entities/user.entity';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { AddPortfolioContributionDto } from './dto/add-portfolio-contribution.dto';
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
    private readonly authService: AuthService,
    private readonly portfolioStatesService: PortfolioStatesService,
    private readonly positionService: PositionsService,
  ) {}

  create(
    user: User,
    createPortfolioDto: CreatePortfolioDto,
  ): Promise<Portfolio> {
    return this.repository.create(<Portfolio>{
      uuid: uuidv4(),
      name: createPortfolioDto.name,
      ownerId: user.id,
      created: Date.now(),
      positions: [],
      seed: createPortfolioDto.seed,
      cash: 0,
      contributions: [],
      state: null,
    });
  }

  findByOwnerId(user: User) {
    return this.authService.isAdmin(user)
      ? this.repository.findAll()
      : this.repository.findByOwnerId(user.id);
  }

  async findOne(user: User, uuid: string): Promise<PortfolioDetailDto> {
    const portfolio = await this.repository.findOne(uuid);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    this.checkOwner(user, portfolio);

    const positions =
      await this.positionService.getPositionDetailsByPortfolioUuid(portfolio);
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

  async deleteOne(user: User, uuid: string) {
    const portfolio = await this.repository.findOne(uuid);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    this.checkOwner(user, portfolio);

    await this.positionService.deleteByPortfolioUuid(user, uuid);
    await this.portfolioStatesService.deleteByPortfolioUuid(uuid);
    await this.repository.deleteOne(uuid);

    return portfolio;
  }

  async getAverageBalances(user: User, uuid: string, range: string) {
    const portfolio = await this.repository.findOne(uuid);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    this.checkOwner(user, portfolio);

    return this.portfolioStatesService.getAverageBalancesForRange(
      uuid,
      timeRangeFromStr(range),
    );
  }

  async updateCash(
    user: User,
    portfolioUuid: string,
    updatePortfolioCashDto: UpdatePortfolioCashDto,
  ): Promise<Portfolio> {
    const portfolio = await this.repository.findOne(portfolioUuid);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }
    this.checkOwner(user, portfolio);

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

  async addContribution(
    user: User,
    uuid: string,
    addPortfolioContributionDto: AddPortfolioContributionDto,
  ): Promise<Portfolio> {
    const portfolio = await this.repository.findOne(uuid);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }
    this.checkOwner(user, portfolio);

    // TODO: implement validation
    const { timestamp: inputTS, amountEUR } = addPortfolioContributionDto;
    const timestamp = new Date(inputTS);
    if (!isNumber(amountEUR) || !isValid(timestamp)) {
      throw new Error('Invalid contribution');
    }

    await this.repository.addContribution(uuid, {
      uuid: uuidv4(),
      timestamp,
      amountEUR,
    });
    const updated = await this.repository.findOne(uuid);
    await this.positionService.updatePortfolioState(updated);
    return updated;
  }

  async deleteContribution(
    user: User,
    portfolioUuid: string,
    contributionUuid: string,
  ): Promise<Portfolio> {
    const portfolio = await this.repository.findOne(portfolioUuid);

    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }
    this.checkOwner(user, portfolio);

    await this.repository.deleteContribution(portfolioUuid, contributionUuid);
    const updated = await this.repository.findOne(portfolioUuid);
    await this.positionService.updatePortfolioState(updated);
    return updated;
  }

  private checkOwner(user: User, portfolio: Portfolio): void {
    if (portfolio.ownerId !== user.id) {
      throw new UnauthorizedException('Access denied');
    }
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
  @Cron('0 03 16 * * *', { timeZone: 'America/New_York' })
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
