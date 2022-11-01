import { ApiProperty } from '@nestjs/swagger';

export class CompanyState {
  @ApiProperty()
  uuid: string;
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  price: number;
  @ApiProperty()
  peg: number;
}
