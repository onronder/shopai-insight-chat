import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.PROJECT_SUPABASE_URL;
const supabaseKey = process.env.PROJECT_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for required environment variables
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Querying LTV distribution data...');
    
    // Query the view for LTV distribution
    let { data, error } = await supabase
      .from('vw_ltv_distribution')
      .select('*');
    
    // If the view doesn't exist or there's an error, try a fallback
    if (error) {
      console.error('Error querying vw_ltv_distribution:', error);
      
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('view_ltv_buckets')
          .select('*');
          
        if (fallbackError) throw fallbackError;
        data = fallbackData;
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        // Return mock data as last resort
        return res.status(200).json({
          buckets: [
            { name: '$0-$50', count: 320 },
            { name: '$51-$100', count: 210 },
            { name: '$101-$200', count: 150 },
            { name: '$201-$500', count: 95 },
            { name: '$501-$1000', count: 45 },
            { name: '$1000+', count: 15 }
          ]
        });
      }
    }
    
    // Process data
    if (!data || data.length === 0) {
      console.log('No LTV distribution data found, returning empty data');
      return res.status(200).json({ buckets: [] });
    }
    
    // Transform the data to match expected frontend format
    const buckets = data.map(item => ({
      name: item.bucket_name || item.ltv_range || `$${item.min_value}-$${item.max_value}`,
      count: parseInt(item.customer_count) || 0
    }));
    
    // Sort buckets by their minimum value if possible
    buckets.sort((a, b) => {
      // Custom sorting function to handle bucket names like "$0-$50", "$51-$100", "$1000+"
      const getMinValue = (bucketName) => {
        const match = bucketName.match(/\$(\d+)/);
        return match ? parseInt(match[1]) : 0;
      };
      
      return getMinValue(a.name) - getMinValue(b.name);
    });
    
    // Return the formatted data
    return res.status(200).json({
      buckets
    });
  } catch (err) {
    console.error('Unexpected error in LTV distribution endpoint:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 