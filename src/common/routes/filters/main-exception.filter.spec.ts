import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { faker } from '@faker-js/faker';
import { MainExceptionFilter } from './main-exception.filter';

describe('[unit] main-exception filter', () => {
  const fakeUrl = faker.internet.url();
  const fakeErrMsg = faker.random.words();
  const fakeResponse = JSON.parse(faker.datatype.json());

  const mockedHttpAdapterHost = jest.mocked({
    httpAdapter: {
      getRequestUrl: jest.fn().mockReturnValue(fakeUrl),
      reply: jest.fn(),
    },
  } as unknown as HttpAdapterHost);

  const mockedHost = jest.mocked({
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
      getResponse: jest.fn().mockReturnValue(fakeResponse),
    }),
  } as unknown as ArgumentsHost);

  const filter = new MainExceptionFilter(mockedHttpAdapterHost);

  beforeEach(() => jest.clearAllMocks());

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
