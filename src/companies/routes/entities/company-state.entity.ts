import { ApiProperty } from '@nestjs/swagger';

export class CompanyState {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  price: number;
  @ApiProperty()
  currency: string;
  @ApiProperty()
  peg: number;
  @ApiProperty()
  enterpriseToRevenue: number;
  @ApiProperty()
  enterpriseToEbitda: number;
  @ApiProperty()
  shortPercentOfFloat: number;
}
