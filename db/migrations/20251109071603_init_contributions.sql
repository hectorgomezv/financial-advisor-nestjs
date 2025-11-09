-- migrate:up
CREATE TABLE portfolio_contributions (
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  amount_eur NUMERIC(10, 2) NOT NULL
);
CREATE INDEX idx_portfolio_contributions_timestamp_desc ON portfolio_contributions(timestamp DESC);
CREATE INDEX idx_portfolio_contributions_portfolio_id ON portfolio_contributions(portfolio_id);

-- migrate:down
DROP TABLE portfolio_contributions;
