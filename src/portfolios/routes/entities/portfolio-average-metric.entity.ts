import { ApiProperty } from '@nestjs/swagger';
import { PortfolioAverageMetric as DomainPortfolioAverageMetric } from '../../domain/entities/portfolio-average-metric.entity';

export class PortfolioAverageMetric implements DomainPortfolioAverageMetric {
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  average: number;
}
