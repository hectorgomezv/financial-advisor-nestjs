import { Module } from '@nestjs/common';
import { CompaniesService } from './domain/companies.service';
import { CompaniesController } from './routes/companies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesRepository } from './repositories/companies.repository';
import {
  CompanyModel,
  CompanySchema,
} from './repositories/schemas/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyModel.name, schema: CompanySchema },
    ]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
  exports: [CompaniesRepository],
})
export class CompaniesModule {}
