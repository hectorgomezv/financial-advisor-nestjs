import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UseFilters,
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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from '../domain/dto/create-company.dto';
import { Company, CompanyWithState } from './entities/company.entity';

@UseInterceptors(DataInterceptor)
@UseFilters(MainExceptionFilter)
@ApiTags('companies')
@Controller({
  path: 'companies',
  version: '1',
})
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @CreatedResponse(CompanyWithState)
  @ApiBadRequestResponse()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @OkArrayResponse(CompanyWithState)
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':uuid')
  @OkResponse(CompanyWithState)
  @ApiNotFoundResponse()
  findOne(@Param('uuid') uuid: string) {
    return this.companiesService.findOne(uuid);
  }

  @Delete(':uuid')
  @OkResponse(Company)
  @ApiNotFoundResponse()
  remove(@Param('uuid') uuid: string) {
    return this.companiesService.remove(uuid);
  }
}
