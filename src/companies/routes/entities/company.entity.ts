import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { CompanyMetrics } from './company-metrics.entity';
import { CompanyState } from './company-state.entity';

@ApiExtraModels(CompanyState, CompanyMetrics)
export class Company {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  symbol: string;
}

@ApiExtraModels(CompanyState)
export class CompanyWithState extends Company {
  @ApiProperty({ type: CompanyState, nullable: true })
  state: CompanyState | null;
}

@ApiExtraModels(CompanyMetrics)
export class CompanyWithStateAndMetrics extends CompanyWithState {
  @ApiProperty({ type: CompanyMetrics, nullable: true })
  metrics: CompanyMetrics | null;
}
