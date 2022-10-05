import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty()
  symbol: string;
  @ApiProperty()
  name: string;
}
