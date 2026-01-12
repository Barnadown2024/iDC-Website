-- Quick SQL to create the table
-- Copy and paste this into your D1 database console

CREATE TABLE IF NOT EXISTS expressions_of_interest (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  message TEXT,
  marketing_consent INTEGER DEFAULT 0,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email ON expressions_of_interest(email);
CREATE INDEX IF NOT EXISTS idx_submitted_at ON expressions_of_interest(submitted_at);
