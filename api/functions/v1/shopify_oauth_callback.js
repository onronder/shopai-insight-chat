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

    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Missing shop parameter' });
    }
    
    // For testing/development when credentials aren't set up yet
    if (!shopifyApiKey || !shopifyApiSecret) {
      console.warn('⚠️ Missing Shopify API credentials. Using mock auth flow.');
      
      // Create a mock session in Supabase
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Create a mock user for testing
        const { data: user, error: userError } = await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'password123',
        });
        
        if (userError) {
          // If sign in fails, try the test user signup flow
          const { data: newUser, error: signupError } = await supabase.auth.signUp({
            email: 'test@example.com',
            password: 'password123',
          });
          
          if (signupError) {
            console.error('Failed to create test user:', signupError);
          }
        }
      }
      
      // Redirect to welcome page
      return res.redirect('/welcome');
    }
    
    // In a real implementation, you would:
    // 1. Exchange the code for an access token
    // 2. Store the access token in your database
    // 3. Create a user session
    
    // Redirect to the Shopify OAuth page
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || req.headers.origin}/api/auth/callback`;
    const scopes = 'read_products,read_orders,read_customers,write_customers,write_products';
    const shopifyAuthUrl = `https://${shop}/admin/oauth/authorize?client_id=${shopifyApiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    res.redirect(shopifyAuthUrl);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: error.message || 'OAuth flow failed' });
  }
} 