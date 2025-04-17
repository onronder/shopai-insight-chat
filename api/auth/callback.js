import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.PROJECT_SUPABASE_URL;
const supabaseKey = process.env.PROJECT_SERVICE_ROLE_KEY;
const shopifyApiKey = process.env.PROJECT_SHOPIFY_API_KEY;
const shopifyApiSecret = process.env.PROJECT_SHOPIFY_API_SECRET;

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

    // For testing/development when credentials aren't set up yet
    if (!shopifyApiKey || !shopifyApiSecret || !supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Missing API credentials. Using mock auth flow.');
      
      // Redirect to welcome page
      return res.redirect('/welcome');
    }
    
    const { code, shop, state } = req.query;
    
    if (!code || !shop) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // In a real implementation, you would:
    // 1. Exchange the code for an access token using Shopify API
    // 2. Verify the shop is valid
    // 3. Create a session in your auth system
    
    // Example (simplified) token exchange with Shopify
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: shopifyApiKey,
        client_secret: shopifyApiSecret,
        code,
      }),
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponse.statusText}`);
    }
    
    const { access_token } = await tokenResponse.json();
    
    // Create a user session in Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // In a real implementation, you would:
    // 1. Look up the user by shop domain in your database
    // 2. If they exist, generate an auth token for them
    // 3. If they don't exist, create a new user record
    
    // For this example, create a test user session
    const { data: sessionData, error: sessionError } = await supabase.auth.signUp({
      email: `${shop.split('.')[0]}@example.com`,
      password: 'temp-password-' + Date.now(),
      options: {
        data: {
          shop_domain: shop,
          shop_access_token: access_token
        }
      }
    });
    
    if (sessionError) {
      throw new Error(`Failed to create user session: ${sessionError.message}`);
    }
    
    // Set auth cookie
    if (sessionData?.session?.access_token) {
      res.setHeader('Set-Cookie', `sb-token=${sessionData.session.access_token}; Path=/; HttpOnly; SameSite=Lax; Secure`);
    }
    
    // Redirect to welcome page
    res.redirect('/welcome');
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ error: error.message || 'Auth callback failed' });
  }
} 