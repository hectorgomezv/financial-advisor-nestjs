import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../../common/auth/entities/user.entity';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CreatedResponse } from '../../common/routes/entities/created-response.entity';
import { OkArrayResponse } from '../../common/routes/entities/ok-array-response.entity';
import { OkResponse } from '../../common/routes/entities/ok-response.entity';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { DataPoint } from '../../indices/routes/entities/data-point.entity';
import { PortfolioDetailDto } from '../domain/dto/portfolio-detail.dto';
import { UpdatePortfolioCashDto } from '../domain/dto/update-portfolio-cash.dto';
import { PortfoliosService } from '../domain/portfolios.service';
import { PositionsService } from '../domain/positions.service';
import { AddPortfolioContributionDto } from './dto/add-portfolio-contribution.dto';
import { ContributionsPage } from './dto/contributions-page.dto';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpsertPositionDto } from './dto/upsert-position.dto';
import { PortfolioAverageMetric as PortfolioAverageBalance } from './entities/portfolio-average-balance.entity';
import { Portfolio } from './entities/portfolio.entity';
import { Position } from './entities/position.entity';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@ApiTags('portfolios')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'portfolios',
  version: '2',
})
export class PortfoliosController {
  constructor(
    private readonly portfoliosService: PortfoliosService,
    private readonly positionsService: PositionsService,
  ) {}

  @Post()
  @CreatedResponse(Portfolio)
  @ApiBadRequestResponse()
  create(@Request() req, @Body() createPortfolioDto: CreatePortfolioDto) {
    return this.portfoliosService.create(req.user as User, createPortfolioDto);
  }

  @Get()
  @OkArrayResponse(Portfolio)
  findAll(@Request() req) {
    return this.portfoliosService.findByOwnerId(req.user as User);
  }

  @Get(':uuid')
  @OkResponse(PortfolioDetailDto)
  @ApiNotFoundResponse()
  findOne(@Request() req, @Param('uuid') uuid: string) {
    return this.portfoliosService.findOne(req.user as User, uuid);
  }

  @Delete(':uuid')
  @ApiNotFoundResponse()
  @OkResponse(Portfolio)
  remove(@Request() req, @Param('uuid') uuid: string) {
    return this.portfoliosService.deleteOne(req.user as User, uuid);
  }

  @Get(':uuid/metrics/average-balances')
  @OkArrayResponse(PortfolioAverageBalance)
  @ApiNotFoundResponse()
  @ApiQuery({ name: 'range', type: String, required: false })
  getPortfolioMetrics(
    @Request() req,
    @Param('uuid') uuid: string,
    @Query('range') range?: string,
  ) {
    return this.portfoliosService.getAverageBalances(
      req.user as User,
      uuid,
      range,
    );
  }
  @Get(':uuid/metrics/performance')
  @OkArrayResponse(DataPoint)
  @ApiNotFoundResponse()
  @ApiQuery({ name: 'range', type: String, required: false })
  getDataPoint(
    @Request() req,
    @Param('uuid') uuid: string,
    @Query('range') range?: string,
  ): Promise<DataPoint[]> {
    return this.portfoliosService.getPerformance(req.user as User, uuid, range);
  }

  @Post(':uuid/positions')
  @CreatedResponse(Position)
  @ApiBadRequestResponse()
  addPosition(
    @Request() req,
    @Param('uuid') uuid: string,
    @Body() upsertPositionDto: UpsertPositionDto,
  ) {
    return this.positionsService.create(
      req.user as User,
      uuid,
      upsertPositionDto,
    );
  }

  @Put(':uuid/positions')
  @OkResponse(Position)
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  updatePosition(
    @Request() req,
    @Param('uuid') uuid: string,
    @Body() upsertPositionDto: UpsertPositionDto,
  ) {
    return this.positionsService.update(
      req.user as User,
      uuid,
      upsertPositionDto,
    );
  }

  @Put(':uuid/cash')
  @OkResponse(Position)
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  updatePortfolioCash(
    @Request() req,
    @Param('uuid') uuid: string,
    @Body() updatePortfolioCash: UpdatePortfolioCashDto,
  ) {
    return this.portfoliosService.updateCash(
      req.user as User,
      uuid,
      updatePortfolioCash,
    );
  }

  @Get(':uuid/contributions')
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @OkResponse(ContributionsPage)
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getContributions(
    @Request() req,
    @Param('uuid') uuid: string,
    @Query(
      'offset',
      new DefaultValuePipe(PortfoliosService.DEFAULT_OFFSET),
      ParseIntPipe,
    )
    offset?: number,
    @Query(
      'limit',
      new DefaultValuePipe(PortfoliosService.DEFAULT_LIMIT),
      ParseIntPipe,
    )
    limit?: number,
  ): Promise<ContributionsPage> {
    const contributionsMetadata =
      await this.portfoliosService.getContributionsMetadata(
        req.user as User,
        uuid,
      );
    const contributions = await this.portfoliosService.getContributions(
      req.user as User,
      uuid,
      offset,
      limit,
    );

    return <ContributionsPage>{
      uuid,
      count: contributionsMetadata.count,
      sum: contributionsMetadata.sum,
      offset,
      limit,
      items: contributions,
    };
  }

  @Post(':uuid/contributions')
  @CreatedResponse(Portfolio)
  @ApiBadRequestResponse()
  addContribution(
    @Request() req,
    @Param('uuid') uuid: string,
    @Body() addPortfolioContributionDto: AddPortfolioContributionDto,
  ) {
    return this.portfoliosService.addContribution(
      req.user as User,
      uuid,
      addPortfolioContributionDto,
    );
  }

  @Delete(':uuid/contributions/:contributionUuid')
  @CreatedResponse(Portfolio)
  @ApiBadRequestResponse()
  deleteContribution(
    @Request() req,
    @Param('uuid') uuid: string,
    @Param('contributionUuid') contributionUuid: string,
  ) {
    return this.portfoliosService.deleteContribution(
      req.user as User,
      uuid,
      contributionUuid,
    );
  }

  @Delete(':uuid/positions/:positionUuid')
  @OkResponse(Position)
  @ApiNotFoundResponse()
  deletePosition(
    @Request() req,
    @Param('uuid') uuid: string,
    @Param('positionUuid') positionUuid: string,
  ) {
    return this.positionsService.deleteByUuidAndPortfolioUuid(
      req.user as User,
      uuid,
      positionUuid,
    );
  }
}
