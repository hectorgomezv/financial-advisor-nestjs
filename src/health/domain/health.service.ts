import { Injectable } from '@nestjs/common';
import { Health } from './entities/health.entity.js';

@Injectable()
export class HealthService {
  findOne() {
    return <Health>{ health: 'OK' };
  }
}
