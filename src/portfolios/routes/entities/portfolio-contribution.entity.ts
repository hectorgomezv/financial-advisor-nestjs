import { ApiProperty } from '@nestjs/swagger';

export class PortfolioContribution {
  @ApiProperty()
  id: number;
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  amountEUR: string;
}
