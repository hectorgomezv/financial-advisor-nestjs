import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CompaniesRepository } from '../../companies/repositories/companies.repository';
import { CompanyStatesRepository } from '../../companies/repositories/company-states.repository';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { PositionsRepository } from '../repositories/positions.repository';
import { UpsertPositionDto } from './dto/upsert-position.dto';
import { PositionDetailDto } from './dto/position-detail.dto';
import { Position } from './entities/position.entity';
import { PortfolioStatesService } from './portfolio-states.service';

@Injectable()
export class PositionsService {
  constructor(
    private readonly repository: PositionsRepository,
    private readonly portfoliosRepository: PortfoliosRepository,
    private readonly portfolioStatesService: PortfolioStatesService,
    private readonly companiesRepository: CompaniesRepository,
    private readonly companyStatesRepository: CompanyStatesRepository,
  ) {}

  async create(
    portfolioUuid: string,
    upsertPositionDto: UpsertPositionDto,
  ): Promise<Position> {
    const portfolio = await this.portfoliosRepository.findOne(portfolioUuid);
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

    await this.repository.create(<Position>{
      ...upsertPositionDto,
      portfolioUuid,
      uuid,
      companyUuid: company.uuid,
    });

    const created = await this.repository.findByUuid(uuid);
    await this.updatePortfolioState(portfolioUuid);

    return created;
  }

  async update(portfolioUuid: string, upsertPositionDto: UpsertPositionDto) {
    const portfolio = await this.portfoliosRepository.findOne(portfolioUuid);
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
    });

    const updated = await this.repository.findByUuid(existentPosition.uuid);
    await this.updatePortfolioState(portfolioUuid);

    return updated;
  }

  getByPortfolioUuid(portfolioUuid: string): Promise<Position[]> {
    return this.repository.findByPortfolioUuid(portfolioUuid);
  }

  async getPositionDetailsByPortfolioUuid(
    portfolioUuid: string,
  ): Promise<PositionDetailDto[]> {
    const positions = await this.repository.findByPortfolioUuid(portfolioUuid);
    const companies = await this.companiesRepository.findByUuidIn(
      positions.map((p) => p.companyUuid),
    );

    const positionStates = await Promise.all(
      positions.map(async (position) => {
        const company = companies.find((c) => c.uuid === position.companyUuid);
        const companyState =
          await this.companyStatesRepository.getLastByCompanyUuid(company.uuid);
        return this.calculatePositionState(position, company, companyState);
      }),
    );

    return this.addWeights(positionStates)
      .sort((a, b) => a.value - b.value)
      .reverse();
  }

  async deleteByPortfolioUuid(portfolioUuid: string) {
    const result = await this.repository.deleteByPortfolioUuid(portfolioUuid);
    await this.updatePortfolioState(portfolioUuid);
    return result;
  }

  async deleteByUuidAndPortfolioUuid(portfolioUuid: string, uuid: string) {
    const position = await this.repository.findByUuid(uuid);
    await this.repository.deleteByUuidAndPortfolioUuid(portfolioUuid, uuid);
    await this.updatePortfolioState(portfolioUuid);
    return position;
  }

  private calculatePositionState(
    position,
    company,
    companyState,
  ): PositionDetailDto {
    return <PositionDetailDto>{
      uuid: position.uuid,
      companyName: company.name,
      symbol: company.symbol,
      shares: position.shares,
      value: Number((companyState?.price ?? 0) * position.shares),
      targetWeight: position.targetWeight,
    };
  }

  private addWeights(positionsStates): PositionDetailDto[] {
    const totalValue = positionsStates.reduce((sum, it) => sum + it.value, 0);

    return positionsStates.map((positionState) => {
      const currentWeight = Number((positionState.value / totalValue) * 100);
      const deltaWeight = Number(
        (currentWeight - positionState.targetWeight) /
          positionState.targetWeight,
      );

      return <PositionDetailDto>{
        ...positionState,
        currentWeight,
        deltaWeight,
      };
    });
  }

  private async updatePortfolioState(portfolioUuid: string) {
    const positions = await this.getPositionDetailsByPortfolioUuid(
      portfolioUuid,
    );
    await this.portfolioStatesService.createPortfolioState(
      portfolioUuid,
      this.mapToPositions(positions, portfolioUuid), // TODO: refactor when implementing PositionState
    );
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
        companyUuid: null,
        symbol: pdd.symbol,
        value: pdd.value,
      };
    });
  }
}
