import { ApiProperty } from '@nestjs/swagger';
import { Company as DomainCompany } from '../../domain/entities/company.entity';
import { CompanyMetrics } from './company-metrics.entity';
import { CompanyState } from './company-state.entity';

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
