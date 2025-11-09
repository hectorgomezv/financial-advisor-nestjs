-- migrate:up
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  symbol VARCHAR(8) UNIQUE NOT NULL
);

-- migrate:down
DROP TABLE companies;
