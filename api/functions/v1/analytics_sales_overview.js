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
    
    // Parse query parameters for timeframe filtering (defaulting to last 30 days)
    const { timeframe = 'last30' } = req.query;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Supabase credentials are not configured');
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching analytics sales overview data...');
    
    // Query the analytics_sales_overview view
    const { data, error } = await supabase
      .from('vw_analytics_sales_overview')
      .select('period, revenue, net, refunds, orders')
      .order('period', { ascending: true });
    
    if (error) {
      console.error('Database query error:', error);
      
      // Check for specific error types
      if (error.code === '42P01') {
        throw new Error('The analytics sales overview view does not exist. Please run the database migrations.');
      } else {
        throw new Error(`Database query failed: ${error.message}`);
      }
    }
    
    if (!data || data.length === 0) {
      console.warn('No sales overview data found');
    } else {
      console.log(`Retrieved ${data.length} sales data points`);
    }
    
    // Return the sales overview data
    res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch sales overview data',
      code: error.code
    });
  }
} 