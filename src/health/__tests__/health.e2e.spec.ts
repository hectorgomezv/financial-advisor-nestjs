import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { PgMigrator } from '../../common/pg.migrator';
import { HealthModule } from '../health.module';

describe('Health e2e tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthModule],
    })
      .overrideProvider(PgMigrator) // TODO: delete this after migration
      .useValue({})
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/GET health', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({
        success: true,
        status: 200,
        path: '/health',
        data: { health: 'OK' },
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
