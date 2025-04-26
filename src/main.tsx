// File: src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize Sentry monitoring
import { initSentry } from '@/lib/sentry';
initSentry();

// Shopify App Bridge
import { initializeShopifyAppBridge } from '@/lib/shopify-app-bridge';

// Initialize Shopify App Bridge on app load
const shopifyApp = initializeShopifyAppBridge();

// (Optional) Fetch session token for secured backend calls
// import { fetchSessionToken } from '@/lib/shopify-app-bridge';
// fetchSessionToken(shopifyApp).then(token => console.log('Session token:', token));

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
