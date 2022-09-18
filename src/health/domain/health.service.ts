import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  findOne() {
    return { health: 'OK' };
  }
}
