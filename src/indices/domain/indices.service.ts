import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthService } from '../../common/auth/auth-service';
import { User } from '../../common/auth/entities/user.entity';
import { IndicesRepository } from '../repositories/indices.repository';

@Injectable()
export class IndicesService {
  private readonly logger = new Logger(IndicesService.name);

  constructor(
    private readonly repository: IndicesRepository,
    private readonly authService: AuthService,
  ) {}

  findAll(user: User) {
    this.authService.checkAdmin(user);
    return this.repository.findAll();
  }

  @Cron('* * * * *')
  private async refreshIndicesValues() {
    const indices = await this.repository.findAll();
    this.logger.log(`Indices: ${indices}`);
    await Promise.all(
      indices.map((i) => this.logger.log(`Getting data for ${i.name} index`)),
    );
  }
}
