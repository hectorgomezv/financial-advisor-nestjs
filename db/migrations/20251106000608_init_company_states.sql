-- migrate:up
CREATE TABLE company_states (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  currency VARCHAR(8) NOT NULL,
  enterprise_to_ebitda NUMERIC(10, 5),
  enterprise_to_revenue NUMERIC(10, 5),
  forward_pe NUMERIC(10, 5),
  price NUMERIC(18, 2) NOT NULL,
  profit_margin NUMERIC(10, 5),
  short_percent NUMERIC(10, 5),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_company_states_timestamp_desc ON company_states(timestamp DESC);
CREATE INDEX idx_company_states_company_id ON company_states(company_id);

-- migrate:down
DROP TABLE company_states;
