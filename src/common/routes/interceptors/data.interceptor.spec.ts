import { faker } from '@faker-js/faker';
import { ExecutionContext } from '@nestjs/common';
import { DataInterceptor } from './data.interceptor';

describe('[unit] data-interceptor', () => {
  const interceptor = new DataInterceptor();

  it('should pipe data', () => {
    const ctx = {
      getRequest: jest.fn().mockReturnValue({ statusCode: 200 }),
      getResponse: jest
        .fn()
        .mockReturnValue({ originalUrl: faker.internet.url() }),
    };

    const pipeFn = jest.fn();

    const next = {
      handle: jest.fn().mockReturnValue({
        pipe: pipeFn,
      }),
    };

    const executionContext = {
      switchToHttp: jest.fn().mockReturnValue(ctx),
    } as unknown as ExecutionContext;

    interceptor.intercept(executionContext, next);

    expect(pipeFn).toHaveBeenCalledTimes(1);
  });
});
