/**
 * Cloudflare Pages Function to handle Expressions of Interest form submissions
 * 
 * Setup required:
 * 1. Create a Cloudflare D1 database
 * 2. Bind the database in wrangler.toml or Cloudflare dashboard
 * 3. Run the SQL schema to create the table (see below)
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
    
    const result = await env.DB.prepare(
      `INSERT INTO expressions_of_interest (title, name, email, country, submitted_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).bind(title || null, name, email, country).run();
    
    // Optional: Send notification email (requires additional service)
    // You can integrate with services like Resend, SendGrid, or Cloudflare Email Routing
    
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
          'Access-Control-Allow-Origin': '*', // Adjust for production
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
    
  } catch (error) {
    console.error('Error processing form submission:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your submission. Please try again later.' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
