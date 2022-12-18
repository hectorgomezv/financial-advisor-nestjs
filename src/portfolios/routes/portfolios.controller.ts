import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../../common/auth/entities/user.entity';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CreatedResponse } from '../../common/routes/entities/created-response.entity';
import { OkArrayResponse } from '../../common/routes/entities/ok-array-response.entity';
import { OkResponse } from '../../common/routes/entities/ok-response.entity';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { UpdatePortfolioCashDto } from '../domain/dto/update-portfolio-cash.dto';
import { PortfoliosService } from '../domain/portfolios.service';
import { PositionsService } from '../domain/positions.service';
import { AddPortfolioContributionDto } from './dto/add-portfolio-contribution.dto';
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
  @OkResponse(Portfolio)
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
