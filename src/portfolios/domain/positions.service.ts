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
import { CreatePositionDto } from './dto/create-position.dto';
import { PositionDetailDto } from './dto/position-detail.dto';
import { Position } from './entities/position.entity';

@Injectable()
export class PositionsService {
  constructor(
    private readonly repository: PositionsRepository,
    private readonly portfoliosRepository: PortfoliosRepository,
    private readonly companiesRepository: CompaniesRepository,
    private readonly companyStatesRepository: CompanyStatesRepository,
  ) {}

  async create(
    portfolioUuid: string,
    createPositionDto: CreatePositionDto,
  ): Promise<Position> {
    const portfolio = await this.portfoliosRepository.findOne(portfolioUuid);
    const company = await this.companiesRepository.findBySymbol(
      createPositionDto.symbol,
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

    return this.repository.create(<Position>{
      ...createPositionDto,
      portfolioUuid,
      uuid: uuidv4(),
      companyUuid: company.uuid,
    });
  }

  async getByPortfolioUuid(portfolioUuid: string) {
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

  deleteByPortfolioUuid(portfolioUuid: string) {
    return this.repository.deleteByPortfolioUuid(portfolioUuid);
  }

  private calculatePositionState(
    position,
    company,
    companyState,
  ): PositionDetailDto {
    return <PositionDetailDto>{
      ...position,
      companyName: company.name,
      symbol: company.symbol,
      value: Number(companyState.price * position.shares),
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
}
