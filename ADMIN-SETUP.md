# Admin Dashboard Setup Guide

The admin dashboard allows you to view, search, filter, and export all Expressions of Interest submissions.

## Quick Setup

### 1. Set Admin API Key

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **Pages** > Your project
3. Click **Settings** > **Environment Variables**
4. Add a new variable:
   - **Variable name**: `ADMIN_API_KEY`
   - **Value**: Generate a secure random string (e.g., use a password generator)
   - **Example**: `sk_live_abc123xyz789...` (make it long and random)
5. Click **Save**

**Security Tip:** Use a strong, random API key. You can generate one using:
```bash
# On macOS/Linux
openssl rand -hex 32

# Or use an online generator
```

### 2. Access the Admin Dashboard

1. Deploy your site to Cloudflare Pages (if not already deployed)
2. Visit: `https://yourdomain.com/admin.html`
3. Enter your API key when prompted
4. The API key will be saved in your browser's localStorage for convenience

### 3. Features

The admin dashboard includes:

- ✅ **View all submissions** with pagination (50 per page)
- ✅ **Search** by name or email
- ✅ **Filter** by country
- ✅ **Sort** by date, name, email, or country
- ✅ **Export to CSV** with all filtered results
- ✅ **Statistics** showing total submissions
- ✅ **Responsive design** for mobile devices
- ✅ **Secure authentication** via API key

## API Endpoint

The admin API is available at: `/api/admin`

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50, max: 10000)
- `search` - Search by name or email
- `country` - Filter by country
- `sortBy` - Sort column: `id`, `name`, `email`, `country`, `submitted_at`
- `sortOrder` - `ASC` or `DESC` (default: DESC)

### Authentication

Include the API key in the request header:
```
X-API-Key: your-api-key-here
```

Or as a query parameter:
```
/api/admin?api_key=your-api-key-here
```

### Example API Call

```javascript
fetch('/api/admin?page=1&limit=50&search=john', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

## Security Best Practices

1. **Use a strong API key** - Generate a long, random string
2. **Don't commit the API key** - Keep it only in Cloudflare environment variables
3. **Limit access** - Only share the API key with trusted administrators
4. **Rotate keys** - Change the API key periodically
5. **Monitor usage** - Check Cloudflare logs for suspicious activity

## Troubleshooting

### "Unauthorized" Error

- Verify `ADMIN_API_KEY` is set in Cloudflare Pages environment variables
- Check that you're using the exact same key (case-sensitive)
- Make sure the environment variable is set for the correct environment (Production/Preview)

### "Database not configured" Error

- Verify D1 database binding is configured
- Check that the binding name is `DB` in your Pages settings

### Dashboard Not Loading

- Check browser console for errors
- Verify the API endpoint is accessible: `/api/admin`
- Make sure you've deployed the latest code to Cloudflare Pages

### CSV Export Not Working

- Check browser console for errors
- Verify you have submissions in the database
- Make sure the API key is valid

## Advanced: Using Cloudflare Access

For even better security, you can use Cloudflare Access instead of API keys:

1. Set up Cloudflare Access in your dashboard
2. Protect the `/admin.html` route
3. Remove API key authentication (optional)
4. Users will authenticate via Cloudflare Access

## API Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Dr",
      "name": "John Doe",
      "email": "john@example.com",
      "country": "Ireland",
      "submitted_at": "2025-01-08 12:34:56"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  },
  "filters": {
    "countries": ["Ireland", "United Kingdom", "United States"]
  }
}
```

## Next Steps

- Set up email notifications for new submissions
- Add more filtering options (date range, etc.)
- Create custom reports
- Set up automated exports
