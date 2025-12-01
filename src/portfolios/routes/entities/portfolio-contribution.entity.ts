import { ApiProperty } from '@nestjs/swagger';

export class PortfolioContribution {
  @ApiProperty()
  id: number;
  @ApiProperty()
  portfolioId: number;
  @ApiProperty()
  amountEUR: string;
  @ApiProperty()
  timestamp: Date;
}
