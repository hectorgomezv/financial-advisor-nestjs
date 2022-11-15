import { faker } from '@faker-js/faker';
import { HttpModule } from '@nestjs/axios';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import Redis from 'ioredis';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { AuthClient } from '../../common/__tests__/auth/auth.client';
import { MongoDBClient } from '../../common/__tests__/database/mongodb.client';
import { createCompanyDtoFactory } from '../domain/dto/test/create-company.dto.factory';
import { CompaniesRepository } from '../repositories/companies.repository';

describe('Companies e2e tests', () => {
  let app: INestApplication;
  let authClient: AuthClient;
  let createdUuid: string;
  let mongoClient: MongoDBClient;

  const dto = createCompanyDtoFactory(faker.random.words(), 'IBM');
  const accessToken = process.env.ACCESS_TOKEN;

  const redis = new Redis({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
  });

  beforeAll(async () => {
    authClient = new AuthClient();
    mongoClient = new MongoDBClient();
    const collection = await mongoClient.getCollection('companies');
    await collection.deleteMany({});

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, HttpModule],
      providers: [AuthClient],
    }).compile();

    await moduleRef.get(CompaniesRepository).model.db.dropDatabase();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    redis.flushall();
  });

  it.only('/GET companies', async () => {
    const foo = await authClient.getAuth();
    console.log(foo);
    return request(app.getHttpServer())
      .get('/companies')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
        success: true,
        status: 200,
        path: '/companies',
        data: [],
      });
  });

  it('/POST company', () => {
    return request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto)
      .expect(201)
      .then(({ body }) => {
        createdUuid = body.data.uuid;
        expect(body).toEqual({
          success: true,
          status: 201,
          path: '/companies',
          data: expect.objectContaining({
            uuid: createdUuid,
            name: dto.name,
            symbol: dto.symbol,
            state: expect.anything(),
          }),
        });
      });
  });

  it('/GET company by uuid', () => {
    return request(app.getHttpServer())
      .get(`/companies/${createdUuid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/companies/${createdUuid}`,
          data: expect.objectContaining({
            uuid: createdUuid,
            name: dto.name,
            symbol: dto.symbol,
            state: expect.anything(),
          }),
        });
      });
  });

  it('/DELETE company by uuid', () => {
    return request(app.getHttpServer())
      .delete(`/companies/${createdUuid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/companies/${createdUuid}`,
          data: expect.objectContaining({
            uuid: createdUuid,
            name: dto.name,
            symbol: dto.symbol,
          }),
        });
      });
  });

  afterAll(async () => {
    await app.close();
    await redis.flushall();
    await mongoClient.close();
    await redis.quit();
  });
});
