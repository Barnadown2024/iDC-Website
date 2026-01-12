# Cloudflare Pages Setup Guide

This guide will help you set up the backend infrastructure for the Expressions of Interest form.

## Prerequisites

- Cloudflare account
- Website deployed to Cloudflare Pages

## Step 1: Create D1 Database

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **D1**
3. Click **Create database**
4. Name it: `idc-expressions`
5. Choose a location (select closest to your users)
6. Click **Create**

## Step 2: Set Up Database Schema

1. In your D1 database, go to the **Console** tab
2. Copy and paste the SQL from `database-schema.sql`
3. Click **Run** to execute the SQL
4. Verify the table was created by running: `SELECT * FROM expressions_of_interest LIMIT 1;`

## Step 3: Configure Database Binding

### Option A: Via Cloudflare Dashboard (Recommended)

1. Go to **Workers & Pages** > **Pages** > Your project
2. Click **Settings** > **Functions**
3. Under **D1 Database bindings**, click **Add binding**
4. Set:
   - **Variable name**: `DB`
   - **D1 database**: Select `idc-expressions`
5. Click **Save**

### Option B: Via wrangler.toml (For local development)

1. Get your database ID from the D1 dashboard
2. Update `wrangler.toml` with your database ID
3. Run `wrangler d1 execute idc-expressions --file=./database-schema.sql` to set up the schema

## Step 4: Deploy Functions

The function is already in `functions/api/interest.js`. When you deploy to Cloudflare Pages, it will automatically be available at `/api/interest`.

### Local Testing

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Test locally
wrangler pages dev
```

## Step 5: (Optional) Add Cloudflare Turnstile Anti-Spam

### 5.1 Get Turnstile Keys

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile**
3. Click **Add Site**
4. Configure:
   - **Site name**: Insulin Doses Calculator
   - **Domain**: Your domain (e.g., insulindosescalculator.com)
   - **Widget mode**: Managed (recommended)
5. Copy your **Site Key** and **Secret Key**

### 5.2 Add Turnstile to Form

Add this before the submit button in `index.html`:

```html
<div class="form-group">
  <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>
</div>
```

Add this script before `</body>`:

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

### 5.3 Configure Secret Key

1. In Cloudflare Pages dashboard, go to **Settings** > **Environment Variables**
2. Add variable:
   - **Variable name**: `TURNSTILE_SECRET_KEY`
   - **Value**: Your Turnstile secret key
3. Uncomment the Turnstile verification code in `functions/api/interest.js`

## Step 6: Test the Form

1. Deploy your site to Cloudflare Pages
2. Visit your website
3. Fill out and submit the form
4. Check your D1 database to verify the submission was saved

## Viewing Submissions

### Via Cloudflare Dashboard

1. Go to **Workers & Pages** > **D1** > `idc-expressions`
2. Click **Console** tab
3. Run: `SELECT * FROM expressions_of_interest ORDER BY submitted_at DESC;`

### Via Wrangler CLI

```bash
wrangler d1 execute idc-expressions --command "SELECT * FROM expressions_of_interest ORDER BY submitted_at DESC;"
```

## Exporting Data (CSV)

### Via Wrangler CLI

```bash
# Export to CSV
wrangler d1 execute idc-expressions --command "SELECT * FROM expressions_of_interest;" --output csv > submissions.csv
```

### Via SQL Query

You can also use the D1 console to run queries and export results.

## Troubleshooting

### Function not found (404)

- Ensure `functions/api/interest.js` is in the correct location
- Verify the file is committed and deployed
- Check Cloudflare Pages deployment logs

### Database binding error

- Verify the D1 database binding is configured correctly
- Check that the variable name is exactly `DB`
- Ensure the database exists and is accessible

### CORS errors

- The function includes CORS headers, but you may need to adjust `Access-Control-Allow-Origin` for production
- For production, replace `*` with your actual domain

## Next Steps

- Set up email notifications when new submissions arrive
- Create an admin dashboard to view submissions
- Add data export functionality
- Set up automated backups of the database
