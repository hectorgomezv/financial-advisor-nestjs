import { PositionsRepository } from '../repositories/positions.repository';
import { PositionsService } from './positions.service';

describe('PositionsService', () => {
  const positionsRepository = {} as unknown as PositionsRepository;
  const mockedPositionsRepository = jest.mocked(positionsRepository);

  const service: PositionsService = new PositionsService(
    mockedPositionsRepository,
  );

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
