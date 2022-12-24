import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { createPortfolioDtoFactory } from '../domain/dto/test/create-portfolio-dto.factory';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { MongoDBClient } from '../../common/__tests__/database/mongodb.client';
import { AuthClient } from '../../common/__tests__/auth/auth.client';
import { addPortfolioContributionDtoFactory } from '../domain/dto/test/add-portfolio-contribution.dto.factory';

describe('Portfolio contributions e2e tests', () => {
  let app: INestApplication;
  let mongoClient: MongoDBClient;
  let accessToken: string;
  let createdPortfolioUuid: string;
  let createdContributionUuid: string;

  const createPortfolioDto = createPortfolioDtoFactory();
  const addContributionDto = addPortfolioContributionDtoFactory();

  beforeAll(async () => {
    const authClient = new AuthClient();
    const { data } = await authClient.getAuth();
    accessToken = data.accessToken;

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

  it('POST portfolio', async () => {
    await request(app.getHttpServer())
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
            seed: createPortfolioDto.seed,
            contributions: [],
          }),
        });
      });
  });

  it('POST portfolio contributions', () => {
    return request(app.getHttpServer())
      .post(`/portfolios/${createdPortfolioUuid}/contributions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(addContributionDto)
      .expect(201)
      .then(({ body }) => {
        createdContributionUuid = body.data.contributions[0].uuid;
        expect(body).toEqual({
          success: true,
          status: 201,
          path: `/portfolios/${createdPortfolioUuid}/contributions`,
          data: expect.objectContaining({
            uuid: createdPortfolioUuid,
            name: createPortfolioDto.name,
            contributions: expect.arrayContaining([
              expect.objectContaining({
                uuid: expect.any(String),
                timestamp: addContributionDto.timestamp.toISOString(),
                amountEUR: addContributionDto.amountEUR,
              }),
            ]),
          }),
        });
      });
  });

  it('GET portfolio contributions', () => {
    return request(app.getHttpServer())
      .get(`/portfolios/${createdPortfolioUuid}/contributions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/portfolios/${createdPortfolioUuid}/contributions`,
          data: expect.arrayContaining([
            expect.objectContaining({
              uuid: expect.any(String),
              timestamp: addContributionDto.timestamp.toISOString(),
              amountEUR: addContributionDto.amountEUR,
            }),
          ]),
        });
      });
  });

  it('DELETE portfolio contributions', () => {
    return request(app.getHttpServer())
      .delete(
        `/portfolios/${createdPortfolioUuid}/contributions/${createdContributionUuid}`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/portfolios/${createdPortfolioUuid}/contributions/${createdContributionUuid}`,
          data: expect.objectContaining({
            uuid: createdPortfolioUuid,
            name: createPortfolioDto.name,
            contributions: [],
          }),
        });
      });
  });

  it('DELETE portfolio', async () => {
    return request(app.getHttpServer())
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
  });

  afterAll(async () => {
    await app.close();
    await mongoClient.close();
  });
});
