import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../app.module.js';
import { AuthClient } from '../../common/__tests__/auth/auth.client.js';
import { MongoDBClient } from '../../common/__tests__/database/mongodb.client.js';
import { User } from '../../common/auth/entities/user.entity.js';
import { createCompanyDtoFactory } from '../../companies/domain/dto/test/create-company.dto.factory.js';
import { createPortfolioDtoFactory } from '../domain/dto/test/create-portfolio-dto.factory.js';
import { upsertPositionDtoFactory } from '../domain/dto/test/upsert-position-dto.factory.js';
import { PortfoliosRepository } from '../repositories/portfolios.repository.js';

describe('Portfolios e2e tests', () => {
  let app: INestApplication;
  let mongoClient: MongoDBClient;
  let accessToken: string;
  let user: User;
  let createdPortfolioUuid: string;
  let createdCompanyUuid: string;
  let createdPositionUuid: string;

  const createPortfolioDto = createPortfolioDtoFactory();
  const createCompanyDto = createCompanyDtoFactory();
  const upsertPositionDto = upsertPositionDtoFactory(createCompanyDto.symbol);

  beforeAll(async () => {
    const authClient = new AuthClient();
    const { data } = await authClient.getAuth();
    accessToken = data.accessToken;
    user = {
      id: data.user._id,
      email: data.user.email,
      role: data.user.role,
    };

    mongoClient = new MongoDBClient();
    const collection = await mongoClient.getCollection('portfolios');
    await collection.deleteMany({});

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await moduleRef.get(PortfoliosRepository).model.db.dropDatabase();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/GET portfolios', () => {
    return request
      .default(app.getHttpServer())
      .get('/portfolios')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
        success: true,
        status: 200,
        path: '/portfolios',
        data: [],
      });
  });

  it('/POST portfolio, company and two positions', async () => {
    await request
      .default(app.getHttpServer())
      .post('/portfolios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createPortfolioDto)
      .expect(201)
      .then(({ body }) => {
        createdPortfolioUuid = body.data.uuid;
        expect(body).toEqual({
          success: true,
          status: 201,
          path: '/portfolios',
          data: expect.objectContaining({
            uuid: createdPortfolioUuid,
            name: createPortfolioDto.name,
            ownerId: user.id,
          }),
        });
      });

    await request
      .default(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createCompanyDto)
      .expect(201)
      .then(({ body }) => {
        createdCompanyUuid = body.data.uuid;
        expect(body).toEqual({
          success: true,
          status: 201,
          path: '/companies',
          data: expect.objectContaining({
            uuid: createdCompanyUuid,
            name: createCompanyDto.name,
            symbol: createCompanyDto.symbol,
          }),
        });
      });

    return request
      .default(app.getHttpServer())
      .post(`/portfolios/${createdPortfolioUuid}/positions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(upsertPositionDto)
      .expect(201)
      .then(({ body }) => {
        createdPositionUuid = body.data.uuid;
        expect(body).toEqual({
          success: true,
          status: 201,
          path: `/portfolios/${createdPortfolioUuid}/positions`,
          data: expect.objectContaining({
            uuid: createdPositionUuid,
            targetWeight: upsertPositionDto.targetWeight,
            shares: upsertPositionDto.shares,
            companyUuid: expect.any(String),
            portfolioUuid: expect.any(String),
          }),
        });
      });
  });

  it('/GET portfolio by uuid', () => {
    return request
      .default(app.getHttpServer())
      .get(`/portfolios/${createdPortfolioUuid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/portfolios/${createdPortfolioUuid}`,
          data: expect.objectContaining({
            uuid: createdPortfolioUuid,
            name: createPortfolioDto.name,
          }),
        });
      });
  });

  it('/DELETE portfolio and company by uuid', async () => {
    await request
      .default(app.getHttpServer())
      .delete(`/portfolios/${createdPortfolioUuid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/portfolios/${createdPortfolioUuid}`,
          data: expect.objectContaining({
            uuid: createdPortfolioUuid,
            name: createPortfolioDto.name,
          }),
        });
      });

    return request
      .default(app.getHttpServer())
      .delete(`/companies/${createdCompanyUuid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/companies/${createdCompanyUuid}`,
          data: expect.objectContaining({
            uuid: createdCompanyUuid,
            name: createCompanyDto.name,
            symbol: createCompanyDto.symbol,
          }),
        });
      });
  });

  afterAll(async () => {
    await app.close();
    await mongoClient.close();
  });
});
