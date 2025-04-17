# Products Page Analysis

## Page Overview

The Products page provides insights about product performance, inventory management, returns, and product lifecycle stages. It helps merchants understand which products are selling well, which ones need inventory management attention, and where product issues might exist.

## Components Structure

1. **ProductsHeader**
   - Contains time period selector and filtering controls
   - Controls data timeframe for all charts
   - May show summary metrics

2. **VariantSalesChart**
   - Chart showing sales by product variant
   - Highlights top-selling product variants
   - Helps identify most popular products

3. **InventoryRiskTable**
   - Table displaying products with inventory risks
   - May include products with:
     - Low stock levels
     - High stock but low sales (overstock)
     - Stock-outs
   - Helps with inventory management decisions

4. **ReturnRateChart**
   - Chart showing product return rates
   - Identifies products with quality or description issues
   - Helps improve product listings and quality control

5. **ProductLifecycleChart**
   - Chart showing products in different lifecycle stages
   - Categories may include: new, growing, mature, declining
   - Helps with product portfolio management

## Data Requirements

### VariantSalesData Interface
```typescript
export interface VariantSalesData {
  variant_title: string
  total_sales: number
}
```

### InventoryRiskItem Interface (Missing in current implementation)
```typescript
export interface InventoryRiskItem {
  product_id: string
  product_title: string
  variant_title: string
  risk_type: 'low_stock' | 'overstock' | 'stockout'
  inventory_level: number
  reorder_point?: number
  sales_velocity?: number
}
```

### ReturnRateItem Interface (Missing in current implementation)
```typescript
export interface ReturnRateItem {
  product_id: string
  product_title: string
  orders_count: number
  returns_count: number
  return_rate: number
}
```

### ProductLifecycleItem Interface (Missing in current implementation)
```typescript
export interface ProductLifecycleItem {
  lifecycle_stage: string
  product_count: number
  revenue_share: number
}
```

## API Endpoints Needed

1. `/functions/v1/metrics_variant_sales`
   - Returns array of VariantSalesData objects
   - Sales data for product variants
   - Powers the Variant Sales chart

2. `/functions/v1/metrics_inventory_risks`
   - Returns array of InventoryRiskItem objects (currently missing)
   - Products with inventory-related risks
   - Powers the Inventory Risk table

3. `/functions/v1/metrics_return_rates`
   - Returns array of ReturnRateItem objects (currently missing)
   - Return rates for products
   - Powers the Return Rate chart

4. `/functions/v1/metrics_product_lifecycle`
   - Returns array of ProductLifecycleItem objects (currently missing)
   - Products categorized by lifecycle stage
   - Powers the Product Lifecycle chart

## Database Views/Tables Needed

1. `vw_variant_sales`
   - Aggregates sales data by product variant
   - Calculates total sales for each variant

2. `vw_inventory_risks`
   - Identifies products with inventory risks
   - Calculates risk metrics

3. `vw_return_rates`
   - Calculates return rates for products
   - Identifies problematic products

4. `vw_product_lifecycle`
   - Categorizes products by lifecycle stage
   - Based on sales trends and launch date

## Issue: Missing Implementation

The current implementation of `useProductsData` is incomplete, only fetching data for the top-selling variants. The following components have no data source currently:

1. InventoryRiskTable
2. ReturnRateChart
3. ProductLifecycleChart

## Error Handling

- Loading state during data fetching
- Error state with retry capability
- Proper handling of empty datasets
- Fallback UI for when specific components can't load

## Potential Optimizations

1. Add filtering capabilities:
   - By product category
   - By supplier
   - By time period
   - By sales performance

2. Add inventory forecasting
3. Add pricing optimization recommendations
4. Include export functionality for product data
5. Add product bundling suggestions based on co-purchase data 