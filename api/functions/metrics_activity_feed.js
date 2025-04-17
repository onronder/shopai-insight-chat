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

    res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed data' });
  }
} 