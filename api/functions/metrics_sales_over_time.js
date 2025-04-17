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
      { name: 'Jan', sales: 4000, target: 4500 },
      { name: 'Feb', sales: 5000, target: 4500 },
      { name: 'Mar', sales: 3500, target: 4500 },
      { name: 'Apr', sales: 5500, target: 4500 },
      { name: 'May', sales: 6500, target: 5500 },
      { name: 'Jun', sales: 7000, target: 5500 },
      { name: 'Jul', sales: 6000, target: 5500 },
    ];

    res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
} 