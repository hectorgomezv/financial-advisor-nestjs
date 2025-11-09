import { CompanyMetrics } from './company-metrics.entity';
import { CompanyState } from './company-state.entity';

export class Company {
  uuid?: string;
  name: string;
  symbol: string;
  metrics?: CompanyMetrics;
}

export class CompanyWithState extends Company {
  state: CompanyState;
}
