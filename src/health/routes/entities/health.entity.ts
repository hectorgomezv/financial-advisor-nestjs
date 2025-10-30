import { ApiProperty } from '@nestjs/swagger';
import { Health as DomainHealth } from '../../domain/entities/health.entity.js';

export class Health implements DomainHealth {
  @ApiProperty()
  health: string;
}
