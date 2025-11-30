import { ApiProperty } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @ApiProperty()
  name: string;
}
