import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { describe, it, beforeAll, afterAll } from 'vitest';
import { HealthModule } from '../health.module.js';

describe('Health e2e tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/GET health', () => {
    return request
      .default(app.getHttpServer())
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
