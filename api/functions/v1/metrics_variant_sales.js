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
      console.error('Missing Supabase credentials');
      throw new Error('Supabase credentials are not configured');
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching variant sales data...', { timeframe });
    
    // Query the variant_sales view
    const { data, error } = await supabase
      .from('vw_variant_sales')
      .select('variant_id, variant_title, total_sales')
      .order('total_sales', { ascending: false })
      .limit(10); // Limit to top 10 selling variants
    
    if (error) {
      console.error('Database query error:', error);
      
      // Check for specific error types
      if (error.code === '42P01') {
        throw new Error('The variant sales view does not exist. Please run the database migrations.');
      } else if (error.code === '42703') {
        // Handle column does not exist errors
        console.error('Column referenced in query does not exist:', error.message);
        throw new Error(`Schema mismatch: ${error.message}`);
      } else {
        throw new Error(`Database query failed: ${error.message}`);
      }
    }
    
    if (!data || data.length === 0) {
      console.warn('No variant sales data found');
    } else {
      console.log(`Retrieved ${data.length} variant sales records`);
    }
    
    // Transform the data if needed to match frontend expectations
    const transformedData = data ? data.map(item => ({
      variant_title: item.variant_title || 'Unknown Variant',
      total_sales: item.total_sales
    })) : [];
    
    // Return the variant sales data
    res.status(200).json(transformedData);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch variant sales data',
      code: error.code
    });
  }
} 