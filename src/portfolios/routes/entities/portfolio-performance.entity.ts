import { ApiProperty } from '@nestjs/swagger';
import { PortfolioPerformance as DomainPortfolioPerformance } from '../../domain/entities/portfolio-performance.entity';

export class PortfolioPerformance implements DomainPortfolioPerformance {
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  value: number;
}
