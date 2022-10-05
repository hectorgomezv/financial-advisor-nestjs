import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UseFilters,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { CreatePortfolioDto } from '../domain/dto/create-portfolio.dto';
import { UpsertPositionDto } from '../domain/dto/create-position.dto';
import { PortfoliosService } from '../domain/portfolios.service';
import { PositionsService } from '../domain/positions.service';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@ApiTags('portfolios')
@Controller({
  path: 'portfolios',
  version: '1',
})
export class PortfoliosController {
  constructor(
    private readonly portfoliosService: PortfoliosService,
    private readonly positionsService: PositionsService,
  ) {}

  @Post()
  create(@Body() createPortfolioDto: CreatePortfolioDto) {
    return this.portfoliosService.create(createPortfolioDto);
  }

  @Get()
  findAll() {
    return this.portfoliosService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.portfoliosService.findOne(uuid);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.portfoliosService.deleteOne(uuid);
  }

  @Get(':uuid/metrics')
  getPortfolioMetrics(
    @Param('uuid') uuid: string,
    @Query('range') range?: string,
  ) {
    return this.portfoliosService.getMetrics(uuid, range);
  }

  @Post(':uuid/positions')
  addPosition(
    @Param('uuid') uuid: string,
    @Body() upsertPositionDto: UpsertPositionDto,
  ) {
    return this.positionsService.create(uuid, upsertPositionDto);
  }

  @Put(':uuid/positions')
  updatePosition(
    @Param('uuid') uuid: string,
    @Body() upsertPositionDto: UpsertPositionDto,
  ) {
    return this.positionsService.update(uuid, upsertPositionDto);
  }

  @Delete(':uuid/positions/:positionUuid')
  deletePosition(
    @Param('uuid') uuid: string,
    @Param('positionUuid') positionUuid: string,
  ) {
    return this.positionsService.deleteByUuidAndPortfolioUuid(
      uuid,
      positionUuid,
    );
  }
}
