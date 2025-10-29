import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateCompanyDto as DomainCreateCompanyDto } from '../../domain/dto/create-company.dto.js';

export class CreateCompanyDto implements DomainCreateCompanyDto {
  @ApiProperty()
  @IsString()
  symbol: string;
  @ApiProperty()
  @IsString()
  name: string;
}
