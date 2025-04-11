
/**
 * Application-wide constants
 */

// Time periods for analytics and reporting
export const TIME_PERIODS = {
  LAST_7_DAYS: 'last7',
  LAST_30_DAYS: 'last30',
  LAST_90_DAYS: 'last90',
  THIS_YEAR: 'year',
  CUSTOM: 'custom',
};

// Customer segments
export const CUSTOMER_SEGMENTS = {
  ALL: 'all',
  HIGH_VALUE: 'high-value',
  REPEAT: 'repeat',
  AT_RISK: 'at-risk',
  NEW: 'new',
};

// Chart colors - consistent across the application
export const CHART_COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Green
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884d8", // Purple
  "#82ca9d", // Light Green
  "#ffc658", // Gold
  "#8dd1e1", // Light Blue
  "#a4de6c", // Lime
  "#d0ed57", // Light Lime
];

// Chat message types
export const MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
};

// Application routes
export const ROUTES = {
  DASHBOARD: '/',
  WELCOME: '/welcome',
  ANALYTICS: '/analytics',
  CUSTOMERS: '/customers',
  ORDERS: '/orders',
  PRODUCTS: '/products',
  ASSISTANT: '/assistant',
  SETTINGS: '/settings',
  HELP: '/help',
};

// Store sync status types
export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};
