import { ApiProperty } from '@nestjs/swagger';
import { Company as DomainCompany } from '../../domain/entities/company.entity.js';
import { CompanyMetrics } from './company-metrics.entity.js';
import { CompanyState } from './company-state.entity.js';

export class Company implements DomainCompany {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  symbol: string;
  @ApiProperty()
  metrics: CompanyMetrics;
}

export class CompanyWithState extends Company {
  @ApiProperty()
  state: CompanyState;
}
