import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CompaniesRepository } from '../../companies/repositories/companies.repository';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { PositionsRepository } from '../repositories/positions.repository';
import { CreatePositionDto } from './dto/create-position.dto';
import { Position } from './entities/position.entity';

@Injectable()
export class PositionsService {
  constructor(
    private readonly repository: PositionsRepository,
    private readonly portfoliosRepository: PortfoliosRepository,
    private readonly companiesRepository: CompaniesRepository, // private readonly companyStatesRepository: CompanyStatesRepository,
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
      companyUuid: company.symbol,
    });
  }

  deleteByPortfolioUuid(portfolioUuid: string) {
    return this.repository.deleteByPortfolioUuid(portfolioUuid);
  }
}
