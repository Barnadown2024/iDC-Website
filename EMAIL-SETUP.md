# Email Notifications Setup Guide

This guide will help you set up email notifications for new Expressions of Interest submissions.

## Overview

When someone submits the form, you can receive an email notification with their details. The system supports multiple email services:

1. **Resend** (Recommended - Easy setup, free tier)
2. **SendGrid** (Free tier: 100 emails/day)
3. **Cloudflare Email Workers** (Advanced)
4. **Custom Email Worker** (Advanced)

## Option 1: Resend (Recommended) ⭐

Resend is developer-friendly and has a generous free tier.

### Setup Steps:

1. **Create Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for a free account
   - Verify your email

2. **Get API Key**
   - Go to [Resend Dashboard](https://resend.com/api-keys)
   - Click "Create API Key"
   - Name it: "IDC Website Notifications"
   - Copy the API key (starts with `re_`)

3. **Add Domain (Optional but Recommended)**
   - Go to [Resend Domains](https://resend.com/domains)
   - Add your domain: `insulindosescalculator.com`
   - Follow DNS verification steps
   - This allows you to send from `noreply@insulindosescalculator.com`

4. **Configure in Cloudflare**
   - Go to Cloudflare Dashboard > Workers & Pages > Pages > Your Project
   - Click **Settings** > **Environment Variables**
   - Add these variables:
     - **Variable name**: `RESEND_API_KEY`
     - **Value**: Your Resend API key
     - **Variable name**: `NOTIFICATION_EMAIL`
     - **Value**: Your email address (e.g., `support@insulindosescalculator.com`)
     - **Variable name**: `EMAIL_FROM` (optional)
     - **Value**: `Insulin Doses Calculator <noreply@insulindosescalculator.com>`

5. **Test**
   - Submit a test form
   - Check your email inbox

**Free Tier:** 3,000 emails/month, 100 emails/day

---

## Option 2: SendGrid

SendGrid offers a free tier with 100 emails per day.

### Setup Steps:

1. **Create SendGrid Account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up for free account
   - Complete verification

2. **Create API Key**
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Name it: "IDC Website"
   - Select "Full Access" or "Mail Send" permissions
   - Copy the API key

3. **Verify Sender (Required)**
   - Go to Settings > Sender Authentication
   - Verify a Single Sender or Domain
   - Follow the verification steps

4. **Configure in Cloudflare**
   - Go to Cloudflare Dashboard > Pages > Settings > Environment Variables
   - Add:
     - **Variable name**: `SENDGRID_API_KEY`
     - **Value**: Your SendGrid API key
     - **Variable name**: `NOTIFICATION_EMAIL`
     - **Value**: Your email address
     - **Variable name**: `EMAIL_FROM`
     - **Value**: Your verified sender email

5. **Test**
   - Submit a test form
   - Check your email

**Free Tier:** 100 emails/day forever

---

## Option 3: Cloudflare Email Workers (Advanced)

For advanced users who want to use Cloudflare's native email capabilities.

### Setup Steps:

1. **Set up Email Workers**
   - This requires creating a Cloudflare Worker that handles email sending
   - More complex setup - see Cloudflare documentation

2. **Configure Environment Variables**
   - `EMAIL_WORKER_URL`: URL of your email worker
   - `EMAIL_WORKER_TOKEN`: Authentication token (if required)
   - `NOTIFICATION_EMAIL`: Your email address
   - `EMAIL_FROM`: Sender email address

**Note:** This option requires more technical knowledge and setup.

---

## Quick Setup (Resend - Easiest)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to Cloudflare Pages environment variables:
   - `RESEND_API_KEY` = your API key
   - `NOTIFICATION_EMAIL` = your email
4. Done! 🎉

## Environment Variables Summary

### Required:
- `NOTIFICATION_EMAIL` - Email address to receive notifications

### For Resend:
- `RESEND_API_KEY` - Your Resend API key

### For SendGrid:
- `SENDGRID_API_KEY` - Your SendGrid API key
- `EMAIL_FROM` - Verified sender email

### For Email Workers:
- `EMAIL_WORKER_URL` - Your email worker endpoint
- `EMAIL_WORKER_TOKEN` - Authentication token (optional)

### Optional (All Services):
- `EMAIL_FROM` - Custom "from" address (defaults to noreply@insulindosescalculator.com)

## Email Content

The notification email includes:
- Submission ID
- Title
- Full Name
- Email Address
- Country
- Submission Date/Time
- Link to admin dashboard

## Testing

1. Set up your chosen email service
2. Add environment variables to Cloudflare
3. Deploy your site
4. Submit a test form
5. Check your email inbox

## Troubleshooting

### No emails received

1. **Check environment variables**
   - Verify `NOTIFICATION_EMAIL` is set
   - Verify API key is correct (for Resend/SendGrid)

2. **Check Cloudflare logs**
   - Go to Workers & Pages > Your Project > Logs
   - Look for email-related errors

3. **Verify API key permissions**
   - Resend: Check API key has send permissions
   - SendGrid: Verify sender is authenticated

4. **Check spam folder**
   - Emails might be filtered as spam initially

### Email service errors

- **Resend**: Check API key is valid and domain is verified (if using custom domain)
- **SendGrid**: Verify sender email is authenticated
- **Email Workers**: Check worker URL and authentication

### Development vs Production

- In development, emails are logged to console if no service is configured
- In production, make sure environment variables are set for the production environment

## Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** only
3. **Rotate API keys** periodically
4. **Use strong API keys** (long, random strings)
5. **Limit API key permissions** (if possible)

## Next Steps

- Set up email notifications ✅
- Test email delivery
- Customize email template (edit `formatEmailHTML` function)
- Add confirmation emails to users (optional)

---

**Recommended:** Start with Resend - it's the easiest to set up and has a great free tier!
