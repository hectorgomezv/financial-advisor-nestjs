import { ApiProperty } from '@nestjs/swagger';

export class PortfolioState {
  @ApiProperty()
  id: number;
  @ApiProperty()
  portfolioId: number;
  @ApiProperty()
  cash: string;
  @ApiProperty()
  isValid: boolean;
  @ApiProperty()
  roicEUR: string;
  @ApiProperty()
  sumWeights: string;
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  totalValueEUR: string;
}
