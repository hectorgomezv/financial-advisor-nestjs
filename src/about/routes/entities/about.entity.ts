import { ApiProperty } from '@nestjs/swagger';
import { About as DomainAbout } from '../../domain/entities/about.entity';

export class About implements DomainAbout {
  @ApiProperty()
  name: string;
  @ApiProperty()
  version: string;
  @ApiProperty()
  buildNumber: string;
}
