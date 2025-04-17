import { supabase } from '../../src/integrations/supabase/client';

export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    )

    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }
    
    // In a real implementation, you would query Supabase here
    // For now, we'll return mock data
    const data = [
      { name: 'Product A', value: 1200 },
      { name: 'Product B', value: 900 },
      { name: 'Product C', value: 800 },
      { name: 'Product D', value: 650 },
      { name: 'Product E', value: 400 }
    ];

    res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch product data' });
  }
} 