import { ApiProperty } from '@nestjs/swagger';
import {
  Company as DomainCompany,
  CompanyWithState as DomainCompanyWithState,
} from '../../domain/entities/company.entity';
import { CompanyState } from './company-state.entity';

export class Company implements DomainCompany {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  symbol: string;
}

export class CompanyWithState
  extends Company
  implements DomainCompanyWithState
{
  @ApiProperty()
  state: CompanyState;
}
