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
    
    // Parse query parameters
    const { min_days = 30, limit = 10 } = req.query;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Supabase credentials are not configured');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching churn candidates data...', { min_days, limit });
    
    // Query the churn candidates view
    let query = supabase
      .from('vw_churn_candidates')
      .select('id, email, days_inactive')
      .order('days_inactive', { ascending: false });
    
    // Apply minimum days filter
    if (min_days && !isNaN(parseFloat(min_days))) {
      query = query.gte('days_inactive', parseFloat(min_days));
    }
    
    // Apply limit
    query = query.limit(parseInt(limit, 10));
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database query error:', error);
      
      // If primary view doesn't exist, try fallback view
      if (error.code === '42P01') {
        console.warn('Primary view not found, trying fallback view');
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('vw_customer_churn_candidates')
          .select('*')
          .order('days_inactive', { ascending: false })
          .limit(parseInt(limit, 10));
          
        if (fallbackError) {
          console.error('Fallback view error:', fallbackError);
          return res.status(200).json([]);
        }
        
        // Transform the data to match expected format
        const transformedData = fallbackData ? fallbackData.map(item => ({
          id: item.customer_id || '',
          email: item.email || 'unknown@example.com',
          days_inactive: item.days_inactive || 0
        })) : [];
        
        return res.status(200).json(transformedData);
      }
      
      throw new Error(`Database query failed: ${error.message}`);
    }
    
    // Return the churn candidates data
    res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch churn candidates data' });
  }
} 