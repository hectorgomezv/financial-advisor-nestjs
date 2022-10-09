import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { createCompanyDtoFactory } from '../routes/dto/__tests__/create-company.dto.factory';

describe('Companies e2e tests', () => {
  let app: INestApplication;
  let createdUuid: string;

  const dto = createCompanyDtoFactory();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/GET companies', () => {
    return request(app.getHttpServer()).get('/companies').expect(200).expect({
      success: true,
      status: 200,
      path: '/companies',
      data: [],
    });
  });

  it('/POST company', () => {
    return request(app.getHttpServer())
      .post('/companies')
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
          }),
        });
      });
  });

  it('/GET company by uuid', () => {
    return request(app.getHttpServer())
      .get(`/companies/${createdUuid}`)
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

  it('/DELETE company by uuid', () => {
    return request(app.getHttpServer())
      .delete(`/companies/${createdUuid}`)
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
  });
});
