import { Module } from '@nestjs/common';
import { AboutController } from './routes/about.controller';
import { AboutService } from './domain/about.service';

@Module({
  controllers: [AboutController],
  providers: [AboutService],
})
export class AboutModule {}
