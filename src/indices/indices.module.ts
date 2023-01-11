import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../common/auth/auth-service';
import { IndicesService } from './domain/indices.service';
import { IndicesRepository } from './repositories/indices.repository';
import {
  IndexValueModel,
  IndexValueSchema,
} from './repositories/schemas/index-value.schema';
import { IndexModel, IndexSchema } from './repositories/schemas/index.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IndexModel.name, schema: IndexSchema },
      { name: IndexValueModel.name, schema: IndexValueSchema },
    ]),
    ConfigModule,
    HttpModule,
  ],
  controllers: [],
  providers: [AuthService, IndicesService, IndicesRepository],
  exports: [],
})
export class IndicesModule {}
