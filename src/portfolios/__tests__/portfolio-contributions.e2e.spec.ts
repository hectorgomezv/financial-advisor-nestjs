import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { createPortfolioDtoFactory } from '../domain/dto/test/create-portfolio-dto.factory';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { MongoDBClient } from '../../common/__tests__/database/mongodb.client';
import { AuthClient } from '../../common/__tests__/auth/auth.client';
import { addPortfolioContributionDtoFactory } from '../domain/dto/test/add-portfolio-contribution.dto.factory';
import { PortfoliosService } from '../domain/portfolios.service';
import { faker } from '@faker-js/faker';

describe('Portfolio contributions e2e tests', () => {
  let app: INestApplication;
  let mongoClient: MongoDBClient;
  let accessToken: string;
  let createdPortfolioUuid: string;
  let firstContributionUuid: string;
  let secondContributionUuid: string;

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
        firstContributionUuid = body.data.contributions[0].uuid;
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
                timestamp: addContributionDto.timestamp,
                amountEUR: addContributionDto.amountEUR,
              }),
            ]),
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
        secondContributionUuid = body.data.contributions[1].uuid;
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
                timestamp: addContributionDto.timestamp,
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
          data: {
            uuid: createdPortfolioUuid,
            count: 2,
            sum: addContributionDto.amountEUR * 2,
            offset: PortfoliosService.DEFAULT_OFFSET,
            limit: PortfoliosService.DEFAULT_LIMIT,
            items: expect.arrayContaining([
              expect.objectContaining({
                uuid: expect.any(String),
                timestamp: addContributionDto.timestamp,
                amountEUR: addContributionDto.amountEUR,
              }),
            ]),
          },
        });
      });
  });

  it('GET portfolio contributions page', () => {
    const offset = 1;
    const limit = faker.datatype.number({ min: 0, max: 100 });
    return request(app.getHttpServer())
      .get(
        `/portfolios/${createdPortfolioUuid}/contributions?offset=${offset}&limit=${limit}`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/portfolios/${createdPortfolioUuid}/contributions?offset=${offset}&limit=${limit}`,
          data: {
            uuid: createdPortfolioUuid,
            count: 2,
            sum: addContributionDto.amountEUR * 2,
            offset,
            limit,
            items: expect.arrayContaining([
              expect.objectContaining({
                uuid: expect.any(String),
                timestamp: addContributionDto.timestamp,
                amountEUR: addContributionDto.amountEUR,
              }),
            ]),
          },
        });
      });
  });

  it('DELETE portfolio contributions', () => {
    return request(app.getHttpServer())
      .delete(
        `/portfolios/${createdPortfolioUuid}/contributions/${firstContributionUuid}`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/portfolios/${createdPortfolioUuid}/contributions/${firstContributionUuid}`,
          data: expect.objectContaining({
            uuid: createdPortfolioUuid,
            name: createPortfolioDto.name,
            contributions: expect.any(Array),
          }),
        });
      });
  });

  it('DELETE portfolio contributions', () => {
    return request(app.getHttpServer())
      .delete(
        `/portfolios/${createdPortfolioUuid}/contributions/${secondContributionUuid}`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/portfolios/${createdPortfolioUuid}/contributions/${secondContributionUuid}`,
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
