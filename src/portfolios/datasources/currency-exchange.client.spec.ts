import Decimal from 'decimal.js';
import { CurrenciesRepository } from '../repositories/currencies.repository';
import { CurrencyExchangeClient } from './currency-exchange.client';
import { OpenExchangeRatesClient } from './open-exchange-rates.client';

describe('CurrencyExchangeClient', () => {
  const mockedOpenExchangeRatesClient = jest.mocked({
    getRates: jest.fn(),
  } as unknown as OpenExchangeRatesClient);

  const mockedCurrenciesRepository = jest.mocked({
    getRates: jest.fn(),
    upsertRate: jest.fn(),
  } as unknown as CurrenciesRepository);

  const client = new CurrencyExchangeClient(
    mockedOpenExchangeRatesClient,
    mockedCurrenciesRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  describe('getRatesFromDb', () => {
    it('should get rates from the database', async () => {
      mockedCurrenciesRepository.getRates.mockResolvedValueOnce([
        { symbol: 'EUR', usdValue: new Decimal(0.85) },
        { symbol: 'GBP', usdValue: new Decimal(0.75) },
        { symbol: 'JPY', usdValue: new Decimal(110.0) },
      ]);

      const actual = await client.getRatesFromDb();

      expect(mockedCurrenciesRepository.getRates).toHaveBeenCalledTimes(1);
      expect(actual).toEqual({
        EUR: 0.85,
        GBP: 0.75,
        JPY: 110.0,
      });
    });

    it('should refresh rates if no data is present in the database', async () => {
      mockedCurrenciesRepository.getRates.mockResolvedValueOnce([]);
      mockedOpenExchangeRatesClient.getRates.mockResolvedValueOnce({
        EUR: 0.9933,
        GBP: 0.87221,
        JPY: 120.0525,
      });

      const actual = await client.getRatesFromDb();

      expect(mockedCurrenciesRepository.getRates).toHaveBeenCalledTimes(1);
      expect(mockedOpenExchangeRatesClient.getRates).toHaveBeenCalledTimes(1);
      expect(actual).toEqual({
        EUR: 0.9933,
        GBP: 0.87221,
        JPY: 120.0525,
      });
    });
  });

  describe('refreshFx', () => {
    it('should get rates from the client', async () => {
      mockedOpenExchangeRatesClient.getRates.mockResolvedValueOnce({
        EUR: 0.9933,
        GBP: 0.87221,
        JPY: 120.0525,
      });

      const actual = await client.refreshFx();

      expect(mockedOpenExchangeRatesClient.getRates).toHaveBeenCalledTimes(1);
      expect(actual).toEqual({
        EUR: 0.9933,
        GBP: 0.87221,
        JPY: 120.0525,
      });
    });

    it('should store the rates in the database', async () => {
      mockedOpenExchangeRatesClient.getRates.mockResolvedValueOnce({
        EUR: 0.9933,
        GBP: 0.87221,
        JPY: 120.0525,
      });

      await client.refreshFx();

      expect(mockedOpenExchangeRatesClient.getRates).toHaveBeenCalledTimes(1);
      expect(mockedCurrenciesRepository.upsertRate).toHaveBeenCalledTimes(3);
      expect(mockedCurrenciesRepository.upsertRate).toHaveBeenCalledWith(
        'EUR',
        new Decimal(0.9933),
      );
      expect(mockedCurrenciesRepository.upsertRate).toHaveBeenCalledWith(
        'GBP',
        new Decimal(0.87221),
      );
      expect(mockedCurrenciesRepository.upsertRate).toHaveBeenCalledWith(
        'JPY',
        new Decimal(120.0525),
      );
    });
  });
});
