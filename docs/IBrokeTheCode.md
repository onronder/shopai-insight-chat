# IBrokeTheCode: System-Wide Fix Tracking

This document tracks all the fixes needed across the system layers to ensure proper functionality without changing business logic or adding static evaluations.

## Database Layer Fixes

### Dashboard Page
- [x] Verify `view_dashboard_summary` is properly accessed without modifications
- [x] Ensure all queries use `is_deleted IS NOT TRUE` filter consistently
- [x] Fix any ORDER BY clauses that reference aliases in dashboard views

### Analytics Page
- [x] Fix `vw_analytics_sales_overview` PostgreSQL compatibility without changing column structure
  - Keep original fields: period, revenue, net, refunds, orders
  - Fix GROUP BY/ORDER BY to use position or repeat expression
- [x] Fix `vw_analytics_funnel` to maintain original output structure
- [x] Fix `vw_analytics_customer_types` to keep original segmentation logic
- [x] Fix `vw_analytics_top_countries` PostgreSQL compatibility issues

### Products Page
- [x] Fix `vw_variant_sales` to maintain original column structure and calculations
- [x] Fix `vw_inventory_risks` ORDER BY syntax without changing risk classification logic
- [x] Fix `vw_return_rates` to maintain original return rate calculation method
- [x] Fix `vw_product_lifecycle` to preserve original lifecycle stage definitions

### Customers Page
- [x] Fix `vw_customer_segments` to maintain original segment definitions
- [x] Fix `vw_ltv_distribution` ORDER BY syntax without changing bucket definitions
  - Replace direct bucket reference with PostgreSQL-compatible alternative
- [x] Fix `vw_churn_candidates` to maintain original churn definition criteria
- [x] Fix `vw_repeat_customers` to keep original repeat customer logic

## API Layer Fixes (Edge Functions)

### Dashboard Endpoints
- [x] Verify dashboard API endpoints match view field names
- [x] Ensure proper error handling without changing response structure

### Analytics Endpoints
- [ ] Update `metrics_sales_overview.js` to handle view field names correctly
- [ ] Fix `metrics_funnel.js` to maintain consistent response structure
- [ ] Update `metrics_customer_types.js` to match original view field names
- [ ] Fix `metrics_top_countries.js` to preserve field mapping

### Products Endpoints
- [ ] Fix `metrics_variant_sales.js` to maintain field mapping with view
- [x] Update `metrics_inventory_risks.js` to preserve risk classification logic
- [ ] Fix `metrics_return_rates.js` to maintain return rate calculations
- [ ] Update `metrics_product_lifecycle.js` to preserve lifecycle definitions

### Customers Endpoints
- [ ] Fix `metrics_customer_segments.js` to match original segment definitions
- [x] Update `metrics_ltv_distribution.js` to handle bucket ordering correctly
- [ ] Fix `metrics_churn_candidates.js` to maintain original churn criteria
- [ ] Update `metrics_repeat_customers.js` to preserve repeat customer definition

## Data Hook Layer Fixes

### Dashboard Hooks
- [x] Verify `useDashboardData` correctly maps to API response fields
- [x] Ensure consistent error and loading state handling

### Analytics Hooks
- [ ] Fix `useAnalyticsData` to match API response field names
- [ ] Ensure loading states are handled properly
- [ ] Fix error handling to provide meaningful feedback
- [ ] Maintain all original data transformation logic

### Products Hooks
- [ ] Fix `useProductsData` to correctly map to API response fields
- [ ] Ensure data transformations match original business logic
- [ ] Preserve original filtering and sorting capabilities
- [ ] Fix error and loading state handling

### Customers Hooks
- [ ] Update `useCustomersData` to match API response structure
- [ ] Fix data transformations to preserve original logic
- [ ] Ensure consistent error handling across all customer data types
- [ ] Maintain all dynamic calculations

## Frontend Component Layer Fixes

### Dashboard Components
- [x] Verify all components map to correct data fields
- [x] Ensure loading states display appropriately
- [x] Fix any field mapping issues in component props

### Analytics Components
- [ ] Fix `SalesOverview` component to map to correct API data fields
- [ ] Update `Funnel` component data mapping
- [ ] Fix `CustomerTypes` component field mappings
- [ ] Update `TopCountries` component to match API response structure

### Products Components
- [ ] Fix `VariantSales` component to map to correct data fields
- [ ] Update `InventoryRisks` component to preserve risk classification display
- [ ] Fix `ReturnRates` component field mappings
- [ ] Ensure `ProductLifecycle` component maintains correct lifecycle visualization

### Customers Components
- [ ] Fix `CustomerSegments` component to match original segment definitions
- [x] Update `LTVDistribution` component to handle bucket ordering correctly
- [ ] Fix `ChurnCandidates` component to maintain original churn display
- [ ] Ensure `RepeatCustomers` component preserves original customer categorization

## Progress Tracking

### Step 1: Database Fixes
- [x] Create SQL migration files with syntax-only fixes
- [x] Test each view individually with sample data
- [x] Verify view outputs match original specifications

### Step 2: API Endpoint Fixes
- [x] Update edge functions to work with fixed views
- [x] Add consistent error handling without changing response structure
- [ ] Test API endpoints return correct field names and data types

### Step 3: Hook Layer Fixes
- [ ] Ensure hooks correctly map to API response fields
- [ ] Fix any data transformation issues
- [ ] Test hooks with mock API responses

### Step 4: Component Fixes
- [x] Update components to match hook data structures
- [ ] Fix any rendering issues
- [ ] Test components with sample data

### Step 5: Integration Testing
- [ ] Test complete data flow from database to UI
- [ ] Verify all pages display data correctly
- [ ] Ensure all dynamic functionality works as expected 