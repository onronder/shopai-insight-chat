// File: src/main.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize Sentry monitoring
import { initSentry } from '@/lib/sentry';
initSentry();

// Important: DO NOT immediately initialize Shopify App Bridge here
// It should only be initialized inside specific components/pages when needed
// import { initializeShopifyAppBridge } from '@/lib/shopify-app-bridge';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
