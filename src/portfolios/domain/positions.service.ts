import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../common/auth/entities/user.entity';
import { CompanyState } from '../../companies/domain/entities/company-state.entity';
import { CompaniesPgRepository } from '../../companies/repositories/companies.pg.repository';
import { CompanyStatesPgRepository } from '../../companies/repositories/company-states.pg.repository';
import { CurrencyExchangeClient } from '../datasources/currency-exchange.client';
import { PortfoliosPgRepository } from '../repositories/portfolios.pg.repository';
import { PositionsPgRepository } from '../repositories/positions.pg.repository';
import { CreatePositionDto } from './dto/create-position.dto';
import { PositionDetailDto } from './dto/position-detail.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { UpsertPositionDto } from './dto/upsert-position.dto';
import { Portfolio } from './entities/portfolio.entity';
import { Position } from './entities/position.entity';
import { PortfolioStatesService } from './portfolio-states.service';
import { Company } from '../../companies/domain/entities/company.entity';
import Decimal from 'decimal.js';

@Injectable()
export class PositionsService {
  private readonly logger = new Logger(PositionsService.name);

  constructor(
    private readonly repository: PositionsPgRepository,
    private readonly portfoliosRepository: PortfoliosPgRepository,
    private readonly portfolioStatesService: PortfolioStatesService,
    private readonly companiesRepository: CompaniesPgRepository,
    private readonly companyStatesRepository: CompanyStatesPgRepository,
    private readonly exchangeClient: CurrencyExchangeClient,
  ) {}

  async create(
    user: User,
    portfolioId: number,
    upsertPositionDto: UpsertPositionDto,
  ): Promise<Position> {
    const portfolio = await this.portfoliosRepository.findById(portfolioId);
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    this.checkOwner(user, portfolio);
    const company = await this.companiesRepository.findBySymbol(
      upsertPositionDto.symbol,
    );
    if (!portfolio || !company) {
      throw new NotFoundException('Invalid reference for position');
    }
    const existentPosition =
      await this.repository.findByCompanyIdAndPortfolioId(
        company.id,
        portfolioId,
      );
    if (existentPosition) {
      throw new ConflictException(
        `Position already exists for ${company.symbol}`,
      );
    }
    const created = await this.repository.create(<CreatePositionDto>{
      ...upsertPositionDto,
      portfolioId,
      companyId: company.id,
      blocked: false,
      sharesUpdatedAt: new Date(),
    });
    await this.updatePortfolioState(portfolio);
    return created;
  }

  async update(
    user: User,
    portfolioId: number,
    upsertPositionDto: UpsertPositionDto,
  ) {
    const portfolio = await this.portfoliosRepository.findById(portfolioId);
    const company = await this.companiesRepository.findBySymbol(
      upsertPositionDto.symbol,
    );
    if (!portfolio || !company) {
      throw new NotFoundException('Invalid reference for position');
    }
    this.checkOwner(user, portfolio);
    const existentPosition =
      await this.repository.findByCompanyIdAndPortfolioId(
        company.id,
        portfolioId,
      );
    if (!existentPosition) {
      throw new ConflictException(
        `Position don't exists for ${company.symbol}`,
      );
    }
    // TODO: store positions value in DB?
    await this.repository.update(existentPosition.id, <UpdatePositionDto>{
      targetWeight: upsertPositionDto.targetWeight,
      shares: upsertPositionDto.shares,
      blocked: upsertPositionDto.blocked ?? false,
      sharesUpdatedAt:
        upsertPositionDto.shares !== existentPosition.shares
          ? new Date()
          : existentPosition.sharesUpdatedAt,
      value: new Decimal(0),
    });
    const updated = await this.repository.findById(existentPosition.id);
    await this.updatePortfolioState(portfolio);
    return updated;
  }

  async getPositionDetailsByPortfolioId(
    portfolioId: number,
  ): Promise<PositionDetailDto[]> {
    const positions = await this.repository.findByPortfolioId(portfolioId);
    const companies = await this.companiesRepository.findByIdIn(
      positions.map((p) => p.companyId),
    );
    const fx = await this.exchangeClient.getFx();
    const positionStates: Array<PositionDetailDto> = [];
    for (const position of positions) {
      const company = companies.find((c) => c.id === position.companyId);
      const companyState =
        await this.companyStatesRepository.getLastByCompanyId(company!.id);
      if (companyState === null) continue;
      const state = await this.calculatePositionState(
        position,
        company!,
        companyState,
        fx,
      );
      positionStates.push(state);
    }
    return this.addWeightsAndDeltas(positionStates)
      .sort((a, b) => a.value.toNumber() - b.value.toNumber())
      .reverse();
  }

  async deleteByUuidAndPortfolioUuid(
    user: User,
    portfolioId: number,
    id: number,
  ) {
    const position = await this.repository.findById(id);
    const portfolio = await this.portfoliosRepository.findById(portfolioId);
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    this.checkOwner(user, portfolio);
    await this.repository.deleteByIdAndPortfolioId(id, portfolio.id);
    await this.updatePortfolioState(portfolio);
    return position;
  }

  private async calculatePositionState(
    position: Position,
    company: Company,
    companyState: CompanyState,
    fx: any,
  ): Promise<PositionDetailDto> {
    let value = companyState.price.mul(position.shares);
    if (companyState.currency !== 'EUR') {
      value = await fx(value.toNumber()).from(companyState.currency).to('EUR');
    }
    return <PositionDetailDto>{
      id: position.id,
      companyName: company.name,
      symbol: company.symbol,
      shares: position.shares,
      value: new Decimal(value),
      targetWeight: position.targetWeight,
      blocked: position.blocked,
      companyState,
      sharesUpdatedAt: position.sharesUpdatedAt ?? null,
    };
  }

  private addWeightsAndDeltas(
    positionsStates: Array<PositionDetailDto>,
  ): Array<PositionDetailDto> {
    const totalValue = positionsStates.reduce(
      (sum, it) => sum.plus(it.value),
      new Decimal(0),
    );

    return positionsStates.map((positionState) => {
      const { value, shares, targetWeight } = positionState;
      const currentWeight = value.dividedBy(totalValue).mul(new Decimal(100));
      const deltaWeight = currentWeight
        .minus(targetWeight)
        .dividedBy(targetWeight);
      const deltaShares = shares
        .mul(targetWeight)
        .dividedBy(currentWeight)
        .minus(shares);

      return <PositionDetailDto>{
        ...positionState,
        currentWeight,
        deltaWeight,
        deltaShares,
      };
    });
  }

  async updatePortfolioState(portfolio: Portfolio) {
    const positionDetailDTOs = await this.getPositionDetailsByPortfolioId(
      portfolio.id,
    );
    const positions = this.mapToPositions(positionDetailDTOs, portfolio.id);
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
    portfolioId: number,
  ): Position[] {
    return positionDetailDTOs.map((pdd) => {
      return <Position>{
        id: pdd.id,
        portfolioId,
        blocked: pdd.blocked,
        companyId: pdd.companyState.companyId,
        shares: pdd.shares,
        sharesUpdatedAt: pdd.sharesUpdatedAt,
        targetWeight: pdd.targetWeight,
        value: pdd.value,
      };
    });
  }
}
