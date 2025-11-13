import { CompanyMetrics } from './company-metrics.entity';
import { CompanyState } from './company-state.entity';

export class Company {
  id: number;
  name: string;
  symbol: string;
}

export class CompanyWithState extends Company {
  state: CompanyState | null;
}

export class CompanyWithStateAndMetrics extends CompanyWithState {
  metrics: CompanyMetrics | null;
}
