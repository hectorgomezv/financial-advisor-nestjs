import { Module } from '@nestjs/common';
import { AboutController } from './routes/about.controller.js';
import { AboutService } from './domain/about.service.js';

@Module({
  controllers: [AboutController],
  providers: [AboutService],
})
export class AboutModule {}
