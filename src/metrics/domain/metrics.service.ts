import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly register;

  constructor() {
    const collectDefaultMetrics = client.collectDefaultMetrics;
    const { Registry } = client;
    this.register = new Registry();
    collectDefaultMetrics({ register: this.register });
  }

  getMetrics(): any {
    return this.register.metrics();
  }
}
