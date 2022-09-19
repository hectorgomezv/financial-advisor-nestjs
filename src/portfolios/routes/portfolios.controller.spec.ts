import { Test, TestingModule } from '@nestjs/testing';
import { PortfoliosService } from '../domain/portfolios.service';
import { PortfoliosController } from './portfolios.controller';

describe('PortfoliosController', () => {
  let controller: PortfoliosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfoliosController],
      providers: [PortfoliosService],
    }).compile();

    controller = module.get<PortfoliosController>(PortfoliosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
