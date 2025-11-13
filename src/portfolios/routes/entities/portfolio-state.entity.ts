import { ApiProperty } from '@nestjs/swagger';

export class PortfolioState {
  @ApiProperty()
  id: number;
  @ApiProperty()
  portfolioId: number;
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  isValid: boolean;
  @ApiProperty()
  sumWeights: string;
  @ApiProperty()
  totalValueEUR: string;
  @ApiProperty()
  roicEUR: string;
}
