import { ApiProperty } from '@nestjs/swagger';

export class CompanyMetrics {
  @ApiProperty()
  avgEnterpriseToRevenue: string;
  @ApiProperty()
  avgEnterpriseToEbitda: string;
  @ApiProperty()
  avgForwardPE: string;
  @ApiProperty()
  avgProfitMargins: string;
}
