import { Injectable } from '@nestjs/common';
import { PositionsRepository } from '../repositories/positions.repository';

@Injectable()
export class PositionsService {
  constructor(private readonly repository: PositionsRepository) {}

  deleteByPortfolioUuid(portfolioUuid: string) {
    return this.repository.deleteByPortfolioUuid(portfolioUuid);
  }
}
