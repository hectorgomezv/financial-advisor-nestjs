import { Controller, Get, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OkResponse } from '../../common/routes/entities/ok-response.entity';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { HealthService } from '../domain/health.service';
import { Health } from './entities/health.entity';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@ApiTags('health')
@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @OkResponse(Health)
  findOne() {
    return this.healthService.findOne();
  }
}
