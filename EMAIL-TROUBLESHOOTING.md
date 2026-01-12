# Email Notification Troubleshooting Guide

## Quick Checklist

### 1. Required Environment Variables

Make sure these are set in Cloudflare Pages → Settings → Environment Variables:

- ✅ `NOTIFICATION_EMAIL` - Your email address (where you want to receive notifications)
- ✅ One of the following email service variables:
  - `RESEND_API_KEY` (Recommended - easiest setup)
  - `SENDGRID_API_KEY` 
  - `EMAIL_WORKER_URL` (If using Cloudflare Email Workers)

### 2. Check Cloudflare Logs

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Pages** → Your Project
2. Click **Logs** tab
3. Submit a test form
4. Look for these log messages:
   - ✅ "Attempting to send email notification to: [your email]"
   - ✅ "Email service check:" (shows which services are configured)
   - ❌ Any error messages

### 3. Common Issues

#### Issue: "Email service not configured"
**Solution:** You need to set one of:
- `RESEND_API_KEY` (easiest - sign up at resend.com)
- `SENDGRID_API_KEY` 
- `EMAIL_WORKER_URL`

#### Issue: "NOTIFICATION_EMAIL not set"
**Solution:** Add `NOTIFICATION_EMAIL` environment variable with your email address

#### Issue: Emails going to spam
**Solution:** 
- Check spam/junk folder
- If using Resend, verify your domain
- If using SendGrid, verify your sender

#### Issue: Cloudflare Email Workers not working
**Solution:** 
- Make sure `EMAIL_WORKER_URL` is set to your worker's endpoint
- Check that your worker is deployed and accessible
- Verify the worker accepts POST requests with the expected format

### 4. Recommended: Use Resend (Easiest)

1. Sign up at [resend.com](https://resend.com) (free)
2. Get API key from dashboard
3. Add to Cloudflare:
   - `RESEND_API_KEY` = your API key
   - `NOTIFICATION_EMAIL` = your email
4. Deploy
5. Test

**Free Tier:** 3,000 emails/month

### 5. Test Email Sending

After setting up, test by:
1. Submitting the form on your website
2. Checking Cloudflare logs for any errors
3. Checking your email inbox (and spam folder)
4. If no email, check logs for error messages

### 6. Debug Information

The code now logs:
- Which email service is being used
- Whether services are configured
- Any errors that occur
- Success confirmation

Check Cloudflare Pages logs to see what's happening.
