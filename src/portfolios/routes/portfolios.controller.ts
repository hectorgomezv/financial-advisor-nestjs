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
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatedResponse } from '../../common/routes/entities/created-response.entity';
import { OkArrayResponse } from '../../common/routes/entities/ok-array-response.entity';
import { OkResponse } from '../../common/routes/entities/ok-response.entity';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { CreatePortfolioDto } from '../domain/dto/create-portfolio.dto';
import { UpsertPositionDto } from '../domain/dto/create-position.dto';
import { PortfoliosService } from '../domain/portfolios.service';
import { PositionsService } from '../domain/positions.service';
import { PortfolioAverageMetric } from './entities/portfolio-average-metric.entity';
import { Portfolio } from './entities/portfolio.entity';
import { Position } from './entities/position.entity';

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
  @CreatedResponse(Portfolio)
  @ApiBadRequestResponse()
  create(@Body() createPortfolioDto: CreatePortfolioDto) {
    return this.portfoliosService.create(createPortfolioDto);
  }

  @Get()
  @OkArrayResponse(Portfolio)
  findAll() {
    return this.portfoliosService.findAll();
  }

  @Get(':uuid')
  @OkResponse(Portfolio)
  @ApiNotFoundResponse()
  findOne(@Param('uuid') uuid: string) {
    return this.portfoliosService.findOne(uuid);
  }

  @Delete(':uuid')
  @ApiNotFoundResponse()
  @OkResponse(Portfolio)
  remove(@Param('uuid') uuid: string) {
    return this.portfoliosService.deleteOne(uuid);
  }

  @Get(':uuid/metrics')
  @OkArrayResponse(PortfolioAverageMetric)
  @ApiNotFoundResponse()
  getPortfolioMetrics(
    @Param('uuid') uuid: string,
    @Query('range') range?: string,
  ) {
    return this.portfoliosService.getMetrics(uuid, range);
  }

  @Post(':uuid/positions')
  @CreatedResponse(Position)
  @ApiBadRequestResponse()
  addPosition(
    @Param('uuid') uuid: string,
    @Body() upsertPositionDto: UpsertPositionDto,
  ) {
    return this.positionsService.create(uuid, upsertPositionDto);
  }

  @Put(':uuid/positions')
  @OkResponse(Position)
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  updatePosition(
    @Param('uuid') uuid: string,
    @Body() upsertPositionDto: UpsertPositionDto,
  ) {
    return this.positionsService.update(uuid, upsertPositionDto);
  }

  @Delete(':uuid/positions/:positionUuid')
  @OkResponse(Position)
  @ApiNotFoundResponse()
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
