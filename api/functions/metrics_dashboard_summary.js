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
      {
        title: 'Total Revenue',
        value: '$1,234.56',
        change: '12%',
        trend: 'up',
        icon: 'DollarSign'
      },
      {
        title: 'New Customers',
        value: '120',
        change: '8%',
        trend: 'up',
        icon: 'Users'
      },
      {
        title: 'Orders',
        value: '90',
        change: '5%',
        trend: 'down',
        icon: 'ShoppingCart'
      },
      {
        title: 'Conversion Rate',
        value: '3.2%',
        change: '2%',
        trend: 'up',
        icon: 'TrendingUp'
      }
    ];

    res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
} 