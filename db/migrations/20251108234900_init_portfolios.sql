-- migrate:up
CREATE TABLE portfolios (
  id SERIAL PRIMARY KEY,
  cash NUMERIC (18, 2),
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name VARCHAR(64) NOT NULL UNIQUE,
  owner_id VARCHAR(64)
);

CREATE TABLE portfolio_states (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  cash NUMERIC(10, 2),
  is_valid BOOLEAN NOT NULL,
  roic_eur NUMERIC(18, 5),
  sum_weights NUMERIC(10, 5) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_value_eur NUMERIC(18, 2) NOT NULL
);
CREATE INDEX idx_portfolio_states_timestamp_desc ON portfolio_states(timestamp DESC);
CREATE INDEX idx_portfolio_states_portfolio_id ON portfolio_states(portfolio_id);

-- migrate:down
DROP TABLE portfolio_states;
DROP TABLE portfolios;

