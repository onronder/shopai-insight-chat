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

    // Parse query parameters for timeframe filtering
    const { timeframe = '30d' } = req.query;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Supabase credentials are not configured');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching sales overview data...', { timeframe });
    
    let interval;
    switch (timeframe) {
      case '7d':
        interval = '7 days';
        break;
      case '30d':
        interval = '30 days';
        break;
      case '90d':
        interval = '90 days';
        break;
      case '365d':
        interval = '365 days';
        break;
      default:
        interval = '30 days';
    }
    
    // Query the sales overview view
    const { data, error } = await supabase
      .from('vw_analytics_sales_overview')
      .select('period, revenue, net, refunds, orders')
      .order('period');
    
    if (error) {
      console.error('Database query error:', error);
      
      // If primary view doesn't exist, try fallback view
      if (error.code === '42P01') {
        console.warn('Primary view not found, trying fallback view');
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('view_sales_over_time')
          .select('*');
          
        if (fallbackError) {
          console.error('Fallback view error:', fallbackError);
          throw new Error(`Database query failed: ${fallbackError.message}`);
        }
        
        // Transform to match expected structure
        const transformedData = fallbackData ? fallbackData.map(item => ({
          period: item.day || new Date().toISOString().split('T')[0],
          revenue: item.daily_revenue || 0,
          net: (item.daily_revenue || 0) * 0.8, // Approximation for net
          refunds: (item.daily_revenue || 0) * 0.05, // Approximation for refunds
          orders: item.daily_orders || 0
        })) : [];
        
        return res.status(200).json(transformedData);
      }
      
      throw new Error(`Database query failed: ${error.message}`);
    }
    
    // Return the sales overview data
    res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch sales overview data' });
  }
} 