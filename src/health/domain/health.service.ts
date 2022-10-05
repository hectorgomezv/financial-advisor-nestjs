import { Injectable } from '@nestjs/common';
import { Health } from './entities/health.entity';

@Injectable()
export class HealthService {
  findOne() {
    return <Health>{ health: 'OK' };
  }
}
