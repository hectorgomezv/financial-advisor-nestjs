import { faker } from '@faker-js/faker';
import { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DataInterceptor } from './data.interceptor.js';

describe('[unit] data-interceptor', () => {
  const interceptor = new DataInterceptor();

  it('should pipe data', () => {
    const ctx = {
      getRequest: vi.fn().mockReturnValue({ statusCode: 200 }),
      getResponse: vi
        .fn()
        .mockReturnValue({ originalUrl: faker.internet.url() }),
    };

    const pipeFn = vi.fn();

    const next = {
      handle: vi.fn().mockReturnValue({
        pipe: pipeFn,
      }),
    };

    const executionContext = {
      switchToHttp: vi.fn().mockReturnValue(ctx),
    } as unknown as ExecutionContext;

    interceptor.intercept(executionContext, next);

    expect(pipeFn).toHaveBeenCalledTimes(1);
  });
});
