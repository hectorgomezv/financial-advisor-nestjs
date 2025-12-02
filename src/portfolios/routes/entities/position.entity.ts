import { ApiProperty } from '@nestjs/swagger';

export class Position {
  @ApiProperty()
  id: number;
  @ApiProperty()
  portfolioId: number;
  @ApiProperty()
  companyId: number;
  @ApiProperty()
  blocked: boolean;
  @ApiProperty()
  shares: string;
  @ApiProperty()
  sharesUpdatedAt: Date;
  @ApiProperty()
  targetWeight: string;
  @ApiProperty()
  value: string;
}
