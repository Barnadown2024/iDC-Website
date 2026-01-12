/**
 * Admin API for viewing Expressions of Interest submissions
 * 
 * Security: This endpoint requires authentication via API key
 * Set ADMIN_API_KEY in Cloudflare Pages environment variables
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Check authentication
    const apiKey = request.headers.get('X-API-Key') || 
                   new URL(request.url).searchParams.get('api_key');
    
    if (!env.ADMIN_API_KEY || apiKey !== env.ADMIN_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Invalid or missing API key.' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check database
    if (!env.DB) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const search = url.searchParams.get('search') || '';
    const country = url.searchParams.get('country') || '';
    const sortBy = url.searchParams.get('sortBy') || 'submitted_at';
    const sortOrder = url.searchParams.get('sortOrder') || 'DESC';
    
    // Build query
    let query = 'SELECT * FROM expressions_of_interest WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (country) {
      query += ' AND country = ?';
      params.push(country);
    }
    
    // Validate sortBy to prevent SQL injection
    const allowedSortColumns = ['id', 'name', 'email', 'country', 'submitted_at'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'submitted_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    // Get submissions
    const submissions = await env.DB.prepare(query).bind(...params).all();
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM expressions_of_interest WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }
    
    if (country) {
      countQuery += ' AND country = ?';
      countParams.push(country);
    }
    
    const countResult = await env.DB.prepare(countQuery).bind(...countParams).first();
    const total = countResult?.total || 0;
    
    // Get unique countries for filter
    const countriesResult = await env.DB.prepare(
      'SELECT DISTINCT country FROM expressions_of_interest ORDER BY country'
    ).all();
    const countries = countriesResult.results.map(r => r.country).filter(Boolean);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: submissions.results || [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        filters: {
          countries
        }
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
    
  } catch (error) {
    console.error('Error fetching admin data:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while fetching submissions.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-API-Key, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
