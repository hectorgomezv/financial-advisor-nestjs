import { CompanyMetrics } from './company-metrics.entity.js';
import { CompanyState } from './company-state.entity.js';

export class Company {
  uuid: string;
  name: string;
  symbol: string;
  metrics: CompanyMetrics;
}

export class CompanyWithState extends Company {
  state: CompanyState;
}
