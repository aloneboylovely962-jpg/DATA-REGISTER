-- DATA-REGISTER Phase 2
-- Business, location, user and account foundation.
-- Run this file once against the Railway PostgreSQL database.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  currency CHAR(3) NOT NULL DEFAULT 'PKR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'BRANCH',
  parent_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, name)
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'STAFF',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, email)
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  account_number TEXT,
  opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, name)
);

CREATE INDEX IF NOT EXISTS idx_locations_business ON locations(business_id);
CREATE INDEX IF NOT EXISTS idx_users_business ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_accounts_business ON accounts(business_id);

INSERT INTO businesses (name, code)
VALUES ('RFC / MGS', 'RFC-MGS')
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (business_id, name, type)
SELECT id, 'Main Branch', 'BRANCH'
FROM businesses
WHERE code = 'RFC-MGS'
  AND NOT EXISTS (
    SELECT 1 FROM locations l
    WHERE l.business_id = businesses.id AND l.name = 'Main Branch'
  );

INSERT INTO accounts (business_id, name, type, location_id)
SELECT b.id, 'Cash', 'CASH', l.id
FROM businesses b
JOIN locations l ON l.business_id = b.id AND l.name = 'Main Branch'
WHERE b.code = 'RFC-MGS'
  AND NOT EXISTS (
    SELECT 1 FROM accounts a
    WHERE a.business_id = b.id AND a.name = 'Cash'
  );

INSERT INTO accounts (business_id, name, type, location_id)
SELECT b.id, 'Bank', 'BANK', l.id
FROM businesses b
JOIN locations l ON l.business_id = b.id AND l.name = 'Main Branch'
WHERE b.code = 'RFC-MGS'
  AND NOT EXISTS (
    SELECT 1 FROM accounts a
    WHERE a.business_id = b.id AND a.name = 'Bank'
  );
