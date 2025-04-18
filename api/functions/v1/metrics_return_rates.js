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
    
    // Parse query parameters for filtering
    const { 
      timeframe = 'last_30_days',
      min_return_rate = 0,
      limit = 10
    } = req.query;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Supabase credentials are not configured');
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching return rates data...', { timeframe, min_return_rate, limit });
    
    // Query the return_rates view with filtering
    let query = supabase
      .from('vw_return_rates')
      .select('product_id, product_title, orders_count, returns_count, return_rate')
      .gte('return_rate', parseFloat(min_return_rate) || 0)
      .order('return_rate', { ascending: false })
      .limit(parseInt(limit, 10));
    
    // Apply timeframe filter if specified in the database view
    if (timeframe && timeframe !== 'all') {
      try {
        query = query.eq('timeframe', timeframe);
      } catch (e) {
        // If timeframe filter errors, we'll continue without it (handled in error block)
        console.warn('Potential issue with timeframe filter - will handle if query fails');
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database query error:', error);
      
      // Check for specific error types
      if (error.code === '42P01') {
        throw new Error('The return rates view does not exist. Please run the database migrations.');
      } else if (error.code === '42703' && error.message.includes('timeframe')) {
        // If the error is about the timeframe column not existing, retry without the filter
        console.warn('Timeframe filtering not supported for this view, retrying without filter');
        const { data: retryData, error: retryError } = await supabase
          .from('vw_return_rates')
          .select('product_id, product_title, orders_count, returns_count, return_rate')
          .gte('return_rate', parseFloat(min_return_rate) || 0)
          .order('return_rate', { ascending: false })
          .limit(parseInt(limit, 10));
          
        if (retryError) {
          throw new Error(`Database query failed on retry: ${retryError.message}`);
        }
        
        return res.status(200).json(retryData || []);
      } else {
        throw new Error(`Database query failed: ${error.message}`);
      }
    }
    
    if (!data || data.length === 0) {
      console.warn('No return rates data found');
    } else {
      console.log(`Retrieved ${data.length} return rate records`);
    }
    
    // Return the return rates data
    res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch return rates data',
      code: error.code
    });
  }
} 