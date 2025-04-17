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
      throw new Error('Supabase credentials are not configured');
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Query the inventory_risks view
    const { data, error } = await supabase
      .from('vw_inventory_risks')
      .select('product_id, product_title, variant_title, risk_type, inventory_level, reorder_point, sales_velocity')
      .order('risk_type', { ascending: true });
    
    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }
    
    // Return the inventory risks data
    res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch inventory risks data' });
  }
} 