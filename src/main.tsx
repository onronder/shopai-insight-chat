import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize Sentry monitoring
import { initSentry } from '@/lib/sentry';
initSentry();

// DO NOT initialize Shopify App Bridge globally here!

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
