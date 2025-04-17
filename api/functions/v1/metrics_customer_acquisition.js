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
      console.warn('⚠️ Using mock data for customer acquisition. Set PROJECT_SUPABASE_URL and PROJECT_SERVICE_ROLE_KEY in environment variables.');
      
      // Return consistent mock data for development
      data = [
        { period: 'Week 1', new_customers: 40 },
        { period: 'Week 2', new_customers: 35 },
        { period: 'Week 3', new_customers: 45 },
        { period: 'Week 4', new_customers: 30 },
        { period: 'Week 5', new_customers: 55 },
        { period: 'Week 6', new_customers: 60 }
      ];
    } else {
      // Create Supabase client with service role key
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Query the metrics_customer_acquisition view
      const { data: dbData, error } = await supabase
        .from('metrics_customer_acquisition')
        .select('*');
        
      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      data = dbData;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch customer acquisition data' });
  }
} 