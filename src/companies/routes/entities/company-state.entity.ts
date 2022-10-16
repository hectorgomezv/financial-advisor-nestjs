import { ApiProperty } from '@nestjs/swagger';
import { CompanyState as DomainCompanyState } from '../../domain/entities/company-state.entity';

export class CompanyState implements DomainCompanyState {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  price: number;
  @ApiProperty()
  peg: number;
  @ApiProperty()
  companyUuid: string;
}
