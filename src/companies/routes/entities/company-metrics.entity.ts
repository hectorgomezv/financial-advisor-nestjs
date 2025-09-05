import { ApiProperty } from '@nestjs/swagger';
import { CompanyMetrics as DomainCompanyMetrics } from '../../domain/entities/company-metrics.entity';

export class CompanyMetrics implements DomainCompanyMetrics {
  @ApiProperty()
  avgEnterpriseToRevenue: number;

  @ApiProperty()
  avgEnterpriseToEbitda: number;

  @ApiProperty()
  avgForwardPE: number;

  @ApiProperty()
  avgProfitMargins: number;
}
