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
  enterpriseToRevenue: string;
  @ApiProperty()
  enterpriseToEbitda: string;
  @ApiProperty()
  forwardPE: string;
  @ApiProperty()
  profitMargins: string;
  @ApiProperty()
  shortPercentOfFloat: string;
}
