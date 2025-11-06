-- migrate:up
CREATE TABLE company_states (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  peg NUMERIC(10, 5),
  price NUMERIC(18, 2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_company_states_timestamp_desc ON company_states(timestamp DESC);
CREATE INDEX idx_company_states_company_id ON company_states(company_id);

-- migrate:down
DROP TABLE company_states;
