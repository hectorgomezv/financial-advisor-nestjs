-- migrate:up
CREATE TABLE currencies (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(3) NOT NULL,
  usd_value NUMERIC(18, 5) NOT NULL
);
CREATE UNIQUE INDEX idx_uniq_currencies_symbol ON currencies(symbol);

-- migrate:down
DROP TABLE currencies;
