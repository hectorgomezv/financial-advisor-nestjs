import { CompanyState } from './company-state.entity';

export class Company {
  uuid: string;
  name: string;
  symbol: string;
}

export class CompanyWithState extends Company {
  state: CompanyState;
}
