import { ApiProperty } from '@nestjs/swagger';

export class CompanyState {
  @ApiProperty()
  id: number;
  @ApiProperty()
  companyId: number;
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  price: string;
  @ApiProperty()
  currency: string;
  @ApiProperty()
  enterpriseToRevenue: number;
  @ApiProperty()
  enterpriseToEbitda: number;
  @ApiProperty()
  forwardPE: number;
  @ApiProperty()
  profitMargins: number;
  @ApiProperty()
  shortPercentOfFloat: number;
}
