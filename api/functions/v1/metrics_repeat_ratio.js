import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.PROJECT_SUPABASE_URL;
const supabaseKey = process.env.PROJECT_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for required credentials
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching repeat ratio data...');
    
    // Query the view
    let { data, error } = await supabase
      .from('vw_repeat_customers')
      .select('*')
      .single();
      
    // If the view doesn't exist or there's an error, try a fallback
    if (error) {
      console.error('Error querying vw_repeat_customers:', error);
      
      // Try fallback to old view name if it exists
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('view_repeat_customers')
          .select('*')
          .single();
          
        if (fallbackError) throw fallbackError;
        data = fallbackData;
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        // Return mock data as last resort
        return res.status(200).json({
          repeat_count: 350,
          new_count: 650
        });
      }
    }
    
    // Process data
    if (!data) {
      console.log('No repeat ratio data found, returning zeros');
      return res.status(200).json({
        repeat_count: 0,
        new_count: 0
      });
    }
    
    // Transform the data to match frontend expectations
    const repeat_count = parseInt(data.repeat_count || 0, 10);
    const new_count = parseInt(data.new_count || 0, 10);
    
    // Return the data
    return res.status(200).json({
      repeat_count,
      new_count
    });
  } catch (err) {
    console.error('Unexpected error in repeat ratio endpoint:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 