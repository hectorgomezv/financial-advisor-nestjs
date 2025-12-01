import { ApiProperty } from '@nestjs/swagger';
import { CompanyMetrics } from './company-metrics.entity';
import { CompanyState } from './company-state.entity';

export class Company {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  symbol: string;
}

export class CompanyWithState extends Company {
  @ApiProperty()
  state: CompanyState | null;
}

export class CompanyWithStateAndMetrics extends CompanyWithState {
  @ApiProperty()
  metrics: CompanyMetrics | null;
}
