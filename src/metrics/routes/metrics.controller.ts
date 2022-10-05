import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MetricsService } from '../domain/metrics.service';

@ApiTags('metrics')
@Controller({
  path: 'metrics',
  version: '1',
})
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOkResponse({ type: String, description: 'Prometheus Metrics string' })
  getAll() {
    return this.metricsService.getMetrics();
  }
}
