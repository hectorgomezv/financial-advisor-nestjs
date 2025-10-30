import { faker } from '@faker-js/faker';
import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MainExceptionFilter } from './main-exception.filter.js';

describe('[unit] main-exception filter', () => {
  const fakeUrl = faker.internet.url();
  const fakeErrMsg = faker.word.words();
  const fakeResponse = {
    [faker.word.sample()]: faker.word.sample(),
    [faker.word.sample()]: faker.word.sample(),
    [faker.word.sample()]: faker.word.sample(),
  };

  const mockedHttpAdapterHost = vi.mocked({
    httpAdapter: {
      getRequestUrl: vi.fn().mockReturnValue(fakeUrl),
      reply: vi.fn(),
    },
  } as unknown as HttpAdapterHost);

  const mockedHost = vi.mocked({
    switchToHttp: vi.fn().mockReturnValue({
      getRequest: vi.fn(),
      getResponse: vi.fn().mockReturnValue(fakeResponse),
    }),
  } as unknown as ArgumentsHost);

  const filter = new MainExceptionFilter(mockedHttpAdapterHost);

  beforeEach(() => vi.clearAllMocks());

  it('should map a non-http exception to a 500 error', async () => {
    const exception = new Error(fakeErrMsg);

    filter.catch(exception, mockedHost);

    expect(mockedHttpAdapterHost.httpAdapter.reply).toBeCalledTimes(1);
    expect(mockedHttpAdapterHost.httpAdapter.reply).toBeCalledWith(
      fakeResponse,
      {
        success: false,
        status: 500,
        path: fakeUrl,
        data: {
          message: fakeErrMsg,
        },
      },
      500,
    );
  });

  it('should map a http exception to its code', async () => {
    const exception = new NotFoundException(fakeErrMsg);

    filter.catch(exception, mockedHost);

    expect(mockedHttpAdapterHost.httpAdapter.reply).toBeCalledTimes(1);
    expect(mockedHttpAdapterHost.httpAdapter.reply).toBeCalledWith(
      fakeResponse,
      {
        success: false,
        status: 404,
        path: fakeUrl,
        data: {
          message: fakeErrMsg,
        },
      },
      404,
    );
  });
});
