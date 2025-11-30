import { ApiProperty } from '@nestjs/swagger';

export class PortfolioAverageMetric {
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  average: string;
  @ApiProperty()
  contributions: string;
}
