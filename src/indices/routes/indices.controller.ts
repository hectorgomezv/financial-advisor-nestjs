import {
  Controller,
  Get,
  Post,
  Request,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../../common/auth/entities/user.entity.js';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard.js';
import { OkArrayResponse } from '../../common/routes/entities/ok-array-response.entity.js';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter.js';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor.js';
import { IndicesService } from '../domain/indices.service.js';
import { Index } from './entities/index.entity.js';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@ApiTags('indices')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'indices',
  version: '2',
})
export class IndicesController {
  constructor(private readonly indicesService: IndicesService) {}

  @Get()
  @OkArrayResponse(Index)
  async findAll(@Request() req) {
    return this.indicesService.findAll(req.user as User);
  }

  @Post('/reload')
  @OkArrayResponse(Index)
  create(@Request() req) {
    return this.indicesService.reloadAll(req.user as User);
  }
}
