# Quick Start - Fix "no such table" Error

## Option 1: Using Cloudflare Dashboard (Easiest)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **D1**
3. Click on your database (e.g., `idc-expressions`)
4. Click the **Console** tab
5. Copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS expressions_of_interest (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email ON expressions_of_interest(email);
CREATE INDEX IF NOT EXISTS idx_submitted_at ON expressions_of_interest(submitted_at);
```

6. Click **Run** or press Enter
7. You should see "Success. No rows returned"

## Option 2: Using Wrangler CLI

If you have Wrangler CLI installed:

```bash
# Make sure you're in the project directory
cd "/Users/diarmuidkeane/Desktop/iDC Website"

# Run the SQL file
wrangler d1 execute idc-expressions --file=./create-table.sql

# Or run it directly
wrangler d1 execute idc-expressions --command "CREATE TABLE IF NOT EXISTS expressions_of_interest (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, name TEXT NOT NULL, email TEXT NOT NULL, country TEXT NOT NULL, submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
```

## Verify Table Was Created

Run this query in the D1 console:

```sql
SELECT name FROM sqlite_master WHERE type='table' AND name='expressions_of_interest';
```

You should see `expressions_of_interest` in the results.

## Test the Table

Try inserting a test record:

```sql
INSERT INTO expressions_of_interest (title, name, email, country) 
VALUES ('Dr', 'Test User', 'test@example.com', 'Ireland');
```

Then query it:

```sql
SELECT * FROM expressions_of_interest;
```

## Still Having Issues?

1. **Check database binding**: Make sure your D1 database is bound to your Pages project
   - Go to Pages > Your Project > Settings > Functions
   - Verify `DB` binding exists and points to your database

2. **Check database name**: Make sure you're using the correct database name in commands

3. **Redeploy**: After creating the table, you may need to redeploy your Pages project
