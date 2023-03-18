import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { database, status, up } from 'migrate-mongo';

@Injectable()
export class MigrationsRunner implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationsRunner.name);

  async onApplicationBootstrap() {
    const { db, client } = await database.connect();
    const migrationsStatus = await status(db);

    migrationsStatus.forEach(({ fileName, appliedAt }) =>
      this.logger.log(`Already applied migration: ${fileName}: ${appliedAt}`),
    );

    const migrated = await up(db, client);
    migrated.forEach((name) => this.logger.warn('Migrated:', name));
  }
}
