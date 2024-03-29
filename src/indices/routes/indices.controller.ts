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
import { User } from '../../common/auth/entities/user.entity';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { OkArrayResponse } from '../../common/routes/entities/ok-array-response.entity';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { IndicesService } from '../domain/indices.service';
import { Index } from './entities/index.entity';

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
