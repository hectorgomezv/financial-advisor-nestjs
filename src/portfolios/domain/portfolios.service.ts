import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { Portfolio } from './entities/portfolio.entity';

@Injectable()
export class PortfoliosService {
  constructor(private readonly repository: PortfoliosRepository) {}

  create(createPortfolioDto: CreatePortfolioDto) {
    return this.repository.create(<Portfolio>{
      ...createPortfolioDto,
      uuid: uuidv4(),
      created: new Date(),
    });
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(uuid: string) {
    const portfolio = await this.repository.findOne(uuid);

    if (!portfolio) {
      throw new NotFoundException();
    }

    return portfolio;
  }

  remove(uuid: string) {
    return this.repository.deleteOne(uuid);
  }
}
