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
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Supabase credentials are not configured');
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching repeat customer ratio data...');
    
    // Query the repeat_ratio view
    const { data, error } = await supabase
      .from('vw_repeat_customers')
      .select('repeat_customers, new_customers')
      .single(); // We expect only one row with the ratio
    
    if (error) {
      console.error('Database query error:', error);
      
      // Check for specific error types
      if (error.code === '42P01') {
        throw new Error('The repeat customers view does not exist. Please run the database migrations.');
      } else if (error.code === 'PGRST116') {
        // Handle case where no results are found (single() with no results)
        console.warn('No repeat customer data found, returning default values');
        return res.status(200).json({ repeat_customers: 0, new_customers: 0 });
      } else {
        throw new Error(`Database query failed: ${error.message}`);
      }
    }
    
    console.log('Retrieved repeat customer ratio data');
    
    // Return the repeat ratio data
    res.status(200).json(data || { repeat_customers: 0, new_customers: 0 });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch repeat ratio data',
      code: error.code
    });
  }
} 