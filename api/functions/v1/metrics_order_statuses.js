import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.PROJECT_SUPABASE_URL;
const supabaseKey = process.env.PROJECT_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Parse query parameters for timeframe filtering
    const { timeframe = 'last_30_days' } = req.query;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Query the order_statuses view with optional timeframe filter
    let query = supabase
      .from('vw_order_statuses')
      .select('status, count')
      .order('count', { ascending: false });
    
    // Apply timeframe filter if specified in the database view
    if (timeframe && timeframe !== 'all') {
      query = query.eq('timeframe', timeframe);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }
    
    // Return the order statuses data
    res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch order statuses data' });
  }
} 