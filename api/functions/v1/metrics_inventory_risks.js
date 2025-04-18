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
    
    // Parse query parameters
    const { risk_type, limit = 20 } = req.query;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Supabase credentials are not configured');
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching inventory risks data...', { risk_type, limit });
    
    // Build the query
    let query = supabase
      .from('vw_inventory_risks')
      .select('product_id, product_title, variant_title, risk_type, inventory_level, reorder_point, sales_velocity');
    
    // Apply risk type filter if specified
    if (risk_type && risk_type !== 'all') {
      query = query.eq('risk_type', risk_type);
    }
    
    // Apply order and limit
    query = query.order('risk_type', { ascending: true }).limit(parseInt(limit, 10));
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database query error:', error);
      
      // Check for specific error types
      if (error.code === '42P01') {
        throw new Error('The inventory risks view does not exist. Please run the database migrations.');
      } else {
        throw new Error(`Database query failed: ${error.message}`);
      }
    }
    
    if (!data || data.length === 0) {
      console.warn('No inventory risks data found');
    } else {
      console.log(`Retrieved ${data.length} inventory risk items`);
    }
    
    // Return the inventory risks data
    res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch inventory risks data',
      code: error.code
    });
  }
} 