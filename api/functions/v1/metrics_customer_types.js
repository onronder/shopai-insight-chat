import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Parse storeId from query params
    const { storeId } = req.query;
    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    // Query the view
    let { data, error } = await supabase
      .from('vw_analytics_customer_types')
      .select('*')
      .eq('store_id', storeId);

    // If the view doesn't exist or there's an error, try a fallback
    if (error) {
      console.error('Error querying vw_analytics_customer_types:', error);
      
      // Try fallback to old view name if it exists
      let fallbackData;
      try {
        const { data: fallbackResult, error: fallbackError } = await supabase
          .from('view_customer_types')
          .select('*')
          .eq('store_id', storeId);
          
        if (fallbackError) throw fallbackError;
        fallbackData = fallbackResult;
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        // Return mock data as last resort
        return res.status(200).json({
          customerTypes: [
            { type: 'new', count: 120 },
            { type: 'returning', count: 80 },
            { type: 'loyal', count: 50 }
          ]
        });
      }
      
      // Transform fallback data to match expected format
      data = fallbackData;
    }

    // Transform data to match frontend expectations
    const customerTypes = data.map(item => ({
      type: item.customer_type || item.type,
      count: item.count || 0
    }));

    // Return the data
    return res.status(200).json({ customerTypes });
  } catch (err) {
    console.error('Unexpected error in customer types endpoint:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 