import { ApiProperty } from '@nestjs/swagger';
import { PortfolioContribution as DomainPortfolioContribution } from '../../domain/entities/portfolio-contribution.entity';

export class PortfolioContribution implements DomainPortfolioContribution {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  amountEUR: number;
}
