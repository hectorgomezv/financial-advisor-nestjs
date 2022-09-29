import { Request, Response } from 'express';
import { LoggerMiddleware } from './logger.middleware';

describe('[unit] logger-middleware', () => {
  const loggerMiddleware = new LoggerMiddleware();
  const mockedNextFn = jest.fn();

  const request = {
    method: 'GET',
    url: 'testUrl',
  } as unknown as Request;

  const response = {
    statusCode: 200,
    on: jest.fn(),
  } as unknown as Response;

  it('should call next middleware', () => {
    loggerMiddleware.use(request, response, mockedNextFn);
    expect(mockedNextFn).toHaveBeenCalledTimes(1);
  });
});
