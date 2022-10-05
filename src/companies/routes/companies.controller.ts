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
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MainExceptionFilter } from '../../common/routes/filters/main-exception.filter';
import { DataInterceptor } from '../../common/routes/interceptors/data.interceptor';
import { CompaniesService } from '../domain/companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Company } from './entities/company.entity';

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
  @ApiCreatedResponse({ type: Company })
  @ApiBadRequestResponse()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOkResponse({ type: [Company] })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':uuid')
  @ApiOkResponse({ type: Company })
  @ApiNotFoundResponse()
  findOne(@Param('uuid') uuid: string) {
    return this.companiesService.findOne(uuid);
  }

  @Delete(':uuid')
  @ApiOkResponse({ type: Company })
  @ApiNotFoundResponse()
  remove(@Param('uuid') uuid: string) {
    return this.companiesService.remove(uuid);
  }
}
