// File: src/main.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize Sentry (optional)
import { initSentry } from '@/lib/sentry';
initSentry();

// ⚡ DO NOT initialize App Bridge here
// It will be handled inside pages/components based on need

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
