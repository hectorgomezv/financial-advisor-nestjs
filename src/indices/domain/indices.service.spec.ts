import { AuthService } from '../../common/auth/auth-service';
import { IFinancialDataClient } from '../../companies/datasources/financial-data.client.interface';
import { IndicesRepository } from '../repositories/indices.repository';
import { IndicesService } from './indices.service';

describe('IndicesService', () => {
  const mockedIndicesRepository = jest.mocked(
    {} as unknown as IndicesRepository,
  );

  const mockedAuthService = jest.mocked({} as unknown as AuthService);

  const mockedFinancialDataClient = jest.mocked(
    {} as unknown as IFinancialDataClient,
  );

  const service = new IndicesService(
    mockedIndicesRepository,
    mockedAuthService,
    mockedFinancialDataClient,
  );

  beforeEach(() => jest.resetAllMocks());

  describe('retrieving', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
