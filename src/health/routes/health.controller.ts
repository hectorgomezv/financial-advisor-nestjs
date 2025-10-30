import { Controller, Get, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OkResponse } from '../../common/routes/entities/ok-response.entity.js';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter.js';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor.js';
import { HealthService } from '../domain/health.service.js';
import { Health } from './entities/health.entity.js';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@ApiTags('health')
@Controller({
  path: 'health',
  version: '2',
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @OkResponse(Health)
  findOne() {
    try {
      return this.healthService.findOne();
    } catch (err) {
      throw err;
    }
  }
}
