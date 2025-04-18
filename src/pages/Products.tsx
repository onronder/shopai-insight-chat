import React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { LoadingState } from "@/components/common/LoadingState"
import { ErrorState } from "@/components/ui/ErrorState"
import { ProductsHeader } from "@/components/products/ProductsHeader"
import { VariantSalesChart } from "@/components/products/VariantSalesChart"
import { InventoryRiskTable } from "@/components/products/InventoryRiskTable"
import { ReturnRateChart } from "@/components/products/ReturnRateChart"
import { ProductLifecycleChart } from "@/components/products/ProductLifecycleChart"
import { useProductsData, Timeframe } from "@/hooks/useProductsData"
import { SyncStatusBanner } from "@/components/common/SyncStatusBanner"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/EmptyState"
import { Card, CardContent } from "@/components/ui/card"

const ProductsPage: React.FC = () => {
  const {
    data,
    isLoading,
    loadingStates,
    error,
    errors,
    refetch,
    timeframe,
    setTimeframe,
    hasData
  } = useProductsData()

  // Initial loading state for the entire page
  if (isLoading) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <LoadingState message="Loading product analytics..." />
      </AppLayout>
    )
  }

  // Error state for the entire page
  if (error) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <ErrorState 
          title="Failed to load product insights" 
          description={error.message} 
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      </AppLayout>
    )
  }

  // Empty state if no data at all
  if (!hasData) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <EmptyState 
          title="No product data found" 
          description="We couldn't find any product insights yet. This could be because you haven't connected your store, or your store doesn't have any products with sales data."
          action={<Button onClick={() => refetch()}>Refresh Data</Button>}
        />
      </AppLayout>
    )
  }

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
  }

  return (
    <AppLayout>
      <SyncStatusBanner />
      <div className="grid gap-4">
        <ProductsHeader timeframe={timeframe} onTimeframeChange={handleTimeframeChange} />
        
        {/* Top Selling Variants */}
        {loadingStates.topSelling ? (
          <Card>
            <CardContent className="p-6 flex justify-center items-center h-[300px]">
              <LoadingState message="Loading top selling variants..." />
            </CardContent>
          </Card>
        ) : errors.topSelling ? (
          <Card>
            <CardContent className="p-6">
              <ErrorState 
                title="Failed to load top selling variants" 
                description={errors.topSelling.message} 
                action={<Button size="sm" onClick={() => refetch()}>Retry</Button>}
              />
            </CardContent>
          </Card>
        ) : (
          <VariantSalesChart data={data.topSelling} />
        )}
        
        {/* Inventory Risks */}
        {loadingStates.inventoryRisks ? (
          <Card>
            <CardContent className="p-6 flex justify-center items-center h-[300px]">
              <LoadingState message="Loading inventory risk data..." />
            </CardContent>
          </Card>
        ) : errors.inventoryRisks ? (
          <Card>
            <CardContent className="p-6">
              <ErrorState 
                title="Failed to load inventory risks" 
                description={errors.inventoryRisks.message} 
                action={<Button size="sm" onClick={() => refetch()}>Retry</Button>}
              />
            </CardContent>
          </Card>
        ) : (
          <InventoryRiskTable data={data.inventoryRisks} />
        )}
        
        {/* Return Rates */}
        {loadingStates.returnRates ? (
          <Card>
            <CardContent className="p-6 flex justify-center items-center h-[300px]">
              <LoadingState message="Loading return rate data..." />
            </CardContent>
          </Card>
        ) : errors.returnRates ? (
          <Card>
            <CardContent className="p-6">
              <ErrorState 
                title="Failed to load return rates" 
                description={errors.returnRates.message} 
                action={<Button size="sm" onClick={() => refetch()}>Retry</Button>}
              />
            </CardContent>
          </Card>
        ) : (
          <ReturnRateChart data={data.returnRates} />
        )}
        
        {/* Product Lifecycle */}
        {loadingStates.lifecycle ? (
          <Card>
            <CardContent className="p-6 flex justify-center items-center h-[300px]">
              <LoadingState message="Loading product lifecycle data..." />
            </CardContent>
          </Card>
        ) : errors.lifecycle ? (
          <Card>
            <CardContent className="p-6">
              <ErrorState 
                title="Failed to load product lifecycle" 
                description={errors.lifecycle.message} 
                action={<Button size="sm" onClick={() => refetch()}>Retry</Button>}
              />
            </CardContent>
          </Card>
        ) : (
          <ProductLifecycleChart data={data.lifecycle} />
        )}
      </div>
    </AppLayout>
  )
}

export default ProductsPage
