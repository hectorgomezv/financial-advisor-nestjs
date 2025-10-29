import { ApiProperty } from '@nestjs/swagger';
import { PortfolioAverageBalance as DomainPortfolioAverageBalance } from '../../domain/entities/portfolio-average-balance.entity.js';

export class PortfolioAverageMetric implements DomainPortfolioAverageBalance {
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  average: number;
  @ApiProperty()
  contributions: number;
}
