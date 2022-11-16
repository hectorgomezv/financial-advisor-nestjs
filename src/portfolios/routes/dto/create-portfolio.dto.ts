import { ApiProperty } from '@nestjs/swagger';
import { CreatePortfolioDto as DomainCreatePortfolioDto } from '../../domain/dto/create-portfolio.dto';

export class CreatePortfolioDto implements DomainCreatePortfolioDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  seed: number;
}
