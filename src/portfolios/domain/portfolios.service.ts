import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { isAfter, isBefore, isEqual } from 'date-fns';
import Decimal from 'decimal.js';
import { first, head, last, orderBy, sortBy } from 'lodash';
import { AuthService } from '../../common/auth/auth-service';
import { User } from '../../common/auth/entities/user.entity';
import { DataPoint } from '../../common/domain/entities/data-point.entity';
import { Maths } from '../../common/domain/entities/maths.entity';
import { TimePeriod } from '../../common/domain/entities/time-period.entity';
import { Index } from '../../indices/domain/entities/index.entity';
import { IndicesService } from '../../indices/domain/indices.service';
import { PortfoliosPgRepository } from '../repositories/portfolios.pg.repository';
import { AddPortfolioContributionDto } from './dto/add-portfolio-contribution.dto';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioDetailResult } from './dto/portfolio-detail-result.dto';
import { UpdatePortfolioCashDto } from './dto/update-portfolio-cash.dto';
import { ContributionsMetadata } from './entities/contributions-metadata';
import { PortfolioAverageBalance } from './entities/portfolio-average-balance.entity';
import { PortfolioContribution } from './entities/portfolio-contribution.entity';
import { PortfolioState } from './entities/portfolio-state.entity';
import { Portfolio } from './entities/portfolio.entity';
import { timeRangeFromStr } from './entities/time-range.enum';
import { PortfolioStatesService } from './portfolio-states.service';
import { PositionsService } from './positions.service';

@Injectable()
export class PortfoliosService implements OnApplicationBootstrap {
  public static readonly DEFAULT_OFFSET = 0;
  public static readonly DEFAULT_LIMIT = 10;
  private readonly logger = new Logger(PortfoliosService.name);

  constructor(
    private readonly repository: PortfoliosPgRepository,
    private readonly authService: AuthService,
    private readonly portfolioStatesService: PortfolioStatesService,
    private readonly positionService: PositionsService,
    private readonly indicesService: IndicesService,
  ) {}

  create(
    user: User,
    createPortfolioDto: CreatePortfolioDto,
  ): Promise<Portfolio> {
    return this.repository.create(createPortfolioDto, user);
  }

  findByOwnerId(user: User) {
    return this.authService.isAdmin(user)
      ? this.repository.findAll()
      : this.repository.findByOwnerId(user.id);
  }

  async findById(user: User, id: number): Promise<PortfolioDetailResult> {
    const portfolio = await this.repository.findById(id);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    this.checkOwner(user, portfolio);
    const positions =
      await this.positionService.getPositionDetailsByPortfolioId(portfolio.id);
    const state = await this.portfolioStatesService.getLastByPortfolioId(
      portfolio.id,
    );
    return {
      id: portfolio.id,
      name: portfolio.name,
      created: portfolio.created,
      cash: Maths.round(portfolio.cash),
      positions,
      state,
    };
  }

  async deleteOne(user: User, id: number) {
    const portfolio = await this.repository.findById(id);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    this.checkOwner(user, portfolio);
    await this.repository.deleteById(id);
    return portfolio;
  }

  async getAverageBalances(
    user: User,
    id: number,
    range: string,
  ): Promise<Array<PortfolioAverageBalance>> {
    const portfolio = await this.repository.findByIdWithContributions(id);
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    this.checkOwner(user, portfolio);
    const timeRange = timeRangeFromStr(range);
    const balances =
      await this.portfolioStatesService.getAverageBalancesForRange(
        id,
        timeRange,
      );
    return sortBy(balances, ['timestamp']).map((balance) => ({
      timestamp: balance.timestamp!,
      average: balance.average!,
      contributions: this.getContributionsSumForTimestamp(
        balance.timestamp!,
        portfolio,
      ),
    }));
  }

  private getContributionsSumForTimestamp(
    timestamp: Date,
    portfolio: Portfolio,
  ): Decimal {
    return portfolio.contributions
      .filter(
        (c) =>
          isBefore(c.timestamp, timestamp) || isEqual(c.timestamp, timestamp),
      )
      .reduce((acc, c) => acc.plus(c.amountEUR), new Decimal(0));
  }

  /**
   * @deprecated
   */
  async getPerformance(
    user: User,
    id: number,
    range: string,
  ): Promise<DataPoint[]> {
    const portfolio = await this.repository.findById(id);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    this.checkOwner(user, portfolio);

    const balances = sortBy(
      await this.portfolioStatesService.getAverageBalancesForRange(
        id,
        timeRangeFromStr(range),
      ),
      ['timestamp'],
    );
    const indices = await this.indicesService.findAll(user);
    const initialValue = first(balances);
    const indicesPerformance = await Promise.all(
      indices.map(async (index) => ({
        name: index.name,
        values: await this.getIndexPerformanceValues(index, balances),
      })),
    );

    return balances.map(({ timestamp, average }, n) => {
      if (!average) throw Error('average is not defined');
      return <DataPoint>{
        timestamp,
        value:
          n === 0
            ? 0
            : average
                .mul(new Decimal(100))
                .dividedBy(initialValue!.average!)
                .minus(100)
                .toNumber(),
        ...indicesPerformance.reduce(
          (_, item) => ({ ..._, [item.name]: item.values[n] }),
          {},
        ),
      };
    });
  }

  async getReturnRates(
    user: User,
    id: number,
    period: TimePeriod,
  ): Promise<DataPoint[]> {
    const portfolio = await this.repository.findByIdWithContributions(id);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    this.checkOwner(user, portfolio);

    const portfolioStates =
      await this.portfolioStatesService.getPortfolioStatesInPeriod(id, period);

    const dates = TimePeriod.dividePeriod(period);
    const ROICs = await Promise.all(
      dates.map(async (date, n) => {
        const next = dates?.[n + 1] ?? last(dates);
        const previous = dates?.[n - 1] ?? head(dates);
        const initialValue = this.getBalanceForDate(portfolioStates, date);
        const endValue = this.getBalanceForDate(portfolioStates, next);
        const cashFlow = this.getSumContributionsIn(portfolio, previous, date);
        let value = endValue.minus(initialValue.plus(cashFlow));
        value = value.dividedBy(initialValue.plus(cashFlow));
        return new DataPoint(date, value.toNumber());
      }),
    );

    const indices = await this.indicesService.findAll(user);
    const indicesReturns = await Promise.all(
      indices.map(async (index) => ({
        name: index.name,
        values: await this.getIndexReturnsValues(
          index,
          ROICs.map((i) => i.timestamp),
        ),
      })),
    );

    return ROICs.slice(1).map(
      ({ timestamp }, n) =>
        <DataPoint>{
          timestamp,
          value:
            (ROICs.slice(0, n + 1).reduce((acc, i) => acc * (1 + i.value), 1) -
              1) *
            100,
          ...indicesReturns.reduce(
            (_, item) => ({ ..._, [item.name]: item.values[n] }),
            {},
          ),
        },
    );
  }

  private getBalanceForDate(
    states: Partial<PortfolioState>[],
    date: Date,
  ): Decimal {
    const targetState = orderBy(states, 'timestamp', 'desc').find((s) =>
      isBefore(s.timestamp!, date),
    );

    return (
      targetState?.totalValueEUR ?? states[0].totalValueEUR ?? new Decimal(0)
    );
  }

  private getSumContributionsIn(
    portfolio: Portfolio,
    start: Date,
    end: Date,
  ): Decimal {
    return portfolio.contributions
      .filter((c) => isAfter(c.timestamp, start) && isBefore(c.timestamp, end))
      .reduce((acc, c) => acc.plus(c.amountEUR), new Decimal(0));
  }

  /**
   * @deprecated
   */
  private async getIndexPerformanceValues(
    index: Index,
    balances: Partial<PortfolioAverageBalance>[],
  ): Promise<Array<number>> {
    if (!balances.length) return [];
    const initialValue = head(balances);
    const indexPerformance =
      await this.indicesService.getIndexPerformanceForTimestamps(
        index,
        initialValue!.timestamp!,
        balances.map((i) => i.timestamp!),
      );
    return indexPerformance.map((ip) => ip.value);
  }

  private async getIndexReturnsValues(
    index: Index,
    timestamps: Date[],
  ): Promise<number[]> {
    const indexReturns =
      await this.indicesService.getIndexPerformanceForTimestamps(
        index,
        head(timestamps)!,
        timestamps,
      );
    return indexReturns.map((i) => i.value);
  }

  async updateCash(
    user: User,
    portfolioId: number,
    updatePortfolioCashDto: UpdatePortfolioCashDto,
  ): Promise<Portfolio> {
    const portfolio = await this.repository.findById(portfolioId);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }
    this.checkOwner(user, portfolio);

    const { cash: _ } = updatePortfolioCashDto;
    const cash = new Decimal(_);
    const updated = { ...portfolio, cash };
    await this.repository.updateCash(portfolioId, cash);
    await this.positionService.updatePortfolioState(updated);
    return updated;
  }

  async getContributions(
    user: User,
    id: number,
    offset: number,
    limit: number,
  ): Promise<PortfolioContribution[]> {
    const portfolio = await this.repository.findById(id);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }
    this.checkOwner(user, portfolio);
    return this.repository.getContributions(id, offset, limit);
  }

  async getContributionsMetadata(
    user: User,
    id: number,
  ): Promise<ContributionsMetadata> {
    const portfolio = await this.repository.findById(id);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }
    this.checkOwner(user, portfolio);
    return this.repository.getContributionsMetadata(id);
  }

  async addContribution(
    user: User,
    id: number,
    addPortfolioContributionDto: AddPortfolioContributionDto,
  ): Promise<Portfolio> {
    const portfolio = await this.repository.findById(id);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }
    this.checkOwner(user, portfolio);

    const { timestamp, amountEUR } = addPortfolioContributionDto;
    await this.repository.addContribution(id, {
      timestamp,
      amountEUR,
    });
    const updated = await this.repository.findByIdWithContributions(id);
    if (!updated) throw new NotFoundException('Portfolio not found');
    await this.positionService.updatePortfolioState(updated);
    return updated;
  }

  async deleteContribution(
    user: User,
    portfolioId: number,
    contributionId: number,
  ): Promise<Portfolio> {
    const portfolio = await this.repository.findById(portfolioId);

    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }
    this.checkOwner(user, portfolio);

    await this.repository.deleteContributionById(contributionId);
    const updated = await this.repository.findById(portfolioId);
    if (!updated) throw new NotFoundException('Portfolio not found');
    await this.positionService.updatePortfolioState(updated);
    return updated;
  }

  private checkOwner(user: User, portfolio: Portfolio): void {
    if (portfolio.ownerId !== user.id) {
      throw new UnauthorizedException('Access denied');
    }
  }

  onApplicationBootstrap() {
    return this.refreshAllStates();
  }

  @Cron('0 0 8 * * *', { timeZone: 'Europe/Madrid' })
  private refreshAllStatesExtra() {
    return this.refreshAllStates();
  }

  @Cron('0 50 9 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMarketOpen() {
    return this.refreshAllStates();
  }

  @Cron('0 30 12 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMidday() {
    return this.refreshAllStates();
  }
  @Cron('0 45 15 * * *', { timeZone: 'America/New_York' })
  private refreshAllStatesAtMarketClose() {
    return this.refreshAllStates();
  }

  private async refreshAllStates() {
    try {
      const portfolios = await this.repository.findAll();
      await Promise.all(
        portfolios.map((portfolio) => {
          this.logger.log(
            `Refreshing portfolio ${portfolio.name} (uuid: ${portfolio.id})`,
          );
          return this.positionService.updatePortfolioState(portfolio);
        }),
      );
    } catch (err) {
      this.logger.error(
        `Error refreshing portfolios state from provider: ${err.message}`,
      );
    }
  }
}
