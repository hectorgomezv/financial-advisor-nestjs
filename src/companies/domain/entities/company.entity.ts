import { CompanyStateResult } from '../company-states.service';
import { CompanyMetricsResult } from './company-metrics-result.entity';

export class Company {
  id: number;
  name: string;
  symbol: string;
}

export class CompanyWithState extends Company {
  state: CompanyStateResult | null;
}

export class CompanyWithStateAndMetrics extends CompanyWithState {
  metrics: CompanyMetricsResult | null;
}
