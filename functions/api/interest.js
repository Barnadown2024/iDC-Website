/**
 * Cloudflare Pages Function to handle Expressions of Interest form submissions
 * 
 * Setup required:
 * 1. Create a Cloudflare D1 database
 * 2. Bind the database in wrangler.toml or Cloudflare dashboard
 * 3. Run the SQL schema to create the table (see below)
 * 4. Set up email notifications (see EMAIL-SETUP.md)
 * 
 * SQL Schema for D1:
 * CREATE TABLE IF NOT EXISTS expressions_of_interest (
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *   title TEXT,
 *   name TEXT NOT NULL,
 *   email TEXT NOT NULL,
 *   country TEXT NOT NULL,
 *   submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
 * );
 */

/**
 * Send notification email using Cloudflare Email Workers or Email API
 */
async function sendNotificationEmail({ to, subject, submission }, env) {
  // Format email body
  const emailBody = `
New Expression of Interest Received

Submission Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${submission.id}
Title: ${submission.title}
Name: ${submission.name}
Email: ${submission.email}
Country: ${submission.country}
Submitted: ${new Date(submission.submittedAt).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can view all submissions in the admin dashboard:
https://insulindosescalculator.com/admin.html

Or query the database directly in Cloudflare D1.
  `.trim();

  // Option 1: Use Cloudflare Email Workers (if configured)
  // This requires setting up Email Workers in your Cloudflare account
  if (env.EMAIL_WORKER_URL) {
    const emailResponse = await fetch(env.EMAIL_WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.EMAIL_WORKER_TOKEN || ''}`
      },
      body: JSON.stringify({
        to,
        from: env.EMAIL_FROM || 'noreply@insulindosescalculator.com',
        subject,
        text: emailBody,
        html: formatEmailHTML(submission)
      })
    });

    if (!emailResponse.ok) {
      throw new Error(`Email Worker failed: ${emailResponse.statusText}`);
    }

    return await emailResponse.json();
  }

  // Option 2: Use Resend API (recommended - free tier available)
  if (env.RESEND_API_KEY) {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || 'Insulin Doses Calculator <noreply@insulindosescalculator.com>',
        to: [to],
        subject,
        text: emailBody,
        html: formatEmailHTML(submission)
      })
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.json();
      throw new Error(`Resend API failed: ${error.message || resendResponse.statusText}`);
    }

    return await resendResponse.json();
  }

  // Option 3: Use SendGrid API
  if (env.SENDGRID_API_KEY) {
    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }]
        }],
        from: {
          email: env.EMAIL_FROM || 'noreply@insulindosescalculator.com',
          name: 'Insulin Doses Calculator'
        },
        subject,
        content: [
          {
            type: 'text/plain',
            value: emailBody
          },
          {
            type: 'text/html',
            value: formatEmailHTML(submission)
          }
        ]
      })
    });

    if (!sendgridResponse.ok) {
      const error = await sendgridResponse.text();
      throw new Error(`SendGrid API failed: ${error}`);
    }

    return { success: true };
  }

  // If no email service configured, log to console (for development)
  console.log('Email notification (no service configured):', {
    to,
    subject,
    submission
  });

  return { success: true, note: 'Email service not configured' };
}

/**
 * Format submission as HTML email
 */
function formatEmailHTML(submission) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4A90E2, #5BA3F5); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: 600; color: #666; font-size: 0.9rem; }
    .value { font-size: 1rem; color: #333; margin-top: 5px; }
    .divider { border-top: 2px solid #4A90E2; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #4A90E2; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">New Expression of Interest</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Insulin Doses Calculator</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Submission ID</div>
        <div class="value">#${submission.id}</div>
      </div>
      <div class="field">
        <div class="label">Title</div>
        <div class="value">${submission.title}</div>
      </div>
      <div class="field">
        <div class="label">Full Name</div>
        <div class="value">${submission.name}</div>
      </div>
      <div class="field">
        <div class="label">Email Address</div>
        <div class="value"><a href="mailto:${submission.email}">${submission.email}</a></div>
      </div>
      <div class="field">
        <div class="label">Country</div>
        <div class="value">${submission.country}</div>
      </div>
      <div class="field">
        <div class="label">Submitted</div>
        <div class="value">${new Date(submission.submittedAt).toLocaleString()}</div>
      </div>
      <div class="divider"></div>
      <a href="https://insulindosescalculator.com/admin.html" class="button">View in Admin Dashboard</a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    const { title, name, email, country } = data;
    
    if (!name || !email || !country) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, and country are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Cloudflare Turnstile verification (only if token is provided)
    // This allows the form to work on localhost/testing while still verifying on production
    if (env.TURNSTILE_SECRET_KEY) {
      const turnstileToken = data['cf-turnstile-response'];
      
      // Only verify if token is present (production domain)
      // If no token, allow submission (for localhost/testing)
      if (turnstileToken) {
        const turnstileResponse = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              secret: env.TURNSTILE_SECRET_KEY,
              response: turnstileToken,
              remoteip: request.headers.get('CF-Connecting-IP') || ''
            })
          }
        );
        
        const turnstileResult = await turnstileResponse.json();
        if (!turnstileResult.success) {
          return new Response(
            JSON.stringify({ error: 'Turnstile verification failed' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      // If no token provided, continue without verification (for localhost/testing)
    }
    
    // Insert into D1 database
    if (!env.DB) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if this email already exists (optional - allows updates/resubmissions)
    // For expressions of interest, we'll allow duplicates but could optionally update instead
    const existing = await env.DB.prepare(
      `SELECT id FROM expressions_of_interest WHERE email = ? ORDER BY submitted_at DESC LIMIT 1`
    ).bind(email).first();
    
    // Insert new submission (allowing duplicates - user might want to update info)
    const result = await env.DB.prepare(
      `INSERT INTO expressions_of_interest (title, name, email, country, submitted_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).bind(title || null, name, email, country).run();
    
    // Send notification email using Cloudflare Email Routing
    if (env.NOTIFICATION_EMAIL) {
      try {
        await sendNotificationEmail({
          to: env.NOTIFICATION_EMAIL,
          subject: 'New Expression of Interest - Insulin Doses Calculator',
          submission: {
            id: result.meta.last_row_id,
            title: title || 'Not provided',
            name,
            email,
            country,
            submittedAt: new Date().toISOString()
          }
        }, env);
      } catch (emailError) {
        // Log email error but don't fail the submission
        console.error('Failed to send notification email:', emailError);
        // Continue - submission is still successful
      }
    }
    
    // Get origin from request for CORS
    const origin = request.headers.get('Origin');
    const allowedOrigins = [
      'https://insulindosescalculator.com',
      'https://www.insulindosescalculator.com'
    ];
    const isCloudflarePreview = origin && origin.includes('.pages.dev');
    const allowOrigin = (origin && (allowedOrigins.includes(origin) || isCloudflarePreview)) 
      ? origin 
      : '*'; // Fallback for development/localhost
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Thank you for your interest. We\'ll be in touch.',
        id: result.meta.last_row_id 
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowOrigin,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
    
  } catch (error) {
    console.error('Error processing form submission:', error);
    
    // Provide more specific error messages
    let errorMessage = 'An error occurred while processing your submission. Please try again later.';
    let statusCode = 500;
    
    // Check for specific database errors
    if (error.message && error.message.includes('UNIQUE constraint')) {
      errorMessage = 'This email address has already been registered. If you need to update your information, please contact us at support@insulindosescalculator.com';
      statusCode = 409; // Conflict
    } else if (error.message && error.message.includes('SQLITE_ERROR')) {
      errorMessage = 'Database error. Please try again or contact support@insulindosescalculator.com';
      statusCode = 500;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle CORS preflight requests
export async function onRequestOptions(context) {
  const { request } = context;
  const origin = request.headers.get('Origin');
  
  // Allow your production domain and Cloudflare Pages preview URLs
  const allowedOrigins = [
    'https://insulindosescalculator.com',
    'https://www.insulindosescalculator.com'
  ];
  
  // Also allow Cloudflare Pages preview URLs (for testing)
  const isCloudflarePreview = origin && origin.includes('.pages.dev');
  
  const allowOrigin = allowedOrigins.includes(origin) || isCloudflarePreview 
    ? origin 
    : '*';
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
