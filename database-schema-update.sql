-- Database Schema Update - Add message and marketing_consent fields
-- Run this SQL in your D1 database to add the new columns

-- Add message column
ALTER TABLE expressions_of_interest ADD COLUMN message TEXT;

-- Add marketing_consent column (stored as INTEGER: 0 = false, 1 = true)
ALTER TABLE expressions_of_interest ADD COLUMN marketing_consent INTEGER DEFAULT 0;

-- Verify the changes
-- SELECT * FROM expressions_of_interest LIMIT 1;
