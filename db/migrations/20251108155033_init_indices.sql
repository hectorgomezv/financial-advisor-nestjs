-- migrate:up
CREATE TABLE indices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  symbol VARCHAR(8) UNIQUE NOT NULL
);

CREATE TABLE index_states (
  index_id INTEGER NOT NULL REFERENCES indices(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ,
  value NUMERIC(18, 5)
);
CREATE INDEX idx_index_states_timestamp_desc ON index_states(timestamp DESC);
CREATE INDEX idx_index_states_index_id ON index_states(index_id);

-- migrate:down
DROP TABLE index_states;
DROP TABLE indices;
