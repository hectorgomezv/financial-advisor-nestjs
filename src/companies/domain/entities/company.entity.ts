import { CompanyState } from './company-state.entity';

export class Company {
  id: number;
  name: string;
  symbol: string;
}

export class CompanyWithState extends Company {
  state: CompanyState;
}
