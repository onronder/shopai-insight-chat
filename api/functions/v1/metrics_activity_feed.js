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
      console.warn('⚠️ Using mock data for activity feed. Set PROJECT_SUPABASE_URL and PROJECT_SERVICE_ROLE_KEY in environment variables.');
      
      // Return consistent mock data for development
      data = [
        {
          id: 1,
          action: 'New Order',
          details: 'Order #1234 was placed for $89.99',
          time: '10 minutes ago'
        },
        {
          id: 2,
          action: 'Product Update',
          details: 'Inventory for "Product A" was updated',
          time: '1 hour ago'
        },
        {
          id: 3,
          action: 'Customer Registration',
          details: 'New customer registered: john.doe@example.com',
          time: '3 hours ago'
        },
        {
          id: 4,
          action: 'Refund Processed',
          details: 'Refund processed for Order #1201',
          time: '5 hours ago'
        },
        {
          id: 5,
          action: 'Discount Created',
          details: 'New discount "SUMMER25" created',
          time: '1 day ago'
        }
      ];
    } else {
      // Create Supabase client with service role key
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Query the metrics_activity_feed view
      const { data: dbData, error } = await supabase
        .from('metrics_activity_feed')
        .select('*');
        
      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      data = dbData;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch activity feed data' });
  }
} 