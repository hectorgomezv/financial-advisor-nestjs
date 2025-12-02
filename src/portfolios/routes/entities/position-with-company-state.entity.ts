import { ApiProperty } from '@nestjs/swagger';
import { CompanyState } from '../../../companies/routes/entities/company-state.entity';

export class PositionWithCompanyState {
  @ApiProperty()
  id: number;
  @ApiProperty()
  blocked: boolean;
  @ApiProperty()
  companyName: string;
  @ApiProperty()
  companyState: CompanyState | null;
  @ApiProperty()
  currentWeight: string;
  @ApiProperty()
  deltaShares: string;
  @ApiProperty()
  deltaWeight: string;
  @ApiProperty()
  shares: string;
  @ApiProperty()
  sharesUpdatedAt: Date | null;
  @ApiProperty()
  symbol: string;
  @ApiProperty()
  targetWeight: string;
  @ApiProperty()
  value: string;
}
