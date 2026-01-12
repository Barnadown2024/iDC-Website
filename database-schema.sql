-- Cloudflare D1 Database Schema for Expressions of Interest
-- Run this SQL in your D1 database to create the table

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

-- Create an index on email for faster lookups (optional)
CREATE INDEX IF NOT EXISTS idx_email ON expressions_of_interest(email);

-- Create an index on submitted_at for date-based queries (optional)
CREATE INDEX IF NOT EXISTS idx_submitted_at ON expressions_of_interest(submitted_at);
