import { ApiProperty } from '@nestjs/swagger';
import { CreateCompanyDto as DomainCreateCompanyDto } from '../../domain/dto/create-company.dto';

export class CreateCompanyDto implements DomainCreateCompanyDto {
  @ApiProperty()
  symbol: string;
  @ApiProperty()
  name: string;
}
