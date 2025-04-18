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
    const { risk_type, limit = 10 } = req.query;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Supabase credentials are not configured');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching inventory risks data...', { risk_type, limit });
    
    // Build the query
    let query = supabase
      .from('vw_inventory_risks')
      .select('product_id, product_title, variant_title, risk_type, inventory_level, reorder_point, sales_velocity');
    
    // Apply risk type filter if specified
    if (risk_type) {
      query = query.eq('risk_type', risk_type);
    }
    
    // Apply limit
    query = query.limit(parseInt(limit, 10));
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database query error:', error);
      
      // Try fallback view if the primary view doesn't exist
      if (error.code === '42P01') {
        console.warn('Primary view not found, trying fallback');
        
        // Try querying a different view with similar data
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('view_inventory_risks')
          .select('*')
          .limit(parseInt(limit, 10));
          
        if (fallbackError) {
          console.error('Fallback view error:', fallbackError);
          // If both views fail, return empty data with a structure that matches the expected output
          return res.status(200).json([]);
        }
        
        // Map fallback data to match expected structure
        const transformedData = fallbackData ? fallbackData.map(item => ({
          product_id: item.product_id || null,
          product_title: item.product_title || 'Unknown Product',
          variant_title: item.variant_title || 'Default Variant',
          risk_type: item.status || 'unknown',
          inventory_level: item.current_stock || 0,
          reorder_point: item.reorder_level || 0,
          sales_velocity: item.sales_rate || 0
        })) : [];
        
        return res.status(200).json(transformedData);
      }
      
      throw new Error(`Database query failed: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.warn('No inventory risks data found');
    } else {
      console.log(`Retrieved ${data.length} inventory risk items`);
    }

    // Return the inventory risks data
    res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch inventory risks data' });
  }
} 