import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PortfolioStatesRepository } from '../repositories/portfolio-states.repository';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioDetailDto } from './dto/portfolio-detail.dto';
import { Portfolio } from './entities/portfolio.entity';
import { timeRangeFromStr } from './entities/time-range.enum';
import { PositionsService } from './positions.service';

@Injectable()
export class PortfoliosService {
  constructor(
    private readonly repository: PortfoliosRepository,
    private readonly portfolioStatesRepository: PortfolioStatesRepository,
    private readonly positionService: PositionsService,
  ) {}

  create(createPortfolioDto: CreatePortfolioDto) {
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

    const positions = await this.positionService.getByPortfolioUuid(uuid);
    const state = await this.portfolioStatesRepository.getLastByPortfolioUuid(
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
    await this.portfolioStatesRepository.deleteByPortfolioUuid(uuid);
    await this.repository.deleteOne(uuid);

    return portfolio;
  }

  async getMetrics(uuid: string, range: string) {
    const portfolio = await this.repository.findOne(uuid);

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return this.portfolioStatesRepository.getSeriesForRange(
      uuid,
      timeRangeFromStr(range),
    );
  }
}