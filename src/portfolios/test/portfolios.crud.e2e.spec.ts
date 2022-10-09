import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { createPortfolioDtoFactory } from '../domain/dto/test/create-portfolio-dto.factory';

describe('Portfolios e2e tests', () => {
  let app: INestApplication;
  let createdUuid: string;

  const dto = createPortfolioDtoFactory();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/GET portfolios', () => {
    return request(app.getHttpServer()).get('/portfolios').expect(200).expect({
      success: true,
      status: 200,
      path: '/portfolios',
      data: [],
    });
  });

  it('/POST portfolio', () => {
    return request(app.getHttpServer())
      .post('/portfolios')
      .send(dto)
      .expect(201)
      .then(({ body }) => {
        createdUuid = body.data.uuid;
        expect(body).toEqual({
          success: true,
          status: 201,
          path: '/portfolios',
          data: expect.objectContaining({
            uuid: createdUuid,
            name: dto.name,
          }),
        });
      });
  });

  it('/GET portfolio by uuid', () => {
    return request(app.getHttpServer())
      .get(`/portfolios/${createdUuid}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/portfolios/${createdUuid}`,
          data: expect.objectContaining({
            uuid: createdUuid,
            name: dto.name,
          }),
        });
      });
  });

  it('/DELETE portfolio by uuid', () => {
    return request(app.getHttpServer())
      .delete(`/portfolios/${createdUuid}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          success: true,
          status: 200,
          path: `/portfolios/${createdUuid}`,
          data: expect.objectContaining({
            uuid: createdUuid,
            name: dto.name,
          }),
        });
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
