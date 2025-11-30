-- migrate:up
CREATE TABLE positions (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  blocked BOOLEAN NOT NULL,
  shares NUMERIC(10, 2) NOT NULL,
  shares_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_weight NUMERIC(5, 2) NOT NULL,
  value NUMERIC(18, 5) NOT NULL DEFAULT 0::NUMERIC
);
CREATE UNIQUE INDEX idx_uniq_positions_portfolio_id_company_id ON positions(portfolio_id, company_id);

-- migrate:down
DROP TABLE positions;
