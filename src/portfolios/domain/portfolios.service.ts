import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { isAfter, isBefore, isEqual } from 'date-fns';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../../common/auth/auth-service.js';
import { User } from '../../common/auth/entities/user.entity.js';
import { DataPoint } from '../../common/domain/entities/data-point.entity.js';
import { TimePeriod } from '../../common/domain/entities/time-period.entity.js';
import { Index } from '../../indices/domain/entities/index.entity.js';
import { IndicesService } from '../../indices/domain/indices.service.js';
import { PortfoliosRepository } from '../repositories/portfolios.repository.js';
import { AddPortfolioContributionDto } from './dto/add-portfolio-contribution.dto.js';
import { CreatePortfolioDto } from './dto/create-portfolio.dto.js';
import { PortfolioDetailDto } from './dto/portfolio-detail.dto.js';
import { UpdatePortfolioCashDto } from './dto/update-portfolio-cash.dto.js';
import { ContributionsMetadata } from './entities/contributions-metadata.js';
import { PortfolioAverageBalance } from './entities/portfolio-average-balance.entity.js';
import { PortfolioContribution } from './entities/portfolio-contribution.entity.js';
import { PortfolioState } from './entities/portfolio-state.entity.js';
import { Portfolio } from './entities/portfolio.entity.js';
import { timeRangeFromStr } from './entities/time-range.enum.js';
import { PortfolioStatesService } from './portfolio-states.service.js';
import { PositionsService } from './positions.service.js';
const { first, head, isEmpty, last, orderBy, sortBy } = _;

@Injectable()
export class PortfoliosService implements OnApplicationBootstrap {
  public static readonly DEFAULT_OFFSET = 0;
  public static readonly DEFAULT_LIMIT = 10;
  private readonly logger = new Logger(PortfoliosService.name);

  constructor(
    private readonly repository: PortfoliosRepository,
    private readonly authService: AuthService,
    private readonly portfolioStatesService: PortfolioStatesService,
    private readonly positionService: PositionsService,
    private readonly indicesService: IndicesService,
  ) {}

  create(
    user: User,
    createPortfolioDto: CreatePortfolioDto,
  ): Promise<Portfolio> {
    return this.repository.create(<Portfolio>(<unknown>{
      uuid: uuidv4(),
      name: createPortfolioDto.name,
      ownerId: user.id,
      created: Date.now(),
      positions: [],
      cash: 0,
      contributions: [],
      state: null,
    }));
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
    const state =
      await this.portfolioStatesService.getLastByPortfolioUuid(uuid);

    return <PortfolioDetailDto>{
      uuid,
      name: portfolio.name,
      created: portfolio.created,
      cash: portfolio.cash,
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

  async getAverageBalances(
    user: User,
    uuid: string,
    range: string,
  ): Promise<
    {
      contributions: number;
      timestamp?: Date | undefined;
      average?: number | undefined;
    }[]
  > {
    const portfolio = await this.repository.findOne(uuid);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    this.checkOwner(user, portfolio);

    const balances =
      await this.portfolioStatesService.getAverageBalancesForRange(
        uuid,
        timeRangeFromStr(range),
      );

    return sortBy(balances, ['timestamp']).map((balance) => ({
      ...balance,
      contributions: this.getContributionsSumForTimestamp(
        balance.timestamp!,
        portfolio,
      ),
    }));
  }

  private getContributionsSumForTimestamp(
    timestamp: Date,
    portfolio: Portfolio,
  ): number {
    return portfolio.contributions
      .filter(
        (c) =>
          isBefore(c.timestamp, timestamp) || isEqual(c.timestamp, timestamp),
      )
      .reduce((acc, c) => acc + c.amountEUR, 0);
  }

  /**
   * @deprecated
   */
  async getPerformance(
    user: User,
    uuid: string,
    range: string,
  ): Promise<DataPoint[]> {
    const portfolio = await this.repository.findOne(uuid);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    this.checkOwner(user, portfolio);

    const balances = sortBy(
      await this.portfolioStatesService.getAverageBalancesForRange(
        uuid,
        timeRangeFromStr(range),
      ),
      ['timestamp'],
    );
    const indices = await this.indicesService.findAll(user);
    if (!balances.length) return [];
    const initialValue = first(balances);
    const indicesPerformance = await Promise.all(
      indices.map(async (index) => ({
        name: index.name,
        values: await this.getIndexPerformanceValues(index, balances),
      })),
    );

    return balances.map(
      ({ timestamp, average }, n) =>
        <DataPoint>{
          timestamp,
          value:
            n === 0 ? 0 : ((average ?? 0) * 100) / initialValue!.average! - 100,
          ...indicesPerformance.reduce(
            (_, item) => ({ ..._, [item.name]: item.values[n] }),
            {},
          ),
        },
    );
  }

  async getReturnRates(
    user: User,
    uuid: string,
    period: TimePeriod,
  ): Promise<DataPoint[]> {
    const portfolio = await this.repository.findOne(uuid);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    this.checkOwner(user, portfolio);

    const portfolioStates =
      await this.portfolioStatesService.getPortfolioStatesInPeriod(
        uuid,
        period,
      );

    const dates = TimePeriod.dividePeriod(period);
    const ROICs = await Promise.all(
      dates.map(async (date, n) => {
        const next = dates?.[n + 1] ?? last(dates);
        const previous = dates?.[n - 1] ?? head(dates);
        const initialValue = this.getBalanceForDate(portfolioStates, date);
        const endValue = this.getBalanceForDate(portfolioStates, next);
        const cashFlow = this.getSumContributionsIn(portfolio, previous, date);
        return new DataPoint(
          date,
          (endValue - (initialValue + cashFlow)) / (initialValue + cashFlow),
        );
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
  ): number {
    if (isEmpty(states)) return 0;
    const targetState = orderBy(states, 'timestamp', 'desc').find((s) =>
      isBefore(s.timestamp!, date),
    );

    return targetState?.totalValueEUR ?? states[0].totalValueEUR ?? 0;
  }

  private getSumContributionsIn(
    portfolio: Portfolio,
    start: Date,
    end: Date,
  ): number {
    return portfolio.contributions
      .filter((c) => isAfter(c.timestamp, start) && isBefore(c.timestamp, end))
      .reduce((acc, c) => acc + c.amountEUR, 0);
  }

  /**
   * @deprecated
   */
  private async getIndexPerformanceValues(
    index: Index,
    balances: Partial<PortfolioAverageBalance>[],
  ): Promise<number[]> {
    if (isEmpty(balances)) return [];
    const initialValue = head(balances)!;
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
    if (isEmpty(timestamps)) return [];
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
    portfolioUuid: string,
    updatePortfolioCashDto: UpdatePortfolioCashDto,
  ): Promise<Portfolio> {
    const portfolio = await this.repository.findOne(portfolioUuid);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }
    this.checkOwner(user, portfolio);

    const { cash } = updatePortfolioCashDto;
    const updated = { ...portfolio, cash };
    await this.repository.updateCash(portfolioUuid, cash);
    await this.positionService.updatePortfolioState(updated);
    return updated;
  }

  async getContributions(
    user: User,
    uuid: string,
    offset: number,
    limit: number,
  ): Promise<PortfolioContribution[]> {
    const portfolio = await this.repository.findOne(uuid);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }
    this.checkOwner(user, portfolio);
    return this.repository.getContributions(uuid, offset, limit);
  }

  async getContributionsMetadata(
    user: User,
    uuid: string,
  ): Promise<ContributionsMetadata> {
    const portfolio = await this.repository.findOne(uuid);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found`);
    }
    this.checkOwner(user, portfolio);
    return this.repository.getContributionsMetadata(uuid);
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

    const { timestamp, amountEUR } = addPortfolioContributionDto;
    await this.repository.addContribution(uuid, {
      uuid: uuidv4(),
      timestamp,
      amountEUR,
    });
    const updated = await this.repository.findOne(uuid);
    if (!updated) {
      throw new NotFoundException(`Portfolio not found`);
    }
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
    if (!updated) {
      throw new NotFoundException(`Portfolio not found`);
    }
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
            `Refreshing portfolio ${portfolio.name} (uuid: ${portfolio.uuid})`,
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
