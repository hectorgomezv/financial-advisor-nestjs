import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../common/auth/auth-service';
import { IFinancialDataClient } from '../companies/datasources/financial-data.client.interface';
import { YahooFinancialDataClient } from '../companies/datasources/yahoo-financial-data.client';
import { IndicesService } from './domain/indices.service';
import { IndicesRepository } from './repositories/indices.repository';
import { IndexModel, IndexSchema } from './repositories/schemas/index.schema';
import { IndicesController } from './routes/indices.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: IndexModel.name, schema: IndexSchema }]),
    ConfigModule,
    HttpModule,
  ],
  controllers: [IndicesController],
  providers: [
    { provide: IFinancialDataClient, useClass: YahooFinancialDataClient },
    AuthService,
    IndicesService,
    IndicesRepository,
  ],
  exports: [IndicesService, IndicesRepository],
})
export class IndicesModule {}
