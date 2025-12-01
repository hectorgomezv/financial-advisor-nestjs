import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db.module';

@Module({
  imports: [ConfigModule, HttpModule, DbModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class CommonModule {}
