import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../common/auth/entities/user.entity.js';
import { CompanyState } from '../../companies/domain/entities/company-state.entity.js';
import { CompaniesRepository } from '../../companies/repositories/companies.repository.js';
import { CompanyStatesRepository } from '../../companies/repositories/company-states.repository.js';
import { CurrencyExchangeClient } from '../datasources/currency-exchange.client.js';
import { PortfoliosRepository } from '../repositories/portfolios.repository.js';
import { PositionsRepository } from '../repositories/positions.repository.js';
import { PositionDetailDto } from './dto/position-detail.dto.js';
import { UpsertPositionDto } from './dto/upsert-position.dto.js';
import { Portfolio } from './entities/portfolio.entity.js';
import { Position } from './entities/position.entity.js';
import { PortfolioStatesService } from './portfolio-states.service.js';

@Injectable()
export class PositionsService {
  private readonly logger = new Logger(PositionsService.name);

  constructor(
    private readonly repository: PositionsRepository,
    private readonly portfoliosRepository: PortfoliosRepository,
    private readonly portfolioStatesService: PortfolioStatesService,
    private readonly companiesRepository: CompaniesRepository,
    private readonly companyStatesRepository: CompanyStatesRepository,
    private readonly exchangeClient: CurrencyExchangeClient,
  ) {}

  async create(
    user: User,
    portfolioUuid: string,
    upsertPositionDto: UpsertPositionDto,
  ): Promise<Position> {
    const portfolio = await this.portfoliosRepository.findOne(portfolioUuid);
    this.checkOwner(user, portfolio);
    const company = await this.companiesRepository.findBySymbol(
      upsertPositionDto.symbol,
    );

    if (!portfolio || !company) {
      throw new NotFoundException('Invalid reference for position');
    }

    const existentPosition =
      await this.repository.findByCompanyUuidAndPortfolioUuid(
        company.uuid,
        portfolioUuid,
      );

    if (existentPosition) {
      throw new ConflictException(
        `Position already exists for ${company.symbol}`,
      );
    }

    const uuid = uuidv4();

    try {
      await this.repository.create(<Position>{
        ...upsertPositionDto,
        portfolioUuid,
        uuid,
        companyUuid: company.uuid,
        blocked: false,
        sharesUpdatedAt: new Date(),
      });
    } catch (err) {
      throw err;
    }

    const created = await this.repository.findByUuid(uuid);
    await this.updatePortfolioState(portfolio);

    return created;
  }

  async update(
    user: User,
    portfolioUuid: string,
    upsertPositionDto: UpsertPositionDto,
  ) {
    const portfolio = await this.portfoliosRepository.findOne(portfolioUuid);
    const company = await this.companiesRepository.findBySymbol(
      upsertPositionDto.symbol,
    );

    if (!portfolio || !company) {
      throw new NotFoundException('Invalid reference for position');
    }

    this.checkOwner(user, portfolio);

    const existentPosition =
      await this.repository.findByCompanyUuidAndPortfolioUuid(
        company.uuid,
        portfolioUuid,
      );

    if (!existentPosition) {
      throw new ConflictException(
        `Position don't exists for ${company.symbol}`,
      );
    }

    await this.repository.update(existentPosition.uuid, <Partial<Position>>{
      targetWeight: upsertPositionDto.targetWeight,
      shares: upsertPositionDto.shares,
      companyUuid: company.uuid,
      symbol: upsertPositionDto.symbol,
      blocked: upsertPositionDto.blocked ?? false,
      sharesUpdatedAt:
        upsertPositionDto.shares !== existentPosition.shares
          ? new Date()
          : existentPosition.sharesUpdatedAt,
    });

    const updated = await this.repository.findByUuid(existentPosition.uuid);
    await this.updatePortfolioState(portfolio);

    return updated;
  }

  async getPositionDetailsByPortfolioUuid(
    portfolio: Portfolio,
  ): Promise<PositionDetailDto[]> {
    const positions = await this.repository.findByPortfolioUuid(portfolio.uuid);
    const companies = await this.companiesRepository.findByUuidIn(
      positions.map((p) => p.companyUuid),
    );

    const fx = await this.exchangeClient.getFx();
    const positionStates = await Promise.all(
      positions.map(async (position) => {
        const company = companies.find((c) => c.uuid === position.companyUuid);
        const companyState =
          await this.companyStatesRepository.getLastByCompanyUuid(
            company!.uuid,
          );
        return this.calculatePositionState(position, company, companyState, fx);
      }),
    );

    return this.addWeightsAndDeltas(positionStates)
      .sort((a, b) => a.value - b.value)
      .reverse();
  }

  async deleteByPortfolioUuid(user: User, portfolioUuid: string) {
    const portfolio = await this.portfoliosRepository.findOne(portfolioUuid);
    this.checkOwner(user, portfolio);
    const result = await this.repository.deleteByPortfolioUuid(portfolioUuid);
    await this.updatePortfolioState(portfolio);
    return result;
  }

  async deleteByUuidAndPortfolioUuid(
    user: User,
    portfolioUuid: string,
    uuid: string,
  ) {
    const position = await this.repository.findByUuid(uuid);
    const portfolio = await this.portfoliosRepository.findOne(portfolioUuid);
    this.checkOwner(user, portfolio);
    await this.repository.deleteByUuidAndPortfolioUuid(portfolioUuid, uuid);
    await this.updatePortfolioState(portfolio);
    return position;
  }

  private async calculatePositionState(
    position,
    company,
    companyState: CompanyState,
    fx: any,
  ): Promise<PositionDetailDto> {
    let value = Number((companyState?.price ?? 0) * position.shares);
    if (companyState.currency !== 'EUR') {
      value = fx.convert(value, { from: companyState.currency, to: 'EUR' });
    }

    return <PositionDetailDto>{
      uuid: position.uuid,
      companyName: company.name,
      symbol: company.symbol,
      shares: position.shares,
      value,
      targetWeight: position.targetWeight,
      blocked: position.blocked,
      companyState,
      sharesUpdatedAt: position.sharesUpdatedAt ?? null,
    };
  }

  private addWeightsAndDeltas(
    positionsStates: PositionDetailDto[],
  ): PositionDetailDto[] {
    const totalValue = positionsStates.reduce((sum, it) => sum + it.value, 0);

    return positionsStates.map((positionState) => {
      const { value, shares, targetWeight } = positionState;
      const currentWeight = (value / totalValue) * 100;
      const deltaWeight = (currentWeight - targetWeight) / targetWeight;
      const deltaShares = (shares * targetWeight) / currentWeight - shares;

      return <PositionDetailDto>{
        ...positionState,
        currentWeight,
        deltaWeight,
        deltaShares,
      };
    });
  }

  async updatePortfolioState(portfolio: Portfolio) {
    const positionDetailDTOs =
      await this.getPositionDetailsByPortfolioUuid(portfolio);
    const positions = this.mapToPositions(positionDetailDTOs, portfolio.uuid); // TODO: refactor when implementing PositionState
    const portfolioState =
      await this.portfolioStatesService.createPortfolioState(
        portfolio,
        positions,
      );
    this.logger.log(
      `Updated portfolio ${portfolio.name} state. Total value: ${portfolioState.totalValueEUR}€, ROIC: ${portfolioState.roicEUR}€`,
    );
    return portfolioState;
  }

  private checkOwner(user: User, portfolio: Portfolio): void {
    if (portfolio.ownerId !== user.id) {
      throw new UnauthorizedException('Access denied');
    }
  }

  private mapToPositions(
    positionDetailDTOs: PositionDetailDto[],
    portfolioUuid: string,
  ): Position[] {
    return positionDetailDTOs.map((pdd) => {
      return <Position>{
        uuid: pdd.uuid,
        portfolioUuid,
        targetWeight: pdd.targetWeight,
        shares: pdd.shares,
        companyUuid: pdd.companyState.companyUuid,
        symbol: pdd.symbol,
        value: pdd.value,
      };
    });
  }
}
