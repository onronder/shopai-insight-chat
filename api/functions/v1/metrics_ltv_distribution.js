import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
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
      return res.status(200).end();
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Supabase credentials are not configured');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching LTV distribution data...');
    
    // Query the correct view, maintaining expected field names
    const { data, error } = await supabase
      .from('vw_ltv_distribution')
      .select('bucket, count');
    
    if (error) {
      console.error('Database query error:', error);
      
      // If primary view doesn't exist, try fallback
      if (error.code === '42P01') {
        console.warn('Primary view not found, trying fallback view');
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('view_ltv_distribution')
          .select('*');
          
        if (fallbackError) {
          console.error('Fallback view error:', fallbackError);
          throw new Error(`Database query failed: ${fallbackError.message}`);
        }
        
        // Transform to match expected structure if needed
        const transformedData = fallbackData ? fallbackData.map(item => ({
          bucket: item.ltv_bucket || 'Unknown',
          count: item.customer_count || 0
        })) : [];
        
        return res.status(200).json(transformedData);
      }
      
      throw new Error(`Database query failed: ${error.message}`);
    }

    // Return the LTV distribution data
    res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch LTV distribution data' });
  }
} 