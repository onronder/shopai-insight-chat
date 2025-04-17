import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.PROJECT_SUPABASE_URL;
const supabaseKey = process.env.PROJECT_SERVICE_ROLE_KEY;

// Fallback to mock data if environment variables are not set
// Only use in development/testing - remove in production
const useMockData = !supabaseUrl || !supabaseKey;

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
    
    let data;
    
    if (useMockData) {
      console.warn('⚠️ Using mock data for sales over time. Set PROJECT_SUPABASE_URL and PROJECT_SERVICE_ROLE_KEY in environment variables.');
      
      // Return consistent mock data for development
      data = [
        { name: 'Jan', sales: 4000, target: 4500 },
        { name: 'Feb', sales: 5000, target: 4500 },
        { name: 'Mar', sales: 3500, target: 4500 },
        { name: 'Apr', sales: 5500, target: 4500 },
        { name: 'May', sales: 6500, target: 5500 },
        { name: 'Jun', sales: 7000, target: 5500 },
        { name: 'Jul', sales: 6000, target: 5500 },
      ];
    } else {
      // Create Supabase client with service role key
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Query the metrics_sales_over_time view
      const { data: dbData, error } = await supabase
        .from('metrics_sales_over_time')
        .select('*');
        
      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      data = dbData;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch sales data' });
  }
} 