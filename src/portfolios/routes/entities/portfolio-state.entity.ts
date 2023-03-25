import { ApiProperty } from '@nestjs/swagger';
import { PortfolioState as DomainPortfolioState } from '../../domain/entities/portfolio-state.entity';

export class PortfolioState implements DomainPortfolioState {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  portfolioUuid: string;
  @ApiProperty()
  isValid: boolean;
  @ApiProperty()
  sumWeights: number;
  @ApiProperty()
  totalValueEUR: number;
  @ApiProperty()
  roicEUR: number;
}
