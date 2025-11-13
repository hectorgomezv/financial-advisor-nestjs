import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';

export class UpdatePortfolioCashDto {
  @ApiProperty()
  cash: Decimal;
}
