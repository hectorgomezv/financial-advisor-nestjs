import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from '../domain/metrics.service.js';
import { MetricsController } from './metrics.controller.js';

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [MetricsService],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
