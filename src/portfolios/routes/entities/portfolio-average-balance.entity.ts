import { ApiProperty } from '@nestjs/swagger';
import { PortfolioAverageBalance as DomainPortfolioAverageBalance } from '../../domain/entities/portfolio-average-balanace.entity';

export class PortfolioAverageMetric implements DomainPortfolioAverageBalance {
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  average: number;
}
